// A point that allows transitioning to other tiers.
var PortalPoint = function(name, x, y, direction, to, enabled) {
    Point.call(this, name, x, y, enabled);
    this.direction = direction;
    this.emitters = [];
    this.z = Point.Z + 1;
    this.to = to;
    this.istateName = PortalIState.NAME;
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
    this.tier = tier;
    this.game = tier.game;
    this.wipePoint(tier.bitmap.context);
    if (!this.drawn) {
        this.drawn = true;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.gate = new PGate(this.game, ap.x, ap.y,
            tier.palette, this.direction);
        this.tier.image.addChild(this.gate);
        var gp = tier.translateInternalPointToGamePoint(
            this.x, this.y);
        gp.y -= Math.sign(this.direction) * 2;
        this.emitters.push(this.createEmitter(tier, gp.x, gp.y));
    }
};

// Wipe a spot on the tier bitmap.
PortalPoint.prototype.wipePoint = function(c) {
    var r = PortalPoint.RADIUS;
    var x = this.x - r / 2;
    var y = this.y - r / 2;
    Utils.clearArc(c, this.x, this.y, r / 2);
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
    if (this.direction < 0) {
        emitter.rotation = Math.PI;
        emitter.emitX *= -1;
        emitter.emitY *= -1;
    }
    return emitter;
};

// Set our enabled state.
PortalPoint.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    Point.prototype.setEnabled.call(this, enabled);
    if (this.attached) {
        this.setEmitting(this.enabled);
        this.avatar.tierMeter.fade(this.enabled);
    }
    this.gate.setEnabled(enabled);
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
    if (this.enabled) {
        avatar.tierMeter.fade(true);
        this.setEmitting(true);
    }
};

// Lights out for the portal.
PortalPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    if (this.enabled) {
        avatar.tierMeter.fade(false);
        this.setEmitting(false);
    }
};


// Delete our emitters.
PortalPoint.prototype.delete = function() {
    for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].destroy();
    }
    this.gate.delete();
};

// JSON conversion of a portal.
PortalPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = PortalPoint.TYPE;
    result.direction = this.direction;
    result.to = this.to;
    if (!this.enabled) {
        result.enabled = this.enabled;
    }
    return result;
};

// Load a JSON representation of a portal.
PortalPoint.load = function(game, name, json) {
    return new PortalPoint(name, json.x, json.y,
        json.direction, json.to, json.enabled);
};
