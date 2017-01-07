// Circling fireball trap.
var Fireball = function(name, x, y,
    leash, speedRatio, clockwise, startAnglePercentage,
    returnAnglePercentage) {
    Obstacle.call(this, name, x, y);
    this.leash = leash;
    if (leash && leash != Fireball.DEFAULT_LEASH) {
        this.radius = leash;
    } else {
        this.radius = Fireball.DEFAULT_LEASH;
    }
    this.speedRatio = speedRatio != undefined ? speedRatio : 1;
    this.clockwise = clockwise != undefined ? clockwise : true;

    this.startAnglePercentage = startAnglePercentage;
    if (startAnglePercentage != undefined) {
        this.startAngle = 2 * Math.PI * startAnglePercentage;
    } else {
        this.startAngle = 0;
    }

    this.returnAnglePercentage = returnAnglePercentage;
    if (returnAnglePercentage != undefined) {
        this.returnAngle = 2 * Math.PI * returnAnglePercentage;
        this.rotation = this.returnAngle;
    } else {
        this.rotation = this.startAngle + 2 * Math.PI;
    }
    if (!this.clockwise) {
        this.rotation = this.rotation - 2 * Math.PI;
    }

    this.percentage = Math.abs(
        (this.rotation - this.startAngle) / (2 * Math.PI));
    this.yoyo = this.returnAngle;
    this.time = this.percentage * Fireball.TIME / this.speedRatio;
};

Fireball.TYPE = 'foe-fireball';
Fireball.prototype = Object.create(Obstacle.prototype);
Fireball.prototype.constructor = Fireball;

Fireball.ALL_RADII = [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500];
Fireball.ALL_SPEEDS = [0.1, 0.2, 0.25, 0.5, 0.75, 1];
Fireball.ALL_ANGLES = [0.125, 0.25, 0.33, 0.5, 0.66, 0.75, 1];

// Set up our factory.
Obstacle.load.factory[Fireball.TYPE] = Fireball;

// Constants.
Fireball.HITBOX = 30;
Fireball.DEFAULT_LEASH = 100;
Fireball.TIME = 2000;


// Draw loop.
Fireball.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.game = tier.game;
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.gx, this.gy, Fireball.HITBOX);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.fireball = new FireballSprite(this, ap.x, ap.y,
            tier.palette);
        tier.image.addChild(this.fireball);
    } else {
        this.hitbox.updateTier(tier);
        this.fireball.setPalette(tier.palette);
    }
};

// Collision check.
Fireball.prototype.obstruct = function(avatar, hitbox) {
    var p = this.fireball.getOrbCoords();
    var x = this.gx + p.x;
    var y = this.gy + p.y;
    var d = Utils.distanceBetweenPoints(avatar.x, avatar.y, x, y);
    if (d < Fireball.HITBOX) {
        avatar.smite({ x: x, y: y });
    }
    return false;
};

// Delete ourself.
Fireball.prototype.delete = function() {
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
    if (this.fireball) {
        Utils.destroy(this.fireball);
        this.fireball = undefined;
    }
};

// Editor details.
Fireball.prototype.getDetails = function() {
    return Obstacle.prototype.getDetails.call(this);
};

// Write our JSON conversion.
Fireball.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);

    return result;
};

// Load our JSON representation.
Fireball.load = function(game, name, json) {
    return new Fireball(name, json.x, json.y,
        json.leash, json.speedRatio, json.clockwise,
        json.startAnglePercentage, json.returnAnglePercentage);
};
