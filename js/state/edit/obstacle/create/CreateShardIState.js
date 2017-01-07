// Set up a shard.
var CreateShardIState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, Shard, 1);
    this.showArrows = false;
};

CreateShardIState.prototype = Object.create(FinalCreateIState.prototype);
CreateShardIState.prototype.constructor = CreateShardIState;


// Update loop.
CreateShardIState.prototype.update = function() {
    var tiers = this.level.tiers;
    var maxIndex = tiers[tiers.length - 1].index;
    if (this.level.tier.index < maxIndex) {
        this.finished(new Shard());
    } else {
        this.avatar.htext.setText('add shard failed\n' +
            'can\'t add to top tier', true);
        this.finished();
    }
};
