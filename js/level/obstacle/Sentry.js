// Sentry foe.
var Sentry = function(name, x, y) {
    Obstacle.call(this, name, x, y);
    this.readyTime = -1;
};

Sentry.TYPE = 'foe-sentry';
Sentry.prototype = Object.create(Obstacle.prototype);
Sentry.prototype.constructor = Sentry;

// Set up our factory.
Obstacle.load.factory[Sentry.TYPE] = Sentry;

// Constants.
Sentry.Y_OFFSET = -30;
Sentry.BODY_HITBOX = 40;
Sentry.TRAP_RADIUS = 125;
Sentry.CHARGE_TIME = 2000; // ms
Sentry.KILL_TIME = 400; // ms
Sentry.KILL_TIME_ACTUAL = 50; // ms
Sentry.RECHARGE_TIME = 2000; // ms


// Draw loop.
Sentry.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        var y = this.y + Sentry.Y_OFFSET;
        this.game = tier.game;
        this.renderNeeded = false;
        this.bodyhitbox = new Hitbox(this.game, tier, this,
            this.x, this.y, Sentry.BODY_HITBOX);
        this.game.state.getCurrentState().z.mg.add(this.bodyhitbox);
        this.traphitbox = new Hitbox(this.game, tier, this,
            this.x, y, Sentry.TRAP_RADIUS * 0.9, true);
        this.game.state.getCurrentState().z.mg.add(this.traphitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.sentry = new SentrySprite(this.game, ap.x, ap.y,
            tier.palette);
        tier.image.addChild(this.sentry);
    } else {
        this.bodyhitbox.updateTier(tier);
        this.traphitbox.updateTier(tier);
        this.sentry.setPalette(tier.palette);
    }
};

// Collision check.
Sentry.prototype.obstruct = function(avatar, hitbox) {
    if (hitbox === this.traphitbox) {
        if (this.lethal) {
            avatar.smite({ x: this.x, y: this.y + Sentry.Y_OFFSET });
        }
        if (this.game.time.now > this.readyTime) {
            this.readyTime = this.game.time.now +
                Sentry.CHARGE_TIME + Sentry.RECHARGE_TIME;
            this.tripTrap();
        }
        return false;
    } else {
        return true;
    }
};

// Spring the trap.
Sentry.prototype.tripTrap = function() {
    this.sentry.chargeUp(this.blast, this);
};

// Spring the trap.
Sentry.prototype.blast = function() {
    this.lethal = true;
    this.game.camera.flash();
    this.sentry.coolDown();
    this.game.time.events.add(Sentry.KILL_TIME_ACTUAL, function() {
        this.lethal = false;
    }, this);
};

// Delete ourself.
Sentry.prototype.delete = function() {
    if (this.sentry) {
        Utils.destroy(this.sentry);
        this.sentry = undefined;
    }
    if (this.bodyhitbox) {
        this.bodyhitbox.removeCollision();
        Utils.destroy(this.bodyhitbox);
        this.bodyhitbox = undefined;
    }
    if (this.traphitbox) {
        this.traphitbox.removeCollision();
        Utils.destroy(this.traphitbox);
        this.traphitbox = undefined;
    }
};

// Editor details.
Sentry.prototype.getDetails = function() {
    return Obstacle.prototype.getDetails.call(this);
};

// Write our JSON conversion.
Sentry.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    return result;
};

// Load our JSON representation.
Sentry.load = function(game, name, json) {
    return new Sentry(name, json.x, json.y);
};
