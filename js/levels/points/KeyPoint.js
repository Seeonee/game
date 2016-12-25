// A point that has a key floating over it.
var KeyPoint = function(name, x, y) {
    Point.call(this, name, x, y, true);
    this.tkey = undefined;
};

KeyPoint.TYPE = 'key';
KeyPoint.prototype = Object.create(Point.prototype);
KeyPoint.prototype.constructor = KeyPoint;

// Set up our factory.
Point.load.factory[KeyPoint.TYPE] = KeyPoint;

// During our first draw, we create the actual key.
KeyPoint.prototype.draw = function(tier) {
    if (!this.tkey) {
        var game = tier.game;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.tkey = new TKey(game, ap.x, ap.y, tier.palette);
        tier.image.addChild(this.tkey);
    } else {
        this.tkey.updatePalette(tier.palette);
    }
    Point.prototype.draw.call(this, tier);
};

// Called on tier fade.
KeyPoint.prototype.fadingIn = function(tier) {
    this.tkey.setPaused(false);
};
// Called on tier fade.
KeyPoint.prototype.fadedOut = function(tier) {
    if (this.tkey) {
        this.tkey.setPaused(true);
    }
};

// Pick up the key.
KeyPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.tkey.pickedUp) {
        return;
    }
    avatar.tierMeter.addKey();
    this.tkey.pickUp();
};

// Delete our key.
KeyPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    Utils.destroy(this.tkey);
};

// Editor details.
KeyPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'key';
};

// JSON conversion of a key.
KeyPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    delete result.enabled;
    result.type = KeyPoint.TYPE;
    return result;
};

// Load a JSON representation of a portal.
KeyPoint.load = function(game, name, json) {
    return new KeyPoint(name, json.x, json.y);
};
