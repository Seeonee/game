// A point that allows transitioning to other tiers.
var PortalPoint = function(name, x, y, direction) {
    Point.call(this, name, x, y);
    this.direction = direction;
    this.emitters = [];
    this.z = Point.Z + 1;
};

PortalPoint.TYPE = 'portal';
PortalPoint.prototype = Object.create(Point.prototype);
PortalPoint.prototype.constructor = PortalPoint;

// Set up our factory.
Point.load.factory[PortalPoint.TYPE] = PortalPoint;

// Some more constants.
PortalPoint.RADIUS = 35;
PortalPoint.PARTICLE_COUNT = 15;
PortalPoint.PARTICLE_GRAVITY = -150;
PortalPoint.PARTICLE_SPEED = -75;
PortalPoint.PARTICLE_ALPHA_TIME = 1000; // ms
PortalPoint.PARTICLE_LIFETIME = 1000; // ms
PortalPoint.PARTICLE_FREQUENCY = 200; // ms

PortalPoint.FLASH_DIMENSION = 32;
PortalPoint.FLASH_DELAY = 0; // ms
PortalPoint.FLASH_COLOR = '#ffffff';
PortalPoint.Y_SCALE = 30;
PortalPoint.X_SCALE1 = 8;
PortalPoint.X_SCALE2 = 0.1;
PortalPoint.FLASH_IN = 50; // ms
PortalPoint.FLASH_HOLD = 100; // ms
PortalPoint.FLASH_OUT = 150; // ms
PortalPoint.FLASH_TOTAL = PortalPoint.FLASH_IN +
    PortalPoint.FLASH_HOLD +
    PortalPoint.FLASH_OUT;


// During our first draw, we create the emitters.
PortalPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
    this.tier = tier;
    this.game = tier.game;
    var c = tier.bitmap.context;
    var x = this.x - r / 2;
    var y = this.y - r / 2;
    var r = PortalPoint.RADIUS;
    Utils.clearArc(c, this.x, this.y, r / 2);
    if (!this.drawn) {
        this.b = this.game.add.bitmapData(2 * r, 2 * r);
        var c2 = this.b.context;
        c2.strokeStyle = c.strokeStyle;
        c2.lineWidth = c.lineWidth;
        c2.beginPath();
        c2.arc(r, r, r / 2, 0, 2 * Math.PI, false);
        c2.stroke();
        var gp = tier.translateInternalPointToGamePoint(
            this.x, this.y);
        this.image = this.game.add.image(gp.x, gp.y, this.b);
        this.image.anchor.setTo(0.5, 0.5);
        this.game.state.getCurrentState().z.level.tier().add(this.image);
        // Triangles center weirdly; shift to look better.
        gp.y -= Math.sign(this.direction) * 2;
        this.image2 = this.game.add.image(gp.x, gp.y, 'smoke');
        this.image2.anchor.setTo(0.5, 0.5);
        if (this.direction < 0) {
            this.image2.rotation = Math.PI;
        }
        this.image2
        this.game.state.getCurrentState().z.level.tier().add(this.image2);
        this.drawn = true;
        this.emitters.push(this.createEmitter(tier, gp.x, gp.y));
    }
};

// Create an emitter.
PortalPoint.prototype.createEmitter = function(tier, x, y) {
    emitter = tier.game.add.emitter(
        tier.game.world.centerX, tier.game.world.centerY,
        PortalPoint.PARTICLE_COUNT);
    emitter.emitX = x;
    emitter.emitY = y;
    tier.game.state.getCurrentState().z.fg.tier().add(emitter);
    emitter.gravity = PortalPoint.PARTICLE_GRAVITY;
    emitter.setRotation(0, 0);
    emitter.setXSpeed(0, 0);
    var vy = PortalPoint.PARTICLE_SPEED;
    emitter.setYSpeed(vy, vy);
    emitter.setAlpha(1, 0, PortalPoint.PARTICLE_ALPHA_TIME,
        Phaser.Easing.Cubic.In);
    emitter.setScale(1, 1);
    emitter.makeParticles('smoke');
    // We may eventually want tint, or some way of 
    // denoting the tier color you'll shift to.
    // emitter.tint = tier.palette.c1.i;
    // emitter.forEach(function(particle) {
    //     particle.tint = particle.parent.tint;
    // });
    if (this.direction < 0) {
        emitter.rotation = Math.PI;
        emitter.emitX *= -1;
        emitter.emitY *= -1;
    }
    return emitter;
};

