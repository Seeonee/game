// Set up a wire junction.
var CustomizeJunctionPointIState = function(handler, level) {
    var optionName = 'mode';
    var options = [];
    for (var i = 0; i < JunctionPoint.ALL_MODES.length; i++) {
        var mode = JunctionPoint.ALL_MODES[i];
        var text = JunctionPoint.getModeString(mode);
        options.push({ text: text, value: mode });
    }
    OptionSetGathererIState.call(this, handler, level, JunctionPoint, 1,
        optionName, options);
    new CustomizeJunctionPoint2IState(handler, level);
};

CustomizeJunctionPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeJunctionPointIState.prototype.constructor = CustomizeJunctionPointIState;








// Set up a wire junction.
var CustomizeJunctionPoint2IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, JunctionPoint, 2);
    this.showArrows = false;
};

CustomizeJunctionPoint2IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeJunctionPoint2IState.prototype.constructor = CustomizeJunctionPoint2IState;


// Update loop.
CustomizeJunctionPoint2IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var point = new JunctionPoint();
    point.mode = options.mode;
    this.finished(point); // Activates previous.
};
