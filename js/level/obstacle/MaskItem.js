// The avatar's mask.
var MaskItem = function(name, x, y, subtype) {
    CarriedItem.call(this, name, x, y, subtype);
};

MaskItem.TYPE = 'mask';
MaskItem.ALL_TYPES = ['keyhole'];
MaskItem.prototype = Object.create(CarriedItem.prototype);
MaskItem.prototype.constructor = MaskItem;

// Set up our factory.
Obstacle.load.factory[MaskItem.TYPE] = MaskItem;


// Create our sprite.
MaskItem.prototype.createSprite = function(x, y, palette) {
    return new MaskItemSprite(this.game, x, y, this.subtype, palette);
};

// Collision check.
MaskItem.prototype.obstruct = function(avatar) {
    this.hitbox.removeCollision();
    this.hitbox = undefined;
    this.citem.pickUp(avatar);
    return false;
};

// Delete ourself.
MaskItem.prototype.delete = function() {
    if (this.citem) {
        Utils.destroy(this.citem);
        this.citem = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
};

// Editor details.
MaskItem.prototype.getDetails = function() {
    return Obstacle.prototype.getDetails.call(this) +
        '\nmask (' + this.subtype + ')';
};

// Load our JSON representation.
MaskItem.load = function(game, name, json) {
    return new MaskItem(name, json.x, json.y,
        json.subtype);
};
