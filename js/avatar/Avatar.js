// Simple player avatar placeholder.
var Avatar = function(game, graphics, level) {
    this.game = game;
    this.level = level;
    this.tier = undefined;
    this.graphics = graphics;
    // Set up graphics and physics.
    Phaser.Sprite.call(this, game, 0, 0);
    this.game.state.getCurrentState().z.player.add(this);
    this.graphics.createGraphics(this);
    this.body.collideWorldBounds = true;
    // Track which point we're starting on.
    this.destination = undefined;
    this.path = undefined;
    this.point = undefined;

    this.level.avatar = this;
    this.snapToStartingPoint();
    this.setColor(this.tier.palette);
    this.tierMeter = new TierMeter(this.game, this.level);

    this.attached = undefined;
    this.events.onAttach = new Phaser.Signal();
    this.events.onDetach = new Phaser.Signal();
    this.events.onAttachEdit = new Phaser.Signal();
};

Avatar.prototype = Object.create(Phaser.Sprite.prototype);
Avatar.prototype.constructor = Avatar;

// A bunch of constants.
Avatar.MAX_SPEED = 300;
Avatar.TILT_THRESHOLD = 0.15;
Avatar.POINT_TILT_THRESHOLD_MODIFIER = 3.2;
Avatar.POINT_SNAP_RADIUS = 3;
Avatar.MIN_VELOCITY = 0.1;
Avatar.TILT_TOTAL_ANGLE = Math.PI / 2;
Avatar.TILT_FULLSPEED_ANGLE = Avatar.TILT_TOTAL_ANGLE * 0.75;
Avatar.TILT_PARTIAL_ANGLE =
    Avatar.TILT_TOTAL_ANGLE -
    Avatar.TILT_FULLSPEED_ANGLE;
Avatar.HOLD_TIME = 250; // ms

// Update anytime the settings change.
Avatar.prototype.updateSettings = function(settings) {
    this.tierMeter.updateSettings(settings);
};

// Figure out where we're starting.
Avatar.prototype.snapToStartingPoint = function() {
    var vals = this.level.start.split('-');
    this.tier = this.level.tierMap[vals[0]];
    this.point = this.tier.pointMap[vals[1]];
    var gp = this.tier.translateInternalPointToGamePoint(
        this.point.x, this.point.y);
    this.x = gp.x;
    this.y = gp.y;
};

// Move at a given angle and ratio of speed (0 to 1).
Avatar.prototype.move = function(angle, ratio) {
    var hold = false;
    if (this.holdTime) {
        if (this.game.time.now < this.holdTime) {
            hold = true;
        } else {
            this.holdTime = undefined;
        }
    }
    if (hold) {
        var gp = this.tier.translateInternalPointToGamePoint(
            this.destination.x, this.destination.y);
        this.x = gp.x;
        this.y = gp.y;
    } else {
        ratio = this.adjustRatio(ratio);
        this.updateDestination(angle, ratio);
        this.headTowardsDestination(ratio, angle);
    }
    this.graphics.move(this);
    this.updateAttachment();
};

// Make sure there's enough tilt to justify movement.
Avatar.prototype.adjustRatio = function(ratio) {
    var threshold = Avatar.TILT_THRESHOLD;
    if (this.point) {
        threshold *= Avatar.POINT_TILT_THRESHOLD_MODIFIER;
    }
    if (ratio < threshold) {
        ratio = 0;
    } else if (ratio < 1) {
        ratio = (ratio - threshold) * (1 / (1 - threshold));
    }
    return ratio;
};

// Figure out where we are, and where we're headed.
Avatar.prototype.updateDestination = function(angle, ratio) {
    var ip = this.tier.translateGamePointToInternalPoint(this.x, this.y);
    this.destination = undefined;
    this.fakeAngle = undefined;
    if (ratio > 0) {
        if (this.point) {
            var path = this.point.getPath(angle);
            if (path) {
                this.path = path;
                this.destination = this.path.getCounterpoint(this.point);
                if (ip.x != this.point.x || ip.y != this.point.y) {
                    // We've overshot our current point,
                    // but we're still headed towards another point.
                    // Find how far we overshot, then "orbit" around 
                    // our current point so that we've now overshot 
                    // in the direction of our next point.
                    var xP0 = this.point.x;
                    var yP0 = this.point.y;
                    var xMe = ip.x;
                    var yMe = ip.y;
                    // How far we overshot.
                    var dMe = Utils.distanceBetweenPoints(xP0, yP0, xMe, yMe);
                    var xP2 = this.destination.x;
                    var yP2 = this.destination.y;
                    // The direction we *want* to overshoot towards.
                    var aP2 = Utils.angleBetweenPoints(xP0, yP0, xP2, yP2);
                    var dx2 = dMe * Math.sin(aP2);
                    var dy2 = dMe * Math.cos(aP2);
                    var gp = this.tier.translateInternalPointToGamePoint(
                        xP0 + dx2, yP0 + dy2);
                    this.x = gp.x;
                    this.y = gp.y;
                }
                this.point = undefined;
            } else {
                // We may have overshot and be tilting the joystick, 
                // but not tilting towards any valid paths.
                // In that case, snap back to our point.
                var gp = this.tier.translateInternalPointToGamePoint(
                    this.point.x, this.point.y);
                this.x = gp.x;
                this.y = gp.y;
            }
        } else if (this.path) {
            var target = this.path.getPoint(angle, ip.x, ip.y);
            if (target) {
                this.destination = target.point;
                this.fakeAngle = target.fakeAngle;
            }
        }
    } else if (this.point) {
        // We may have overshot and then released the joystick.
        // Go ahead and make sure we've snapped back.
        var gp = this.tier.translateInternalPointToGamePoint(
            this.point.x, this.point.y);
        this.x = gp.x;
        this.y = gp.y;
    }
};

