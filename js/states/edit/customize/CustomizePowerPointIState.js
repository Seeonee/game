// Set up a power.
var CustomizePowerPointIState = function(handler, level) {
    var optionName = 'start enabled';
    var options = [true, false];
    OptionSetGathererIState.call(this, handler, level, PowerPoint, 1,
        optionName, options);
    new CustomizePowerPoint2IState(handler, level);
    new CustomizePowerPoint3IState(handler, level);
};

CustomizePowerPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePowerPointIState.prototype.constructor = CustomizePowerPointIState;








// Set up a power.
var CustomizePowerPoint2IState = function(handler, level) {
    var optionName = 'ability';
    var options = [
        'sword',
        'shield',
        'axe',
        'crown',
        'hourglass',
        'might',
        'presence',
        'stealth',
        'wit'
    ];
    OptionSetGathererIState.call(this, handler, level, PowerPoint, 2,
        optionName, options);
};

CustomizePowerPoint2IState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePowerPoint2IState.prototype.constructor = CustomizePowerPoint2IState;








// Set up a power.
var CustomizePowerPoint3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, PowerPoint, 3);
    this.showArrows = false;
};

CustomizePowerPoint3IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizePowerPoint3IState.prototype.constructor = CustomizePowerPoint3IState;


// Update loop.
CustomizePowerPoint3IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var point = new PowerPoint();
    point.enabled = options['start enabled'];
    point.powerType = options['ability'];
    this.finished(point); // Activates previous.
};
