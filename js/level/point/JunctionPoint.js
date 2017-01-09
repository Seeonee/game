// A point that combine signals from one or more source wires, 
// and spits out the result to one or more sink wires.
// Optionally supports a mode between AND and OR.
var JunctionPoint = function(name, x, y, textKeys, mode) {
    Point.call(this, name, x, y, true, textKeys);
    this.mode = mode != undefined ? mode : JunctionPoint.MODE_AND;

    this.attachmentOffsetX = Wire.SEGMENT_X;
    this.attachmentOffsetY = Wire.SEGMENT_Y;
    this.useOffsets = false;
};

JunctionPoint.TYPE = 'junction';
JunctionPoint.prototype = Object.create(Point.prototype);
JunctionPoint.prototype.constructor = JunctionPoint;

// Set up our factory.
Point.load.factory[JunctionPoint.TYPE] = JunctionPoint;

// Constants.
JunctionPoint.MODE_AND = 0;
JunctionPoint.MODE_OR = 1;
JunctionPoint.MODE_XOR = 2;
JunctionPoint.MODE_NOT = 3;
JunctionPoint.MODE_NAND = 4;
JunctionPoint.MODE_NOR = 5;
// Aggregate for others to reference.
JunctionPoint.ALL_MODES = [
    JunctionPoint.MODE_AND,
    JunctionPoint.MODE_OR,
    JunctionPoint.MODE_XOR,
    JunctionPoint.MODE_NOT,
    JunctionPoint.MODE_NAND,
    JunctionPoint.MODE_NOR
];


// During our first draw, we create the actual key.
JunctionPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
    if (tier.game.state.getCurrentState() instanceof EditLevelState) {
        var r = this.radius / 2;
        tier.bitmap.context.fillStyle = tier.palette.c2.s;
        tier.bitmap.context.beginPath();
        tier.bitmap.context.fillRect(this.x - r, this.y - r,
            2 * r, 2 * r);
    }
    this.updateEnabled();
};

// Notifies us to update our enabledness propagation.
JunctionPoint.prototype.setEnabled = function(enabled) {
    this.updateEnabled();
};

// Recheck everything.
JunctionPoint.prototype.updateEnabled = function() {
    var sources = [];
    for (var i = 0; i < this.wires.length; i++) {
        var wire = this.wires[i];
        if (wire.sink === this) {
            sources.push(wire.source);
        }
    }
    var enabled = sources.length ? this.getModeEnabled(sources) : false;
    if (this.enabled == enabled) {
        return;
    }
    // This will take care of relaying the signal to our wires.
    Point.prototype.setEnabled.call(this, enabled);
};

// Logical version.
JunctionPoint.prototype.getModeEnabled = function(sources) {
    switch (this.mode) {
        case JunctionPoint.MODE_AND:
        default:
            return this.modeAnd(sources);
        case JunctionPoint.MODE_OR:
            return this.modeOr(sources);
        case JunctionPoint.MODE_XOR:
            return this.modeXor(sources);
        case JunctionPoint.MODE_NOT:
            return this.modeNot(sources);
        case JunctionPoint.MODE_NAND:
            return this.modeNand(sources);
        case JunctionPoint.MODE_NOR:
            return this.modeNor(sources);
    }
};

// Text version.
JunctionPoint.getModeString = function(mode) {
    switch (mode) {
        case JunctionPoint.MODE_AND:
        default:
            return 'AND';
        case JunctionPoint.MODE_OR:
            return 'OR';
        case JunctionPoint.MODE_XOR:
            return 'XOR';
        case JunctionPoint.MODE_NOT:
            return 'NOT';
        case JunctionPoint.MODE_NAND:
            return 'NAND';
        case JunctionPoint.MODE_NOR:
            return 'NOR';
    }
};

// Input combiner function.
// If every input is on, so are we.
JunctionPoint.prototype.modeAnd = function(sources) {
    for (var i = 0; i < sources.length; i++) {
        if (!sources[i].isEnabled()) {
            return false;
        }
    }
    return true;
};

// Input combiner function.
// If any input is on, so are we.
JunctionPoint.prototype.modeOr = function(sources) {
    for (var i = 0; i < sources.length; i++) {
        if (sources[i].isEnabled()) {
            return true;
        }
    }
    return false;
};

// Input combiner function.
// If exactly one input is on, so are we.
JunctionPoint.prototype.modeXor = function(sources) {
    var count = 0;
    for (var i = 0; i < sources.length; i++) {
        if (sources[i].isEnabled()) {
            count += 1;
        }
    }
    return count == 1;
};

// Input combiner function.
// If all inputs are off, we're on.
JunctionPoint.prototype.modeNot = function(sources) {
    return this.modeNor(sources);
};

// Input combiner function.
// If any input is off, we're on.
JunctionPoint.prototype.modeNand = function(sources) {
    return !this.modeAnd(sources);
};

// Input combiner function.
// If all inputs are off, we're on.
JunctionPoint.prototype.modeNor = function(sources) {
    return !this.modeOr();
};

// Editor details.
JunctionPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'junction (' + JunctionPoint.getModeString(this.mode) + ')';
};

// Delete.
JunctionPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
};

// JSON conversion.
JunctionPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    delete result.enabled;
    if (this.mode) {
        result.mode = this.mode;
    }
    return result;
};

// Load our JSON representation.
JunctionPoint.load = function(game, name, json) {
    return new JunctionPoint(name, json.x, json.y,
        json.textKeys, json.mode);
};