// Head towards our destination point, 
// if we have one.
Avatar.prototype.headTowardsDestination = function(ratio, angle) {
    if (!this.game.settings.edit) {
        var obstacles = this.game.state.getCurrentState().obstacles;
        if (obstacles.overlap(this)) {
            this.setVelocity(0, 0, true);
            return;
        }
    }
    this.xOld = this.x;
    this.yOld = this.y;
    var ip = this.tier.translateGamePointToInternalPoint(this.x, this.y);
    if (this.destination) {
        var a2 = Utils.angleBetweenPoints(
            ip.x, ip.y, this.destination.x, this.destination.y);
        var distance = Utils.distanceBetweenPoints(
            ip.x, ip.y, this.destination.x, this.destination.y);
        if (distance <= Avatar.POINT_SNAP_RADIUS) {
            // Snap to a point.
            this.setVelocity(0, 0);
            var gp = this.tier.translateInternalPointToGamePoint(
                this.destination.x, this.destination.y);
            this.x = gp.x;
            this.y = gp.y;
            this.point = this.destination;
            this.path = undefined;
            if (this.destination.shouldHold()) {
                this.holdTime = this.game.time.now + Avatar.HOLD_TIME;
            }
        } else {
            // If we're not lined up well with our target angle,
            // reduce tilt accordingly.
            var a4 = (this.fakeAngle) ? this.fakeAngle : a2;
            var a3 = Utils.getBoundedAngleDifference(angle, a4) -
                Avatar.TILT_FULLSPEED_ANGLE;
            if (a3 > 0) {
                ratio *= 1 - (a3 / Avatar.TILT_PARTIAL_ANGLE);
            }
            var vx = this.roundVelocity(ratio * Avatar.MAX_SPEED * Math.sin(a2));
            var vy = this.roundVelocity(ratio * Avatar.MAX_SPEED * Math.cos(a2));
            this.setVelocity(vx, vy);
        }
    } else {
        this.setVelocity(0, 0);
    }
};

// Set velocity.
Avatar.prototype.setVelocity = function(vx, vy, keepBodyEnabled) {
    this.body.enable = keepBodyEnabled || vx != 0 || vy != 0;
    this.body.velocity.x = vx;
    this.body.velocity.y = vy;
};

// Eliminate microscopic velocities.
Avatar.prototype.roundVelocity = function(velocity) {
    // return velocity;
    return (Math.abs(velocity) >= Avatar.MIN_VELOCITY) ? velocity : 0;
};

// Figure out if what we're attached to has changed.
// Note that this will fire during render; if you don't 
// want to handle it until update, it's your job as the 
// recipient to defer processing.
// Anyone who's registered for our signals via 
// avatar.events.onAttach.add or avatar.events.onDetach.add 
// will also get their callbacks invoked now; they'll be passed 
// the avatar, the newly attached object, and the previously 
// attached object.
Avatar.prototype.updateAttachment = function() {
    if (this.game.settings.edit) {
        this.events.onAttachEdit.dispatch();
        return;
    }
    var old = this.attached;
    this.attached = this.point ? this.point : this.path;
    if (this.attached === old) {
        return;
    }
    if (old && old.notifyDetached) {
        old.notifyDetached(this, this.attached);
    }
    if (this.attached && this.attached.notifyAttached) {
        this.attached.notifyAttached(this, old);
    }
    this.events.onDetach.dispatch(this, this.attached, old);
    this.events.onAttach.dispatch(this, this.attached, old);
};

// Update our gfx color palette.
Avatar.prototype.setColor = function(palette) {
    this.graphics.setColor(this, palette);
};

// Masq bobble.
Avatar.prototype.setBobble = function(bobble) {
    this.graphics.setBobble(this, bobble);
};

// Masq press.
Avatar.prototype.setPressed = function(pressed) {
    this.graphics.setPressed(this, pressed);
};

// Optional physics debug view.
Avatar.prototype.update = function() {
    // this.game.debug.body(this);
    // this.game.debug.spriteCoords(this);
};
