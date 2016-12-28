// Set up a door.
var CreateDoorIState = function(handler, level) {
    var optionName = 'subtype';
    var options = CarriedItem.ALL_TYPES;
    OptionSetGathererIState.call(this, handler, level, Door, 1,
        optionName, options);
    new CreateDoor2IState(handler, level);
};

CreateDoorIState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateDoorIState.prototype.constructor = CreateDoorIState;








// Set up a door.
var CreateDoor2IState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, Door, 2);
    this.showArrows = false;
};

CreateDoor2IState.prototype = Object.create(FinalCreateIState.prototype);
CreateDoor2IState.prototype.constructor = CreateDoor2IState;


// Update loop.
CreateDoor2IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var obstacle = new Door();
    obstacle.subtype = options.subtype;
    this.finished(obstacle);
};
