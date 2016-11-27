// Handles rendering for avatar objects.
var AvatarGraphicsKey
 = function() {
    // Constants, for now.
    this.SMOKE_LIFETIME = 900; // ms
    this.SMOKE_RATIO_THRESHOLD = 0.75;
};

// Figure out what we look like. Also enables physics.
AvatarGraphicsKey.prototype.createGraphics = function(avatar) {
    avatar.anchor.setTo(0.5, 0.5);
    // Initialize our graphics.
    avatar.keyplate = avatar.addChild(game.make.sprite(0, 0, 'keyplate'));
    var yOffset = -avatar.keyplate.height / 1.65;
    avatar.keyplate.y = yOffset;
    avatar.keyplate.anchor.setTo(0.5, 0.5);
    // Initialize our keyhole.
    avatar.keyhole = avatar.addChild(game.make.sprite(0, 0, 'keyhole'));
    avatar.keyhole.y = (-avatar.keyhole.height / 4.5) + yOffset;
    avatar.keyhole.anchor.setTo(0.5, 0.5);
    // Enable physics.
    avatar.game.physics.enable(avatar, Phaser.Physics.ARCADE);
    // For fun, adjust bounding box to match keyplate,
    // with a little slack on the bottom.
    var w = avatar.body.width;
    var h = avatar.body.height;
    var w2 = avatar.keyplate.width;
    var h2 = avatar.keyplate.height;
    var x = (w - w2) / 2;
    var y = avatar.keyplate.y + (h - h2) / 2;
    var dh = (w2 / 2) - ((h2 + y) / 2);
    avatar.body.setSize(w2, h2 + dh, x, y);
    this.createSmokeEmitter(avatar);
};

// Create a smoke emitter. Hooray!
AvatarGraphicsKey.prototype.createSmokeEmitter = function(avatar) {
    // Let's get really fancy and add a smoke trail while moving.
    avatar.smokeEmitter = avatar.game.add.emitter(0, 0, 100);
    avatar.smokeEmitter.gravity = 150;
    avatar.smokeEmitter.setXSpeed(-50, 50);
    avatar.smokeEmitter.setYSpeed(-30, -70);
    avatar.smokeEmitter.setRotation(-50, 50);
    avatar.smokeEmitter.setScale(1, 0.2, 1, 0.2, this.SMOKE_LIFETIME,
        Phaser.Easing.Cubic.Out);
    avatar.smokeEmitter.makeParticles('smoke');
};

// Update an avatar's smoke emitter. Hooray!
AvatarGraphicsKey.prototype.move = function(avatar) {
    var ratio = distanceBetweenPoints(0, 0, avatar.body.velocity.x, avatar.body.velocity.y);
    ratio /= avatar.MAX_SPEED;
    if (ratio >= this.SMOKE_RATIO_THRESHOLD) {
        avatar.smokeEmitter.x = avatar.x;
        avatar.smokeEmitter.y = avatar.y - 10;
        if (!avatar.smokeEmitter.on) {
            avatar.smokeEmitter.start(false, this.SMOKE_LIFETIME, 50); // every 50ms
        }
    }
    if (ratio < this.SMOKE_RATIO_THRESHOLD) {
        avatar.smokeEmitter.on = false;
    }
};

// Called by the main game's preload().
AvatarGraphicsKey.preload = function(game) {
    game.load.image('keyplate', 'assets/keyplate.png');
    game.load.image('keyhole', 'assets/keyhole.png');
    game.load.image('smoke', 'assets/smoke.png');
};
