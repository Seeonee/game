// Door object.
var Door = function(name, x, y, subtype) {
    Obstacle.call(this, name, x, y);
    this.subtype = subtype;
};

Door.TYPE = 'door';
Door.prototype = Object.create(Obstacle.prototype);
Door.prototype.constructor = Door;

// Set up our factory.
Obstacle.load.factory[Door.TYPE] = Door;


// Draw loop.
Door.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.game = tier.game;
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y, DoorSprite.D);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.door = new DoorSprite(this.game, ap.x, ap.y,
            this.subtype, tier.palette);
        tier.image.addChild(this.door);
    } else {
        this.hitbox.updateTier(tier);
        this.door.setPalette(tier.palette);
    }
};

// Collision check.
Door.prototype.obstruct = function(avatar, hitbox) {
    // Cheat and look for keys for the next tier up.
    // I.e. keys we've picked up on this tier.
    if (avatar.held && avatar.held.subtype == this.subtype) {
        avatar.held.useUp();
        this.hitbox.removeCollision();
        this.hitbox = undefined;
        this.door.unlock();
        return false;
    }
    return true;
};

// Delete ourself.
Door.prototype.delete = function() {
    if (this.door) {
        Utils.destroy(this.door);
        this.door = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
};

// Editor details.
Door.prototype.getDetails = function() {
    return Obstacle.prototype.getDetails.call(this) + '\n' +
        '(' + this.subtype + ')';
};

// Write our JSON conversion.
Door.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    result.subtype = this.subtype;
    return result;
};

// Load our JSON representation.
Door.load = function(game, name, json) {
    return new Door(name, json.x, json.y,
        json.subtype);
};
