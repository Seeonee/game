// Set up a switch.
var CustomizeSwitchPointIState = function(handler, level) {
    var optionName = 'start enabled';
    var options = [false, true];
    OptionSetGathererIState.call(this, handler, level, SwitchPoint, 1,
        optionName, options);
    new CustomizeSwitchPoint2IState(handler, level);
    new CustomizeSwitchPoint3IState(handler, level);
    new CustomizeSwitchPoint4IState(handler, level);
};

CustomizeSwitchPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeSwitchPointIState.prototype.constructor = CustomizeSwitchPointIState;








// Set up a switch.
var CustomizeSwitchPoint2IState = function(handler, level) {
    var optionName = 'flip on contact';
    var options = [false, true];
    OptionSetGathererIState.call(this, handler, level, SwitchPoint, 2,
        optionName, options);
};

CustomizeSwitchPoint2IState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeSwitchPoint2IState.prototype.constructor = CustomizeSwitchPoint2IState;








// Set up a switch.
var CustomizeSwitchPoint3IState = function(handler, level) {
    var optionName = 'flip only once';
    var options = [false, true];
    OptionSetGathererIState.call(this, handler, level, SwitchPoint, 3,
        optionName, options);
};

CustomizeSwitchPoint3IState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeSwitchPoint3IState.prototype.constructor = CustomizeSwitchPoint3IState;








// Set up a switch.
var CustomizeSwitchPoint4IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, SwitchPoint, 4);
    this.showArrows = false;
};

CustomizeSwitchPoint4IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeSwitchPoint4IState.prototype.constructor = CustomizeSwitchPoint4IState;


// Update loop.
CustomizeSwitchPoint4IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var point = new SwitchPoint();
    point.enabled = options['start enabled'];
    point.contact = options['flip on contact'];
    point.once = options['flip only once'];
    this.finished(point); // Activates previous.
};
