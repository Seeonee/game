// Set up an item.
var CreateItemIState = function(handler, level) {
    var optionName = 'subtype';
    var options = CarriedItem.ALL_TYPES;
    OptionSetGathererIState.call(this, handler, level, CarriedItem, 1,
        optionName, options);
    new CreateItem2IState(handler, level);
};

CreateItemIState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateItemIState.prototype.constructor = CreateItemIState;








// Set up an item.
var CreateItem2IState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, CarriedItem, 2);
    this.showArrows = false;
};

CreateItem2IState.prototype = Object.create(FinalCreateIState.prototype);
CreateItem2IState.prototype.constructor = CreateItem2IState;


// Update loop.
CreateItem2IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var obstacle = new CarriedItem();
    obstacle.subtype = options.subtype;
    this.finished(obstacle);
};
