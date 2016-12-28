// Door object.
var Door = function(game, name, x, y, type, subtype) {
    Obstacle.call(this, game, name, x, y, type);
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
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y, Door.D);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.door = new DoorSprite(this.game, ap.x, ap.y,
            this.subtype, tier.palette);
        tier.image.addChild(this.door);
    } else {
        this.door.setPalette(tier.palette);
    }
};

// Debug code.
Door.prototype.obstruct = function(avatar) {
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

// Write our JSON conversion.
Door.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    result.subtype = this.subtype;
    return result;
};

// Load our JSON representation.
Door.load = function(game, name, json) {
    return new Door(game, name, json.x, json.y,
        json.type, json.subtype);
};
