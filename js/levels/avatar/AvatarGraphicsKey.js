// Handles rendering for avatar objects.
var AvatarGraphicsKey = function(game) {
    this.game = game;
};

// Constants, for now.
AvatarGraphicsKey.SMOKE_LIFETIME = 900; // ms
AvatarGraphicsKey.SMOKE_RATIO_THRESHOLD = 0.75;

// Figure out what we look like. Also enables physics.
AvatarGraphicsKey.prototype.createGraphics = function(avatar) {
    avatar.anchor.setTo(0.5, 0.5);
    // Initialize our graphics.
    avatar.keyplate = avatar.addChild(
        this.game.make.sprite(0, 0, 'keyplate'));
    var yOffset = -avatar.keyplate.height / 1.65;
    avatar.keyplate.y = yOffset;
    avatar.keyplate.anchor.setTo(0.5, 0.5);
    // Initialize our keyhole.
    this.setMasq(avatar, new AvatarMasq(game, 'keyhole', -55));
    // Enable physics.
    this.game.physics.enable(avatar, Phaser.Physics.ARCADE);
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

// Update our draw color.
AvatarGraphicsKey.prototype.setColor = function(avatar, palette) {
    this.c1 = palette.c1;
    this.c2 = palette.c2;
    avatar.keyplate.tint = this.c1.i;
    avatar.masq.tint = this.c2.i;
    avatar.smokeEmitter.tint = this.c1.i;
    avatar.smokeEmitter.forEach(function(particle) {
        particle.tint = particle.parent.tint;
    });
};

// Put on a mask!
AvatarGraphicsKey.prototype.setMasq = function(avatar, masq) {
    if (avatar.masq) {
        avatar.removeChild(avatar.masq);
    }
    var slide = 5;
    avatar.masq = avatar.addChild(masq.spriteC);
    avatar.masq.y = masq.yOffset + slide;
    avatar.masq.scale.setTo(masq.scale);
    this.game.add.tween(avatar.masq).to({ y: masq.yOffset },
        300, Phaser.Easing.Cubic.Out, true);
};

// Create a smoke emitter. Hooray!
AvatarGraphicsKey.prototype.createSmokeEmitter = function(avatar) {
    // Let's get really fancy and add a smoke trail while moving.
    avatar.smokeEmitter = this.game.add.emitter(0, 0, 100);
    avatar.game.state.getCurrentState().z.player.add(avatar.smokeEmitter);
    avatar.smokeEmitter.gravity = 150;
    avatar.smokeEmitter.setXSpeed(-50, 50);
    avatar.smokeEmitter.setYSpeed(-30, -70);
    avatar.smokeEmitter.setRotation(-50, 50);
    avatar.smokeEmitter.setScale(1, 0.2, 1, 0.2,
        AvatarGraphicsKey.SMOKE_LIFETIME,
        Phaser.Easing.Cubic.Out);
    avatar.smokeEmitter.makeParticles('smoke');
};

// Update an avatar's smoke emitter. Hooray!
AvatarGraphicsKey.prototype.move = function(avatar) {
    var ratio = Utils.distanceBetweenPoints(0, 0, avatar.body.velocity.x, avatar.body.velocity.y);
    ratio /= Avatar.MAX_SPEED;
    if (ratio >= AvatarGraphicsKey.SMOKE_RATIO_THRESHOLD) {
        avatar.smokeEmitter.x = avatar.x;
        avatar.smokeEmitter.y = avatar.y - 10;
        if (!avatar.smokeEmitter.on) {
            avatar.smokeEmitter.start(false,
                AvatarGraphicsKey.SMOKE_LIFETIME, 50); // every 50ms
        }
    }
    if (ratio < AvatarGraphicsKey.SMOKE_RATIO_THRESHOLD) {
        avatar.smokeEmitter.on = false;
    }
};

// A mask that can be attached to the avatar.
// Named to avoid clashing with sprite.mask.
var AvatarMasq = function(game, name, yOffset, scale) {
    this.name = name;
    this.spriteC = game.make.sprite(0, 0, name + '_c');
    this.spriteC.anchor.setTo(0.5);
    this.spriteW = this.spriteC.addChild(game.make.sprite(0, 0, name + '_w'));
    this.spriteW.anchor.setTo(0.5);
    this.yOffset = yOffset;
    this.scale = (scale) ? scale : 1;
};

// Called by the main game's create().
AvatarMasq.create = function(game) {
    AvatarMasq.KEYHOLE = new AvatarMasq(game, 'keyhole', -55);
    AvatarMasq.HERNE = new AvatarMasq(game, 'herne', -61);
    AvatarMasq.NORWIFE = new AvatarMasq(game, 'norwife', -55);
    AvatarMasq.RAGNA = new AvatarMasq(game, 'ragna', -62);
    AvatarMasq.DUNLEVY = new AvatarMasq(game, 'dunlevy', -55);
};
