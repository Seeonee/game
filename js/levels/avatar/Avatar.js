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
    this.game.add.existing(this);

    this.attached = undefined;
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
Avatar.TILT_PARTIAL_ANGLE = Avatar.TILT_TOTAL_ANGLE - Avatar.TILT_FULLSPEED_ANGLE;

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
    // Make sure there's enough tilt to justify movement.
    var threshold = Avatar.TILT_THRESHOLD;
    if (this.point) {
        threshold *= Avatar.POINT_TILT_THRESHOLD_MODIFIER;
    }
    if (ratio < threshold) {
        ratio = 0;
    } else if (ratio < 1) {
        ratio = (ratio - threshold) * (1 / (1 - threshold));
    }

    // Figure out where we are, and where we're headed.
    var ip = this.tier.translateGamePointToInternalPoint(this.x, this.y);
    this.destination = undefined;
    fakeAngle = undefined;
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
                fakeAngle = target.fakeAngle;
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

    // Recompute our relative internal point, in case it's changed.
    var ip = this.tier.translateGamePointToInternalPoint(this.x, this.y);

    // Start going there.
    if (this.destination) {
        var a2 = Utils.angleBetweenPoints(
            ip.x, ip.y, this.destination.x, this.destination.y);
        var distance = Utils.distanceBetweenPoints(
            ip.x, ip.y, this.destination.x, this.destination.y);
        if (distance <= Avatar.POINT_SNAP_RADIUS) {
            // Snap to a point.
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            var gp = this.tier.translateInternalPointToGamePoint(
                this.destination.x, this.destination.y);
            this.x = gp.x;
            this.y = gp.y;
            this.point = this.destination;
            this.path = undefined;
        } else {
            // If we're not lined up well with our target angle,
            // reduce tilt accordingly.
            var a4 = (fakeAngle) ? fakeAngle : a2;
            var a3 = Utils.getBoundedAngleDifference(angle, a4) -
                Avatar.TILT_FULLSPEED_ANGLE;
            if (a3 > 0) {
                ratio *= 1 - (a3 / Avatar.TILT_PARTIAL_ANGLE);
            }
            this.body.velocity.x = this.roundVelocity(ratio * Avatar.MAX_SPEED * Math.sin(a2));
            this.body.velocity.y = this.roundVelocity(ratio * Avatar.MAX_SPEED * Math.cos(a2));
        }
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
    this.graphics.move(this);
    this.updateAttachment();
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
Avatar.prototype.updateAttachment = function() {
    var attached = this.point ? this.point : this.path;
    if (this.attached === attached) {
        return;
    }
    if (this.attached && this.attached.notifyDetached) {
        this.attached.notifyDetached(this);
    }
    this.attached = attached;
    if (this.attached && this.attached.notifyAttached) {
        this.attached.notifyAttached(this);
    }
};

// Optional physics debug view.
Avatar.prototype.update = function() {
    // this.game.debug.body(this);
    // this.game.debug.spriteCoords(this);
};
