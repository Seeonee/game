// An item that the avatar can pick up.
var CarriedItem = function(game, name, x, y, type, subtype) {
    Obstacle.call(this, game, name, x, y, type);
    this.subtype = subtype;
};

CarriedItem.TYPE = 'item';
CarriedItem.prototype = Object.create(Obstacle.prototype);
CarriedItem.prototype.constructor = CarriedItem;

// Set up our factory.
Obstacle.load.factory[CarriedItem.TYPE] = CarriedItem;


// Draw loop.
CarriedItem.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.citem = new CarriedItemSprite(this.game, ap.x, ap.y,
            this.subtype, tier.palette);
        tier.image.addChild(this.citem);
    } else {
        this.citem.setPalette(tier.palette);
    }
};

// Debug code.
CarriedItem.prototype.obstruct = function(avatar) {
    if (!avatar.held) {
        avatar.held = this;
        this.hitbox.removeCollision();
        this.hitbox = undefined;
        this.citem.pickUp(avatar);
    }
    return false;
};

// Drop/use/extinguish the item.
CarriedItem.prototype.useUp = function() {
    if (this.citem) {
        this.citem.useUp();
        this.citem = undefined;
    }
};

// Delete ourself.
CarriedItem.prototype.delete = function() {
    if (this.citem) {
        Utils.destroy(this.citem);
        this.citem = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
};

// Write our JSON conversion.
CarriedItem.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    result.subtype = this.subtype;
    return result;
};

// Load our JSON representation.
CarriedItem.load = function(game, name, json) {
    return new CarriedItem(game, name, json.x, json.y,
        json.type, json.subtype);
};
