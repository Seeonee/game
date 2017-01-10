// An item that the avatar can pick up.
var CarriedItem = function(name, x, y, subtype) {
    Obstacle.call(this, name, x, y);
    this.subtype = subtype;
    this.pickedUp = false;
    this.usedUp = false;
};

CarriedItem.TYPE = 'item';
CarriedItem.ALL_TYPES = ['key', 'lightning'];
CarriedItem.prototype = Object.create(Obstacle.prototype);
CarriedItem.prototype.constructor = CarriedItem;

// Set up our factory.
Obstacle.load.factory[CarriedItem.TYPE] = CarriedItem;


// Draw loop.
CarriedItem.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.tier = tier;
        this.game = tier.game;
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.citem = this.createSprite(tier, ap.x, ap.y);
        tier.image.addChild(this.citem);
    } else {
        this.hitbox.updateTier(tier);
        this.citem.setPalette(tier.palette);
    }
};

// Create our sprite.
CarriedItem.prototype.createSprite = function(tier, x, y) {
    return new CarriedItemSprite(this.game, x, y,
        this.subtype, tier.palette);
};

// Collision check.
CarriedItem.prototype.obstruct = function(avatar, hitbox) {
    if (!avatar.held) {
        this.pickedUp = true;
        this.avatar = avatar;
        avatar.held = this;
        this.hitbox.removeCollision();
        this.citem.pickUp(avatar);
    }
    return false;
};

// Drop/use/extinguish the item.
CarriedItem.prototype.useUp = function() {
    this.usedUp = true;
    if (this.citem) {
        this.avatar.held = undefined;
        this.citem.useUp();
    }
};

// Save progress.
CarriedItem.prototype.saveProgress = function(p) {
    // If we've never been picked up, don't save progress.
    if (!this.pickedUp) {
        return;
    }
    p[this.name] = { pickedUp: true };

    // If we've already been used up, even restoring 
    // to this point still won't change that fact.
    // So, we get to remain fully and easily dead.
    if (this.usedUp) {
        p[this.name].usedUp = true;
        return;
    }
};

// Restore progress.
CarriedItem.prototype.restoreProgress = function(p) {
    // If we still haven't been picked up,
    // don't change anything.
    if (!this.pickedUp) {
        return;
    }

    var myp = p[this.name];
    var pickedUp = myp && myp.pickedUp ? myp.pickedUp : false;
    var usedUp = myp && myp.usedUp ? myp.usedUp : false;
    if (usedUp == this.usedUp && pickedUp == this.pickedUp) {
        return;
    }
    this.pickedUp = pickedUp;
    this.usedUp = usedUp;

    var avatar = this.tier.level.avatar;
    // The only cases that matter are:
    if (!usedUp && pickedUp) {
        // We're currently used up, but we're restoring 
        // to when we were held. That requires unhiding our 
        // sprite and reattaching it to the avatar.
        avatar.held = this;
        this.citem.rehold();
        avatar.addChild(this.citem);
    }
    if (!usedUp && !pickedUp) {
        // We're restoring to before we were picked up.
        // That requires detaching from the avatar and 
        // returning to our original coords, as well as 
        // possibly resuscitating (which we've done already).
        this.citem.setPalette(this.tier.palette);
        var ip = this.tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = this.tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.citem.drop();
        this.tier.image.addChild(this.citem);
        this.hitbox.addCollision();
    }
};

// Delete ourself.
CarriedItem.prototype.delete = function() {
    if (this.avatar && this.avatar.held === this) {
        this.avatar.held = undefined;
    }
    if (this.citem) {
        Utils.destroy(this.citem);
        this.citem = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        Utils.destroy(this.hitbox);
        this.hitbox = undefined;
    }
};

// Editor details.
CarriedItem.prototype.getDetails = function() {
    return Obstacle.prototype.getDetails.call(this) + '\n' +
        '(' + this.subtype + ')';
};

// Write our JSON conversion.
CarriedItem.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    result.subtype = this.subtype;
    return result;
};

// Load our JSON representation.
CarriedItem.load = function(game, name, json) {
    return new CarriedItem(name, json.x, json.y,
        json.subtype);
};
