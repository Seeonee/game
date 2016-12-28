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
