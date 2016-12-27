// Set up a wire.
var AddWireIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Wire, 1);
    this.showArrows = false;
    new AddWire2IState(handler, level);
    new AddWire3IState(handler, level);
    new AddWire4IState(handler, level);
    new AddWire5IState(handler, level);
};

AddWireIState.NAME = BaseCustomizeIState.getName(Wire, 1);
AddWireIState.prototype = Object.create(BaseCustomizeIState.prototype);
AddWireIState.prototype.constructor = AddWireIState;

// Activate/deactivate.
AddWireIState.prototype.activated = function(prev) {
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
AddWireIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
AddWireIState.prototype.getHelp = function() {
    return 'add wire from ' + this.point.name;
};








// Set up a wire.
var AddWire2IState = function(handler, level) {
    var optionName = 'destination'; // Filled in later.
    OptionGathererIState.call(this, handler, level, Wire, 2,
        optionName);
};

AddWire2IState.prototype = Object.create(OptionGathererIState.prototype);
AddWire2IState.prototype.constructor = AddWire2IState;


// Called when activated.
AddWire2IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.target = this.point;
    this.tier = this.level.tier;
    OptionGathererIState.prototype.activated.call(this, prev);

    this.image1 = new EditCharge(this.game,
        this.point.gx, this.point.gy, this.level.tier.palette);
    this.game.state.getCurrentState().z.mg.tier().add(this.image1);

    this.image2 = new EditCharge(this.game,
        this.point.gx, this.point.gy, this.level.tier.palette);
    this.game.state.getCurrentState().z.mg.tier().add(this.image2);
    this.image2.visible = false;
};

// Called when deactivated.
AddWire2IState.prototype.deactivated = function(next) {
    this.image1.kill();
    this.image2.kill();
    OptionGathererIState.prototype.deactivated.call(this, next);
};

// Called on update.
AddWire2IState.prototype.update = function() {
    // Move freely.
    var joystick = this.gpad.getAngleAndTilt();
    var angle = joystick.angle;
    var tilt = joystick.tilt;
    var speed = tilt * FloatIState.FLOAT_MAX_SPEED;
    this.avatar.body.velocity.x = speed * Math.sin(angle);
    this.avatar.body.velocity.y = speed * Math.cos(angle);
    var target = this.findNearbyPoint();
    if (target != this.target) {
        this.target = target;
        if (!this.target || this.target == this.point ||
            !this.canWireTo(target)) {
            this.image2.visible = false;
        } else {
            this.image2.x = this.target.gx;
            this.image2.y = this.target.gy;
            this.image2.visible = true;
        }
        this.updateHelp();
    }
    return OptionGathererIState.prototype.update.call(this);
};

// What option do we display?
AddWire2IState.prototype.getOptionText = function() {
    var s = this.getOptionValue();
    return s ? s : 'select a point';
};

// What option do we represent?
AddWire2IState.prototype.getOptionValue = function() {
    if (this.target && this.target != this.point) {
        return this.target.name;
    }
    return undefined;
};

// Advance only if we're on a valid target.
AddWire2IState.prototype.advance = function() {
    if (this.getOptionValue()) {
        return OptionGathererIState.prototype.advance.call(this);
    }
};

// Return a nearby point, or undefined if none are found.
AddWire2IState.prototype.findNearbyPoint = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    var min = FloatIState.FLOAT_SNAP_DISTANCE * 1.5;
    var found = undefined;
    for (var i = 0; i < this.tier.points.length; i++) {
        var point = this.tier.points[i];
        var d = Utils.distanceBetweenPoints(
            ip.x, ip.y, point.x, point.y);
        if (d <= min) {
            found = point;
            min = d;
        }
    }
    return found;
};

// Are we already connected?
AddWire2IState.prototype.canWireTo = function(target) {
    if (target.type == Point.TYPE) {
        return false;
    }
    for (var i = 0; i < this.point.wires.length; i++) {
        var w = this.point.wires[i];
        if (w.sourceName == target.name || w.sinkName == target.name) {
            return false;
        }
    }
    return true;
};










// Set up a wire.
var AddWire3IState = function(handler, level) {
    var optionName = 'starting weight';
    var options = [0, 1, 2];
    OptionSetGathererIState.call(this, handler, level, Wire, 3,
        optionName, options);
};

AddWire3IState.prototype = Object.create(OptionSetGathererIState.prototype);
AddWire3IState.prototype.constructor = AddWire3IState;

// Called on activate.
AddWire3IState.prototype.activated = function(prev) {
    if (prev instanceof AddWire2IState) {
        this.tier = this.level.tier;
        this.point = this.avatar.point;
        this.target = prev.target;
        var name = this.tier.getNewWireName();
        this.wire = this.tier.addWire(
            name, this.point.name, this.target.name);
        this.wire.draw(this.tier);
        this.wire.setHighlight(this.tier.palette);
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Called as the user cycles through weights.
AddWire3IState.prototype.cancel = function() {
    this.tier.deleteWire(this.wire);
    this.wire = undefined;
    OptionSetGathererIState.prototype.cancel.call(this);
};

// Called as the user cycles through weights.
AddWire3IState.prototype.setSelected = function(option, old) {
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
    if (!this.wire || !option) {
        return;
    }
    this.wire.weight1 = option.value;
    this.wire.replaceEnd();
    this.wire.draw(this.tier);
    this.wire.setHighlight(this.tier.palette);
};










// Set up a wire.
var AddWire4IState = function(handler, level) {
    var optionName = 'ending weight';
    var options = [0, 1, 2];
    OptionSetGathererIState.call(this, handler, level, Wire, 4,
        optionName, options);
};

AddWire4IState.prototype = Object.create(OptionSetGathererIState.prototype);
AddWire4IState.prototype.constructor = AddWire4IState;

// Called on activate.
AddWire4IState.prototype.activated = function(prev) {
    if (prev instanceof AddWire3IState) {
        this.tier = this.level.tier;
        this.wire = prev.wire;
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Called as the user cycles through weights.
AddWire4IState.prototype.setSelected = function(option, old) {
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
    if (!this.wire || !option) {
        return;
    }
    this.wire.weight2 = option.value;
    this.wire.replaceEnd();
    this.wire.draw(this.tier);
    this.wire.setHighlight(this.tier.palette);
};








// Set up a wire.
var AddWire5IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Wire, 5);
    this.showArrows = false;
};

AddWire5IState.prototype = Object.create(BaseCustomizeIState.prototype);
AddWire5IState.prototype.constructor = AddWire5IState;


// Called on activate.
AddWire5IState.prototype.activated = function(prev) {
    if (prev instanceof AddWire4IState) {
        this.wire = prev.wire;
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Update loop.
AddWire5IState.prototype.update = function() {
    this.wire.cancelHighlight();
    this.finished(); // Activates previous.
};
