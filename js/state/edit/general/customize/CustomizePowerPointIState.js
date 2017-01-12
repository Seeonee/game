// Set up a power.
var CustomizePowerPointIState = function(handler, level) {
    var optionName = 'ability';
    var options = Power.ALL_TYPES;
    OptionSetGathererIState.call(this, handler, level, PowerPoint, 1,
        optionName, options);
    new CustomizePowerPoint2IState(handler, level);
};

CustomizePowerPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePowerPointIState.prototype.constructor = CustomizePowerPointIState;








// Set up a power.
var CustomizePowerPoint2IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, PowerPoint, 2);
    this.showArrows = false;
};

CustomizePowerPoint2IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizePowerPoint2IState.prototype.constructor = CustomizePowerPoint2IState;


// Update loop.
CustomizePowerPoint2IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var point = new PowerPoint();
    var shards = this.avatar.tierMeter.shards[this.level.tier.name];
    point.enabled = shards;
    point.startEnabled = point.enabled;
    point.powerType = options['ability'];
    this.finished(point); // Activates previous.
};
