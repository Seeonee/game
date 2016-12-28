// Set up a wire.
var AddObstacleIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Wire, 1);
    this.showArrows = false;
    new AddObstacle2IState(handler, level);
    new AddObstacle3IState(handler, level);
    new AddObstacle4IState(handler, level);
    new AddObstacle5IState(handler, level);
};

AddObstacleIState.NAME = BaseCustomizeIState.getName(Wire, 1);
AddObstacleIState.prototype = Object.create(BaseCustomizeIState.prototype);
AddObstacleIState.prototype.constructor = AddObstacleIState;

// Activate/deactivate.
AddObstacleIState.prototype.activated = function(prev) {
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
AddObstacleIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
AddObstacleIState.prototype.getHelp = function() {
    return 'add wire from ' + this.point.name;
};








// Set up a wire.
var AddObstacle2IState = function(handler, level) {
    var optionName = 'destination'; // Filled in later.
    OptionGathererIState.call(this, handler, level, Wire, 2,
        optionName);
};

AddObstacle2IState.prototype = Object.create(OptionGathererIState.prototype);
AddObstacle2IState.prototype.constructor = AddObstacle2IState;


// Called when activated.
AddObstacle2IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.target = this.point;
    this.tier = this.level.tier;
    OptionGathererIState.prototype.activated.call(this, prev);

    if (prev instanceof AddObstacleIState) {
        this.wire = undefined;
    }
};

// Called on update.
AddObstacle2IState.prototype.update = function() {
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
            this.deleteWire();
        } else {
            this.updateWire();
        }
        this.updateHelp();
    }
    return OptionGathererIState.prototype.update.call(this);
};

// What option do we display?
AddObstacle2IState.prototype.getOptionText = function() {
    var s = this.getOptionValue();
    return s ? s : 'select a point';
};

// What option do we represent?
AddObstacle2IState.prototype.getOptionValue = function() {
    if (this.target && this.target != this.point) {
        return this.target.name;
    }
    return undefined;
};

// Advance only if we're on a valid target.
AddObstacle2IState.prototype.advance = function() {
    if (this.getOptionValue()) {
        return OptionGathererIState.prototype.advance.call(this);
    }
};

// Cancel out.
AddObstacle2IState.prototype.cancel = function() {
    if (this.wire) {
        this.tier.deleteWire(this.wire);
        this.wire = undefined;
    }
    OptionGathererIState.prototype.cancel.call(this);
};

// Return a nearby point, or undefined if none are found.
AddObstacle2IState.prototype.findNearbyPoint = function() {
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
AddObstacle2IState.prototype.canWireTo = function(target) {
    if (target.type == Point.TYPE) {
        return false;
    }
    for (var i = 0; i < this.point.wires.length; i++) {
        var w = this.point.wires[i];
        if (w == this.wire) {
            continue;
        }
        if (w.sourceName == target.name || w.sinkName == target.name) {
            return false;
        }
    }
    return true;
};

// Draws/redraw our wire.
AddObstacle2IState.prototype.updateWire = function() {
    if (this.wire) {
        this.wire.sinkName = this.target.name;
        this.wire.replaceEnd();
    } else {
        var name = this.tier.getNewWireName();
        this.wire = this.tier.AddObstacle(
            name, this.point.name, this.target.name);
    }
    this.wire.draw(this.tier);
    this.wire.setHighlight(this.tier.palette);
};

// Kill our wire.
AddObstacle2IState.prototype.deleteWire = function() {
    if (this.wire) {
        this.tier.deleteWire(this.wire);
        this.wire = undefined;
    }
};










// Set up a wire.
var AddObstacle3IState = function(handler, level) {
    var optionName = 'starting weight';
    var options = [0, 1, 2];
    OptionSetGathererIState.call(this, handler, level, Wire, 3,
        optionName, options);
};

AddObstacle3IState.prototype = Object.create(OptionSetGathererIState.prototype);
AddObstacle3IState.prototype.constructor = AddObstacle3IState;

// Called on activate.
AddObstacle3IState.prototype.activated = function(prev) {
    if (prev instanceof AddObstacle2IState) {
        this.tier = this.level.tier;
        this.wire = prev.wire;
        if (this.selected != 0) {
            this.updateWeight(this.options[this.selected].value);
        }
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Called as the user cycles through weights.
AddObstacle3IState.prototype.setSelected = function(option, old) {
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
    if (!this.wire || !option) {
        return;
    }
    this.updateWeight(option.value);
};

// Update wire weight.
AddObstacle3IState.prototype.updateWeight = function(weight) {
    this.wire.weight1 = weight;
    this.wire.replaceEnd();
    this.wire.draw(this.tier);
    this.wire.setHighlight(this.tier.palette);
};










// Set up a wire.
var AddObstacle4IState = function(handler, level) {
    var optionName = 'ending weight';
    var options = [0, 1, 2];
    OptionSetGathererIState.call(this, handler, level, Wire, 4,
        optionName, options);
};

AddObstacle4IState.prototype = Object.create(OptionSetGathererIState.prototype);
AddObstacle4IState.prototype.constructor = AddObstacle4IState;

// Called on activate.
AddObstacle4IState.prototype.activated = function(prev) {
    if (prev instanceof AddObstacle3IState) {
        this.tier = this.level.tier;
        this.wire = prev.wire;
        if (this.selected != 0) {
            this.updateWeight(this.options[this.selected].value);
        }
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Called as the user cycles through weights.
AddObstacle4IState.prototype.setSelected = function(option, old) {
    OptionSetGathererIState.prototype.setSelected.call(this, option, old);
    if (!this.wire || !option) {
        return;
    }
    this.updateWeight(option.value);
};

// Update wire weight.
AddObstacle4IState.prototype.updateWeight = function(weight) {
    this.wire.weight2 = weight;
    this.wire.replaceEnd();
    this.wire.draw(this.tier);
    this.wire.setHighlight(this.tier.palette);
};








// Set up a wire.
var AddObstacle5IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Wire, 5);
    this.showArrows = false;
};

AddObstacle5IState.prototype = Object.create(BaseCustomizeIState.prototype);
AddObstacle5IState.prototype.constructor = AddObstacle5IState;


// Called on activate.
AddObstacle5IState.prototype.activated = function(prev) {
    if (prev instanceof AddObstacle4IState) {
        this.wire = prev.wire;
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Update loop.
AddObstacle5IState.prototype.update = function() {
    this.wire.cancelHighlight();
    this.finished(); // Activates previous.
};
