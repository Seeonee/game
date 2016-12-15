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

// During our first draw, we create the emitters.
PortalPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
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
