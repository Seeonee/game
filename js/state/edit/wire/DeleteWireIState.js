// Set up a wire.
var DeleteWireIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteWireIState, 1);
    this.showArrows = false;
    new DeleteWire2IState(handler, level);
    new DeleteWire3IState(handler, level);
};

DeleteWireIState.TYPE = 'delete-wire';
DeleteWireIState.NAME = BaseCustomizeIState.getName(DeleteWireIState, 1);
DeleteWireIState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteWireIState.prototype.constructor = DeleteWireIState;

// Activate/deactivate.
DeleteWireIState.prototype.activated = function(prev) {
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
DeleteWireIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
DeleteWireIState.prototype.getHelp = function() {
    return 'delete wire from ' + this.point.name;
};








// Set up a wire.
var DeleteWire2IState = function(handler, level) {
    var optionName = 'cut';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, DeleteWireIState, 2,
        optionName, options);
};

DeleteWire2IState.prototype = Object.create(OptionSetGathererIState.prototype);
DeleteWire2IState.prototype.constructor = DeleteWire2IState;

// Set up our options.
DeleteWire2IState.prototype.activated = function(prev) {
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
DeleteWire2IState.prototype.setSelected = function(option, old) {
    if (option) {
        this.tier.wireMap[option.value].setHighlight(this.tier.palette);
    }
    if (old) {
        this.tier.wireMap[old.value].cancelHighlight();
    }
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
};








// Set up a wire.
var DeleteWire3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteWireIState, 3);
    this.showArrows = false;
};

DeleteWire3IState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteWire3IState.prototype.constructor = DeleteWire3IState;


// Update loop.
DeleteWire3IState.prototype.update = function() {
    var tier = this.level.tier;
    var options = this.prev.gatherOptions();
    var name = options.cut;
    tier.deleteWire(tier.wireMap[name]);
    this.avatar.help.setText('cut wire ' + name, true);
    this.finished(); // Activates previous.
};
