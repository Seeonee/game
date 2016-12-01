// Simple player avatar placeholder.
var Avatar = function(game, graphics) {
    // Constants, for now.
    this.MAX_SPEED = 300;
    this.TILT_THRESHOLD = 0.15;
    this.POINT_TILT_THRESHOLD_MODIFIER = 3.2;
    this.POINT_SNAP_RADIUS = 3;
    this.MIN_VELOCITY = 0.1;
    this.TILT_TOTAL_ANGLE = Math.PI / 2;
    this.TILT_FULLSPEED_ANGLE = this.TILT_TOTAL_ANGLE * 0.75;
    this.TILT_PARTIAL_ANGLE = this.TILT_TOTAL_ANGLE - this.TILT_FULLSPEED_ANGLE;

    this.game = game;
    this.graphics = graphics;
    // Set up graphics and physics.
    Phaser.Sprite.call(this, game, 0, 0);
    this.graphics.createGraphics(this);
    this.body.collideWorldBounds = true;
    // Track which point we're starting on.
    this.destination = undefined;
    this.path = undefined;
    this.point = undefined;
};

Avatar.prototype = Object.create(Phaser.Sprite.prototype);
Avatar.prototype.constructor = Avatar;

// Figure out where we're starting.
Avatar.prototype.setStartingPoint = function(point) {
    this.point = point;
    this.x = point.x;
    this.y = point.y;
};

// Move at a given angle and ratio of speed (0 to 1).
Avatar.prototype.move = function(angle, ratio) {
    // Make sure there's enough tilt to justify movement.
    var threshold = this.TILT_THRESHOLD;
    if (this.point) {
        threshold *= this.POINT_TILT_THRESHOLD_MODIFIER;
    }
    if (ratio < threshold) {
        ratio = 0;
    } else if (ratio < 1) {
        ratio = (ratio - threshold) * (1 / (1 - threshold));
    }

    // Figure out where we are, and where we're headed.
    this.destination = undefined;
    fakeAngle = undefined;
    if (ratio > 0) {
        if (this.point) {
            var path = this.point.getPath(angle);
            if (path) {
                this.path = path;
                this.destination = this.path.getCounterpoint(this.point);
                if (this.x != this.point.x || this.y != this.point.y) {
                    // We've overshot our current point,
                    // but we're still headed towards another point.
                    // Find how far we overshot, then "orbit" around 
                    // our current point so that we've now overshot 
                    // in the direction of our next point.
                    var xP0 = this.point.x;
                    var yP0 = this.point.y;
                    var xMe = this.x;
                    var yMe = this.y;
                    // How far we overshot.
                    var dMe = distanceBetweenPoints(xP0, yP0, xMe, yMe);
                    var xP2 = this.destination.x;
                    var yP2 = this.destination.y;
                    // The direction we *want* to overshoot towards.
                    var aP2 = angleBetweenPoints(xP0, yP0, xP2, yP2);
                    var dx2 = dMe * Math.sin(aP2);
                    var dy2 = dMe * Math.cos(aP2);
                    this.x = xP0 + dx2;
                    this.y = yP0 + dy2;
                }
                this.point = undefined;
            } else {
                // We may have overshot and be tilting the joystick, 
                // but not tilting towards any valid paths.
                // In that case, snap back to our point.
                this.x = this.point.x;
                this.y = this.point.y;
            }
        } else if (this.path) {
            var target = this.path.getPoint(angle, this.x, this.y);
            if (target) {
                this.destination = target.point;
                fakeAngle = target.fakeAngle;
            }
        }
    } else if (this.point) {
        // We may have overshot and then released the joystick.
        // Go ahead and make sure we've snapped back.
        this.x = this.point.x;
        this.y = this.point.y;
    }

    // Start going there.
    if (this.destination) {
        var a2 = angleBetweenPoints(
            this.x, this.y, this.destination.x, this.destination.y);
        var distance = distanceBetweenPoints(
            this.x, this.y, this.destination.x, this.destination.y);
        if (distance <= this.POINT_SNAP_RADIUS) {
            // Snap to a point.
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.x = this.destination.x;
            this.y = this.destination.y;
            this.point = this.destination;
            this.path = undefined;
        } else {
            // If we're not lined up well with our target angle,
            // reduce tilt accordingly.
            var a4 = (fakeAngle) ? fakeAngle : a2;
            var a3 = getBoundedAngleDifference(angle, a4) - this.TILT_FULLSPEED_ANGLE;
            if (a3 > 0) {
                ratio *= 1 - (a3 / this.TILT_PARTIAL_ANGLE);
            }
            this.body.velocity.x = this.roundVelocity(ratio * this.MAX_SPEED * Math.sin(a2));
            this.body.velocity.y = this.roundVelocity(ratio * this.MAX_SPEED * Math.cos(a2));
        }
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
    this.graphics.move(this);
};

// Eliminate microscopic velocities.
Avatar.prototype.roundVelocity = function(velocity) {
    // return velocity;
    return (Math.abs(velocity) >= this.MIN_VELOCITY) ? velocity : 0;
};

// Optional physics debug view.
Avatar.prototype.update = function() {
    // this.game.debug.body(this);
    // this.game.debug.spriteCoords(this);
};


// Some fancy tweens that might be fun later.
// var delay = 1000;
// this.game.add.tween(this.keyhole).to(
//     {rotation: 3*Math.PI/4}, 1000, Phaser.Easing.Back.InOut, true, delay + 0);
// this.game.add.tween(this.keyplate).to(
//     {height: 0, width: 0}, 500, Phaser.Easing.Back.In, true, delay + 475);
// this.game.add.tween(this.scale).to(
//     {x: 2, y: 2}, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

// this.keyhole.rotation = Math.PI / 4 + this.game.math.angleBetween(
//     this.x + this.keyhole.x, this.y + (this.keyhole.y * this.scale.y), 
//     this.game.input.activePointer.x, this.game.input.activePointer.y);
