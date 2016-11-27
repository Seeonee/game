// Simple player avatar placeholder.
var Avatar = function(game, graphics) {
    // Constants, for now.
    this.MAX_SPEED = 300;
    this.TILT_THRESHOLD = 0.15;
    this.POINT_TILT_THRESHOLD_MODIFIER = 3.2;
    this.POINT_SNAP_RADIUS = 3;

    this.game = game;
    this.graphics = graphics;
    // Set up graphics and physics.
    Phaser.Sprite.call(this, game, 0, 0);
    this.graphics.createGraphics(this);
    // Track which point we're starting on.
    this.destination = undefined;
    this.path = undefined;
    this.point = undefined;
};

Avatar.prototype = Object.create(Phaser.Sprite.prototype);
Avatar.prototype.constructor = Avatar;

// Move at a given angle and ratio of speed (0 to 1).
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
    if (ratio > 0) {
        if (this.point) {
            var path = this.point.getPath(angle);
            if (path) {
                this.path = path;
                this.destination = this.path.getCounterpoint(this.point);
                this.point = undefined;
            }
        } else if (this.path) {
            this.destination = this.path.getPoint(angle);
        }
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
            this.body.velocity.x = ratio * this.MAX_SPEED * Math.sin(a2);
            this.body.velocity.y = ratio * this.MAX_SPEED * Math.cos(a2);
        }
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
    this.graphics.move(this);
};

// Optional physics debug view.
Avatar.prototype.update = function() {
    // this.game.debug.body(this);
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
