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
    if (this.myPrev == undefined) {
        this.myPrev = prev;
    } else {
        this.myPrev = undefined;
    }
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
DeleteWireIState.prototype.update = function() {
    if (this.myPrev) {
        this.advance();
    } else {
        this.activate(this.prev.name);
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
    var options = [];
    for (var i = 0; i < this.avatar.point.wires.length; i++) {
        options.push(this.avatar.point.wires[i].name);
    }
    this.setOptions(options);
    OptionSetGathererIState.prototype.activated.call(this, prev);
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
    tier.wireMap[name].delete();
    this.avatar.help.setText('cut wire ' + name, true);
    this.finished(); // Activates previous.
};
