// The avatar's mask.
var MaskItem = function(name, x, y, subtype) {
    CarriedItem.call(this, name, x, y, subtype);
    this.pickedUp = false;
    this.fallenOff = false;
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
    this.pickedUp = true;
    if (avatar.currentMaskObject) {
        avatar.currentMaskObject.fallenOff = true;
    }
    avatar.currentMaskObject = this;
    this.hitbox.removeCollision();
    this.citem.pickUp(avatar);
    this.altar.shine(avatar);
    return false;
};

// Save progress.
MaskItem.prototype.saveProgress = function(p) {
    // If we've never been picked up, don't save progress.
    if (!this.pickedUp) {
        return;
    }
    p[this.name] = { pickedUp: true };
    // We'll never restore to a point before pickup,
    // which means we're now totally done with our hitbox.
    if (this.hitbox) {
        Utils.destroy(this.hitbox);
        this.hitbox = undefined;
    }
    if (this.fallenOff) {
        // Don't delete altar!
        CarriedItem.prototype.delete.call(this);
        p[this.name].fallenOff = true;
    }
};

// Restore progress.
MaskItem.prototype.restoreProgress = function(p) {
    // If we still haven't been picked up,
    // don't change anything.
    if (!this.pickedUp) {
        return;
    }

    var myp = p[this.name];
    var pickedUp = myp && myp.pickedUp ? myp.pickedUp : false;
    var fallenOff = myp && myp.fallenOff ? myp.fallenOff : false;

    var avatar = this.tier.level.avatar;
    if (pickedUp && !fallenOff) {
        avatar.currentMaskObject = this;
    }
    if (fallenOff == this.fallenOff && pickedUp == this.pickedUp) {
        return;
    }
    this.pickedUp = pickedUp;
    this.fallenOff = fallenOff;

    if (pickedUp && !fallenOff) {
        // Put the mask back on.
        this.citem.donAgain();
        avatar.masq = this.citem.masq.spriteC;
        avatar.addChild(avatar.masq);
    } else if (!pickedUp) {
        this.citem.setPalette(this.tier.palette);
        var ip = this.tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = this.tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.citem.drop();
        this.altar.startHands();
        this.tier.image.addChild(this.citem);
        this.hitbox.addCollision();
    }
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
