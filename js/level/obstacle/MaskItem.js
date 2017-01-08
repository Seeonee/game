// The avatar's mask.
var MaskItem = function(name, x, y, subtype) {
    CarriedItem.call(this, name, x, y, subtype);
};

MaskItem.TYPE = 'mask';
MaskItem.ALL_TYPES = ['hours', 'death', 'wisdom', 'sky', 'mischief'];
MaskItem.prototype = Object.create(CarriedItem.prototype);
MaskItem.prototype.constructor = MaskItem;

// Set up our factory.
Obstacle.load.factory[MaskItem.TYPE] = MaskItem;


// Create our sprite.
MaskItem.prototype.createSprite = function(tier, x, y) {
    this.altar = new MaskAltar(this.game, x, y, tier.palette);
    tier.image.addBackgroundChild(this.altar);
    return new MaskItemSprite(this.game, x, y,
        this.subtype, tier.palette);
};

// Collision check.
MaskItem.prototype.obstruct = function(avatar, hitbox) {
    this.hitbox.removeCollision();
    this.hitbox = undefined;
    this.citem.pickUp(avatar);
    this.altar.shine(avatar);
    return false;
};

// Delete ourself.
MaskItem.prototype.delete = function() {
    CarriedItem.prototype.delete.call(this);
    if (this.altar) {
        Utils.destroy(this.altar);
        this.altar = undefined;
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
