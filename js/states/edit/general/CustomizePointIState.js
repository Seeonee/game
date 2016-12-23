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
    this.showArrows = true;
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
BaseCustomizeIState.prototype.advance = function(pointClass) {
    pointClass = pointClass ? pointClass : this.pointClass;
    var name = BaseCustomizeIState.getName(pointClass, this.depth + 1);
    this.activate(name);
};

// Update help text.
BaseCustomizeIState.prototype.updateHelp = function() {
    var s = this.getHelp();
    if (this.showArrows) {
        s = EditLevelIHandler.addArrows(s, this.depth + 1);
    }
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

// Update loop.
BaseCustomizeIState.prototype.update = function() {
    return IState.prototype.update.call(this);
};

// Get the name of the next state for a particular point.
BaseCustomizeIState.getName = function(pointClass, depth) {
    return BaseCustomizeIState.NAME + '-' +
        pointClass.TYPE + '-' + depth;
};








// Handle point en/dis-abling.
var CustomizePointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level);
    // Build the list of possible points.
    this.options = Object.keys(Point.load.factory);
    this.selected = 0;
};

CustomizePointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizePointIState.prototype.constructor = CustomizePointIState;


// Called when activated.
CustomizePointIState.prototype.activated = function(prev) {
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

// Update help text.
CustomizePointIState.prototype.getHelp = function() {
    // Don't bother calling our superclass's. We know we're depth 0.
    var s = 'change ' + this.point.name + ' to:\n' +
        this.options[this.selected];
    if (this.isActive()) {
        s += this.info;
    }
    return s;
};

// Update loop.
CustomizePointIState.prototype.update = function() {
    if (!this.point ||
        this.point instanceof StartPoint ||
        this.point instanceof EndPoint) {
        this.activate(this.prev.name);
        return;
    }
    if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_RIGHT)) {
        this.gpad.consumeButtonEvent();
        this.selected = (this.selected + 1) % this.options.length;
        this.updateHelp();
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_LEFT)) {
        this.gpad.consumeButtonEvent();
        this.selected = (this.selected + this.options.length - 1) %
            this.options.length;
        this.updateHelp();
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_CUSTOMIZE)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
    } else if (this.gpad.justReleased(this.buttonMap.SELECT) ||
        (this.pressed &&
            this.gpad.justReleased(this.buttonMap.EDIT_CUSTOMIZE))) {
        this.gpad.consumeButtonEvent();
        this.pressed = false;
        var p = Point.load.factory[this.options[this.selected]];
        this.advance(p);
    } else if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.activate(this.prev.name);
    }
};
