// Set up a wire.
var DeleteObstacleIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteObstacleIState, 1);
    this.showArrows = false;
    new DeleteObstacle2IState(handler, level);
    new DeleteObstacle3IState(handler, level);
};

DeleteObstacleIState.TYPE = 'delete-wire';
DeleteObstacleIState.NAME = BaseCustomizeIState.getName(DeleteObstacleIState, 1);
DeleteObstacleIState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteObstacleIState.prototype.constructor = DeleteObstacleIState;

// Activate/deactivate.
DeleteObstacleIState.prototype.activated = function(prev) {
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
DeleteObstacleIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
DeleteObstacleIState.prototype.getHelp = function() {
    return 'delete wire from ' + this.point.name;
};








// Set up a wire.
var DeleteObstacle2IState = function(handler, level) {
    var optionName = 'cut';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, DeleteObstacleIState, 2,
        optionName, options);
};

DeleteObstacle2IState.prototype = Object.create(OptionSetGathererIState.prototype);
DeleteObstacle2IState.prototype.constructor = DeleteObstacle2IState;

// Set up our options.
DeleteObstacle2IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.tier = this.level.tier;
    var options = [];
    for (var i = 0; i < this.avatar.point.wires.length; i++) {
        options.push(this.avatar.point.wires[i].name);
    }
    this.setOptions(options);
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Called as the user cycles through wires to cut.
DeleteObstacle2IState.prototype.setSelected = function(option, old) {
    if (option) {
        this.tier.wireMap[option.value].setHighlight(this.tier.palette);
    }
    if (old) {
        this.tier.wireMap[old.value].cancelHighlight();
    }
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
};








// Set up a wire.
var DeleteObstacle3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteObstacleIState, 3);
    this.showArrows = false;
};

DeleteObstacle3IState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteObstacle3IState.prototype.constructor = DeleteObstacle3IState;


// Update loop.
DeleteObstacle3IState.prototype.update = function() {
    var tier = this.level.tier;
    var options = this.prev.gatherOptions();
    var name = options.cut;
    tier.DeleteObstacle(tier.wireMap[name]);
    this.avatar.help.setText('cut wire ' + name, true);
    this.finished(); // Activates previous.
};
