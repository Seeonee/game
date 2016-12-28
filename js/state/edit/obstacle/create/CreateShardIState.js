// Set up a shard.
var CreateShardIState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, Shard, 1);
    this.showArrows = false;
};

CreateShardIState.prototype = Object.create(FinalCreateIState.prototype);
CreateShardIState.prototype.constructor = CreateShardIState;


// Update loop.
CreateShardIState.prototype.update = function() {
    this.finished(new Shard());
};