// Turn on/off our particle shower.
PortalPoint.prototype.setEmitting = function(emit) {
    for (var i = 0; i < this.emitters.length; i++) {
        if (emit) {
            this.emitters[i].emitParticle();
            this.emitters[i].start(false,
                PortalPoint.PARTICLE_LIFETIME,
                PortalPoint.PARTICLE_FREQUENCY);
        } else {
            this.emitters[i].on = false;
        }
    }
};

// Light up the portal.
PortalPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    this.setEmitting(true);
    this.flash();
};

// Horizontal flash on the portal position.
PortalPoint.prototype.flash = function() {
    var gp = this.tier.translateInternalPointToGamePoint(
        this.x, this.y);
    this._flash(this.game, gp.x, gp.y);
};

// Horizontal flash on the portal position.
PortalPoint.prototype._flash = function(game, x, y) {
    var delay = PortalPoint.FLASH_DELAY;
    var d = PortalPoint.FLASH_DIMENSION;
    var b = game.add.bitmapData(d, d);
    var c = b.context;
    c.fillStyle = PortalPoint.FLASH_COLOR;
    c.beginPath();
    c.fillRect(0, 0, d, d);
    var img = game.add.image(x, y, b);
    img.anchor.setTo(0.5, 0.5);
    game.state.getCurrentState().z.fg.add(img);
    img.scale.setTo(PortalPoint.X_SCALE1, PortalPoint.Y_SCALE);
    img.alpha = 0;

    var t = game.add.tween(img);
    t.to({ alpha: 1 }, PortalPoint.FLASH_IN,
        Phaser.Easing.Cubic.Out, true, delay);
    var t2 = game.add.tween(img);
    t2.to({ alpha: 0 }, PortalPoint.FLASH_OUT,
        Phaser.Easing.Quadratic.Out, false,
        PortalPoint.FLASH_HOLD);
    t.chain(t2);
    var t3 = game.add.tween(img.scale);
    t3.img = img;
    t3.to({ x: PortalPoint.X_SCALE2 },
        PortalPoint.FLASH_TOTAL,
        Phaser.Easing.Cubic.Out, true, delay);
    t3.onComplete.add(function(a, tween) {
        tween.img.destroy();
    });

    // var t4 = game.add.tween(this.tier.image);
    // t4.to({ y: this.tier.image.y + 15 },
    //     250, Phaser.Easing.Sinusoidal.InOut, true);
    // var t41 = game.add.tween(this.tier.image);
    // t41.to({ y: this.tier.image.y - 500 },
    //     250, Phaser.Easing.Sinusoidal.In, false);
    // t4.chain(t41);
    // var g = game.state.getCurrentState().z.level.tier();
    // var t5 = game.add.tween(g);
    // t5.to({ alpha: 0 },
    //     300, Phaser.Easing.Cubic.Out, true, 200);
};

// Lights out for the portal.
PortalPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    this.setEmitting(false);
};


// Delete our emitters.
PortalPoint.prototype.delete = function() {
    for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].destroy();
    }
};

// JSON conversion of a portal.
PortalPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = PortalPoint.TYPE;
    result.direction = this.direction;
    return result;
};

// Load a JSON representation of a portal.
PortalPoint.load = function(game, name, json) {
    return new PortalPoint(name, json.x, json.y, json.direction);
};
