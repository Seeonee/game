// Set up a fireball.
var CreateFireballIState = function(handler, level) {
    var optionName = 'radius';
    var options = Fireball.ALL_RADII.slice();
    options.unshift({ text: 'default', value: undefined });
    OptionSetGathererIState.call(this, handler, level, Fireball, 1,
        optionName, options);
    new CreateFireball2IState(handler, level);
    new CreateFireball3IState(handler, level);
    new CreateFireball4IState(handler, level);
    new CreateFireball5IState(handler, level);
    new CreateFireball6IState(handler, level);
};

CreateFireballIState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateFireballIState.prototype.constructor = CreateFireballIState;








// Additional states.
var CreateFireball2IState = function(handler, level) {
    var optionName = 'speed ratio';
    var options = Fireball.ALL_SPEEDS.slice();
    options.unshift({ text: 'default', value: undefined });
    OptionSetGathererIState.call(this, handler, level, Fireball, 2,
        optionName, options);
};

CreateFireball2IState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateFireball2IState.prototype.constructor = CreateFireball2IState;









// Additional states.
var CreateFireball3IState = function(handler, level) {
    var optionName = 'clockwise';
    var options = [{ text: true, value: undefined }, false];
    OptionSetGathererIState.call(this, handler, level, Fireball, 3,
        optionName, options);
};

CreateFireball3IState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateFireball3IState.prototype.constructor = CreateFireball3IState;









// Additional states.
var CreateFireball4IState = function(handler, level) {
    var optionName = 'starting angle %';
    var options = Fireball.ALL_ANGLES.slice();
    options.unshift({ text: 'default', value: undefined });
    OptionSetGathererIState.call(this, handler, level, Fireball, 4,
        optionName, options);
};

CreateFireball4IState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateFireball4IState.prototype.constructor = CreateFireball4IState;









// Additional states.
var CreateFireball5IState = function(handler, level) {
    var optionName = 'return angle %';
    var options = Fireball.ALL_ANGLES.slice();
    options.unshift({ text: 'default', value: undefined });
    OptionSetGathererIState.call(this, handler, level, Fireball, 5,
        optionName, options);
};

CreateFireball5IState.prototype = Object.create(OptionSetGathererIState.prototype);
CreateFireball5IState.prototype.constructor = CreateFireball5IState;









// Additional states.
var CreateFireball6IState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, Fireball, 6);
    this.showArrows = false;
};

CreateFireball6IState.prototype = Object.create(FinalCreateIState.prototype);
CreateFireball6IState.prototype.constructor = CreateFireball6IState;


// Update loop.
CreateFireball6IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var obstacle = new Fireball('', 0, 0,
        options.radius, options['speed ratio'],
        options.clockwise, options['starting angle %'],
        options['return angle %']);
    obstacle.subtype = options.subtype;
    this.finished(obstacle);
};
