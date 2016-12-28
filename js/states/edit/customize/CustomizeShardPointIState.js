// Add a shard.
var CustomizeShardPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, ShardPoint, 1);
    this.showArrows = false;
};

CustomizeShardPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeShardPointIState.prototype.constructor = CustomizeShardPointIState;


// Update loop.
CustomizeShardPointIState.prototype.update = function() {
    if (this.level.tier == this.level.tiers[this.level.tiers.length - 1]) {
        // Can't add a point.
        this.avatar.help.setText('can\'t add shards\n' +
            'to top tier', true);
        this.finished();
        return;
    }
    this.finished(new ShardPoint()); // Activates previous.
};
