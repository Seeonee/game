// A point that has a key floating over it.
var KeyPoint = function(name, x, y) {
    Point.call(this, name, x, y);
    this.tkey = undefined;
    this.pickedUp = false;
};

KeyPoint.TYPE = 'key';
KeyPoint.prototype = Object.create(Point.prototype);
KeyPoint.prototype.constructor = KeyPoint;

// Set up our factory.
Point.load.factory[KeyPoint.TYPE] = KeyPoint;

// During our first draw, we create the actual key.
KeyPoint.prototype.draw = function(tier) {
    if (!(this.tkey)) {
        var game = tier.game;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.tkey = new TKey(game, ap.x, ap.y, tier.palette);
        tier.image.addChild(this.tkey);
    }
    Point.prototype.draw.call(this, tier);
};

// Pick up the key.
KeyPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.pickedUp) {
        return;
    }
    avatar.tierMeter.addKey();
    this.tkey.pickUp();
    this.pickedUp = true;
};

// Called when the tier updates.
KeyPoint.prototype.update = function() {
    if (!this.pickedUp && this.tkey) {
        this.tkey.update();
    }
};

// Delete our key.
KeyPoint.prototype.delete = function() {
    this.tkey.kill();
};

// JSON conversion of a key.
KeyPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = KeyPoint.TYPE;
    return result;
};

// Load a JSON representation of a portal.
KeyPoint.load = function(game, name, json) {
    return new KeyPoint(name, json.x, json.y);
};
