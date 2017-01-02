// Set up a mask.
var CreateMaskIState = function(handler, level) {
    var optionName = 'subtype';
    var options = MaskItem.ALL_TYPES;
    OptionSetGathererIState.call(this, handler, level, MaskItem, 1,
        optionName, options);
    new CreateMask2IState(handler, level);
};

CreateMaskIState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateMaskIState.prototype.constructor = CreateMaskIState;








// Set up an item.
var CreateMask2IState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, MaskItem, 2);
    this.showArrows = false;
};

CreateMask2IState.prototype = Object.create(FinalCreateIState.prototype);
CreateMask2IState.prototype.constructor = CreateMask2IState;


// Update loop.
CreateMask2IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var obstacle = new MaskItem();
    obstacle.subtype = options.subtype;
    this.finished(obstacle);
};
