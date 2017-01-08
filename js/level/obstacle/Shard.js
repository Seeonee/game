// A "skill point" shard that the avatar can pick up.
var Shard = function(name, x, y) {
    Obstacle.call(this, name, x, y);
};

Shard.TYPE = 'shard';
Shard.prototype = Object.create(Obstacle.prototype);
Shard.prototype.constructor = Shard;

// Set up our factory.
Obstacle.load.factory[Shard.TYPE] = Shard;


// Draw loop.
Shard.prototype.draw = function(tier) {
    var above = tier.getAbove();
    var palette = above ? above.palette : tier.palette;
    if (this.renderNeeded) {
        this.game = tier.game;
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.shard = new ShardSprite(game, ap.x, ap.y, palette);
        tier.image.addChild(this.shard);
    } else {
        this.hitbox.updateTier(tier);
        this.shard.updatePalette(palette);
    }
};

// Collision check.
Shard.prototype.obstruct = function(avatar, hitbox) {
    var tiers = avatar.tier.level.tiers;
    var maxIndex = tiers[tiers.length - 1].index;
    if (avatar.tier.index < maxIndex) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
        avatar.tierMeter.addShard();
        this.shard.pickUp();
    }
    return false;
};

// Delete ourself.
Shard.prototype.delete = function() {
    if (this.shard) {
        Utils.destroy(this.shard);
        this.shard = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        Utils.destroy(this.hitbox);
        this.hitbox = undefined;
    }
};

// Write our JSON conversion.
Shard.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    return result;
};

// Load our JSON representation.
Shard.load = function(game, name, json) {
    return new Shard(name, json.x, json.y);
};
