// Base class for point customization istates.
var BaseCustomizeIState = function(handler, level, pointClass, depth) {
    var name = pointClass ?
        BaseCustomizeIState.getName(pointClass, depth) :
        BaseCustomizeIState.NAME;
    IState.call(this, name, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.pointClass = pointClass;
    this.depth = depth ? depth : 0;
};

BaseCustomizeIState.NAME = 'customize';
BaseCustomizeIState.prototype = Object.create(IState.prototype);
BaseCustomizeIState.prototype.constructor = BaseCustomizeIState;


// Called when activated.
BaseCustomizeIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.pressed = false;
    if (!(prev.depth > this.depth)) {
        this.prev = prev;
        this.point = this.avatar.point;
    }
    this.updateHelp();
};

// Call to retreat all the way out.
BaseCustomizeIState.prototype.finished = function(point) {
    if (point) {
        this.level.tier.replacePoint(this.point, point);
        this.avatar.point = point;
        this.avatar.updateAttachment();
    }
    var prev = this.prev;
    while (prev instanceof BaseCustomizeIState) {
        prev = prev.prev;
    }
    this.gpad.consumeButtonEvent();
    this.activate(prev.name);
};

// Get the name of the next state for a particular point.
BaseCustomizeIState.prototype.advance = function() {
    var name = BaseCustomizeIState.getName(this.pointClass, this.depth + 1);
    this.activate(name);
};

// Update help text.
BaseCustomizeIState.prototype.updateHelp = function() {
    var s = this.getHelp();
    if (s[s.length - 1] == '\n') {
        s = s.substring(0, s.length - 1);
    }
    this.avatar.help.setText(s);
};

// Update help text. This will gather all of our lower-depth 
// "parent" states' texts.
BaseCustomizeIState.prototype.getHelp = function() {
    if (this.prev && this.prev instanceof BaseCustomizeIState) {
        return this.prev.getHelp() + '\n';
    }
    return '';
};

// Get the name of the next state for a particular point.
BaseCustomizeIState.getName = function(pointClass, depth) {
    return BaseCustomizeIState.NAME + '-' +
        pointClass.TYPE + '-' + depth;
};








// Gather point customization options.
var OptionGathererIState = function(handler, level,
    pointClass, depth, optionName) {
    BaseCustomizeIState.call(this, handler, level, pointClass, depth);
    this.optionName = optionName;
    this.showArrows = true;
};

OptionGathererIState.prototype = Object.create(BaseCustomizeIState.prototype);
OptionGathererIState.prototype.constructor = OptionGathererIState;


// Called when activated.
OptionGathererIState.prototype.activated = function(prev) {
    if (!(prev.depth > this.depth)) {
        var customize = this.game.settings.buttonMap.buttonName(
            this.game.settings.buttonMap.EDIT_CUSTOMIZE);
        var cancel = this.game.settings.buttonMap.buttonName(
            this.game.settings.buttonMap.CANCEL);
        this.info = '\n  ' + customize + ' to confirm\n  ' +
            cancel + ' to cancel';
    }
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Add arrows to help text if needed.
OptionGathererIState.prototype.getHelp = function() {
    var s = BaseCustomizeIState.prototype.getHelp.call(this);
    s += this.optionName + ': ' + this.getOptionText();
    if (this.isActive()) {
        s += this.info;
    }
    if (this.showArrows) {
        s = EditLevelIHandler.addArrows(s, this.depth);
    }
    return s;
};

// What option do we display?
OptionGathererIState.prototype.getOptionText = function() {
    return '?'; // Override me!
};

// What option do we represent?
OptionGathererIState.prototype.getOptionValue = function() {
    return undefined; // Override me!
};

// Update help text. This will gather all of our lower-depth 
// "parent" states' texts.
OptionGathererIState.prototype.gatherOptions = function() {
    if (this.prev && this.prev instanceof OptionGathererIState) {
        var result = this.prev.gatherOptions();
    } else {
        var result = {};
    }
    result[this.optionName] = this.getOptionValue();
    return result;
};

// Update loop.
OptionGathererIState.prototype.update = function() {
    if (this.gpad.justPressed(this.buttonMap.EDIT_CUSTOMIZE)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
    } else if (this.gpad.justReleased(this.buttonMap.SELECT) ||
        (this.pressed &&
            this.gpad.justReleased(this.buttonMap.EDIT_CUSTOMIZE))) {
        this.gpad.consumeButtonEvent();
        this.pressed = false;
        this.advance();
    } else if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.activate(this.prev.name);
    }
};












// Gather point customization options.
var OptionSetGathererIState = function(handler, level,
    pointClass, depth, optionName, options) {
    OptionGathererIState.call(this, handler, level,
        pointClass, depth, optionName);
    // Each option should have a .value and (optionally) a .text.
    // The .value is what matters; the .text is its string
    // representation, if you want something custom.
    // If options have neither, we wrap them and assume 
    // they represent their own .value (and .text).
    this.options = [];
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (Object.keys(option).indexOf('value') == -1) {
            option = { value: option };
        }
        this.options.push(option);
    }
    this.selected = 0;
};

OptionSetGathererIState.prototype = Object.create(OptionGathererIState.prototype);
OptionSetGathererIState.prototype.constructor = OptionSetGathererIState;


// What option do we display?
OptionSetGathererIState.prototype.getOptionText = function() {
    var option = this.options[this.selected];
    return option.text ? option.text : option.value;
};

// What's its actual value?
OptionSetGathererIState.prototype.getOptionValue = function() {
    var option = this.options[this.selected];
    return option.value;
};

// Update loop.
OptionSetGathererIState.prototype.update = function() {
    if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_RIGHT)) {
        this.gpad.consumeButtonEvent();
        this.selected = (this.selected + 1) % this.options.length;
        this.updateHelp();
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_LEFT)) {
        this.gpad.consumeButtonEvent();
        this.selected = (this.selected + this.options.length - 1) %
            this.options.length;
        this.updateHelp();
    } else {
        return OptionGathererIState.prototype.update.call(this);
    }
};








// Handle point en/dis-abling.
var CustomizePointIState = function(handler, level) {
    var options = Object.keys(Point.load.factory);
    options.push({ text: 'none', value: undefined });
    OptionSetGathererIState.call(this, handler, level, undefined, 0,
        '', options);
};

CustomizePointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePointIState.prototype.constructor = CustomizePointIState;


// Called when activated.
CustomizePointIState.prototype.activated = function(prev) {
    if (this.level.avatar.point) {
        this.optionName = 'set ' + this.level.avatar.point.name +
            '\'s type';
    }
    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Get the name of the next state for a particular point.
CustomizePointIState.prototype.advance = function() {
    var option = this.getOptionValue();
    if (option) {
        this.pointClass = Point.load.factory[option];
    } else {
        this.pointClass = Point;
    }
    BaseCustomizeIState.prototype.advance.call(this);
};

// Update loop.
CustomizePointIState.prototype.update = function() {
    if (!this.point ||
        this.point instanceof StartPoint ||
        this.point instanceof EndPoint) {
        this.activate(this.prev.name);
        return;
    }
    return OptionSetGathererIState.prototype.update.call(this);
};
