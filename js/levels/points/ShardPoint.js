// A point that has a shard floating over it.
var ShardPoint = function(name, x, y) {
    Point.call(this, name, x, y, true);
    this.shard = undefined;
};

ShardPoint.TYPE = 'shard';
ShardPoint.prototype = Object.create(Point.prototype);
ShardPoint.prototype.constructor = ShardPoint;

// Set up our factory.
Point.load.factory[ShardPoint.TYPE] = ShardPoint;

// During our first draw, we create the actual shard.
ShardPoint.prototype.draw = function(tier) {
    if (!this.shard) {
        var game = tier.game;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.shard = new Shard(game, ap.x, ap.y, tier.palette);
        tier.image.addChild(this.shard);
    } else {
        this.shard.updatePalette(tier.palette);
    }
    Point.prototype.draw.call(this, tier);
};

// Called on tier fade.
ShardPoint.prototype.fadingIn = function(tier) {
    this.shard.setPaused(false);
};
// Called on tier fade.
ShardPoint.prototype.fadedOut = function(tier) {
    if (this.shard) {
        this.shard.setPaused(true);
    }
};

// Pick up the shard.
ShardPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.shard.pickedUp) {
        return;
    }
    avatar.tierMeter.addShard();
    this.shard.pickUp();
};

// Delete our shard.
ShardPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    Utils.destroy(this.shard);
};

// Editor details.
ShardPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'shard';
};

// JSON conversion of a shard.
ShardPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    delete result.enabled;
    result.type = ShardPoint.TYPE;
    return result;
};

// Load a JSON representation of a portal.
ShardPoint.load = function(game, name, json) {
    return new ShardPoint(name, json.x, json.y);
};
