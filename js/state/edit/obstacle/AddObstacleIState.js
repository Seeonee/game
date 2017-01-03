// Handle object creation.
var AddObstacleIState = function(handler, level) {
    var options = Object.keys(Obstacle.load.factory);
    OptionSetGathererIState.call(this, handler, level,
        AddObstacleIState.NAME, 0, '', options);
    this.optionName = 'create';
};

AddObstacleIState.NAME = 'create';
AddObstacleIState.prototype = Object.create(OptionSetGathererIState.prototype);
AddObstacleIState.prototype.constructor = AddObstacleIState;


// Called when activated.
AddObstacleIState.prototype.activated = function(prev) {
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Get the name of the next state for a particular object.
AddObstacleIState.prototype.advance = function() {
    var option = this.getOptionValue();
    this.pointClass = Obstacle.load.factory[option];
    BaseCustomizeIState.prototype.advance.call(this);
};








// Base class for final-depth object creation istates.
var FinalCreateIState = function(handler, level, pointClass, depth) {
    BaseCustomizeIState.call(this, handler, level, pointClass, depth);
};

FinalCreateIState.prototype = Object.create(BaseCustomizeIState.prototype);
FinalCreateIState.prototype.constructor = FinalCreateIState;


// Call to retreat all the way out.
FinalCreateIState.prototype.finished = function(obstacle) {
    this.gpad.consumeButtonEvent();
    // Find the original object editor state, 
    // so that we can use its marker info.
    var prev = this.prev;
    while (prev instanceof BaseCustomizeIState) {
        prev = prev.prev;
    }
    if (obstacle) {
        var tier = this.level.tier;
        obstacle.name = tier.getNewObstacleName(obstacle.type);
        obstacle.x = prev.marker.x;
        obstacle.y = prev.marker.y;
        tier._addObstacle(obstacle);
    }
    this.activate(prev.name);
};
