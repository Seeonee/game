

// Simple player avatar placeholder.
var Avatar = function(game, point) {
    // Constants, for now.
    this.MAX_SPEED = 300;
    this.TILT_THRESHOLD = 0.15;
    this.POINT_TILT_THRESHOLD_MODIFIER = 3.2;
    this.POINT_SNAP_RADIUS = 3;
    this.COLOR = '#2CABD9';
    this.RADIUS = 10;

    this.game = game;

    // Don't call superclass constructor just yet;
    // let createGraphics() do it for us.
    this.createGraphics(point.x, point.y);

    // Enable physics.
    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    // Track which point we're starting on.
    this.destination = undefined;
    this.path = undefined;
    this.point = point;
};

Avatar.prototype = Object.create(Phaser.Sprite.prototype);
Avatar.prototype.constructor = Avatar;

// Figure out what we look like.
Avatar.prototype.createGraphics = function(x, y) {
    // Initialize our graphics.
    // We used to just paint a circle, hence the RADIUS here.
    var bitmap = game.add.bitmapData(2 * this.RADIUS, 2 * this.RADIUS);
    // bitmap.context.fillStyle = this.COLOR;
    // bitmap.context.arc(this.RADIUS, this.RADIUS, this.RADIUS, 0, 2 * Math.PI, false);
    // bitmap.context.fill();
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5, 0.5);

    this.keyplate = this.addChild(game.make.sprite(0, 0, 'keyplate'));
    var yOffset = -this.keyplate.height / 1.65;
    this.keyplate.y = yOffset;
    this.keyplate.anchor.setTo(0.5, 0.5);

    // Initialize our keyhole.
    this.keyhole = this.addChild(game.make.sprite(0, 0, 'keyhole'));
    this.keyhole.y = (-this.keyhole.height / 4.5) + yOffset;
    this.keyhole.anchor.setTo(0.5, 0.5);
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
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        return;
    } else if (ratio < 1) {
        ratio = (ratio - threshold) * (1 / (1 - threshold));
    }

    // Figure out where we are, and where we're headed.
    this.destination = undefined;
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
};

Avatar.prototype.update = function() {
    this.game.debug.body(this);
};


