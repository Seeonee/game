// Edit text.
var AddTextIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, AddTextIState, 1);
    this.showArrows = false;
    new AddText2IState(handler, level);
    new AddText3IState(handler, level);
    new AddText4IState(handler, level);
    new AddText4IState(handler, level);
};

AddTextIState.TYPE = 'add-text';
AddTextIState.NAME = BaseCustomizeIState.getName(AddTextIState, 1);
AddTextIState.prototype = Object.create(BaseCustomizeIState.prototype);
AddTextIState.prototype.constructor = AddTextIState;

// Activate/deactivate.
AddTextIState.prototype.activated = function(prev) {
    this.obj = this.avatar.point;
    this.obj = this.obj ? this.obj : this.avatar.path;
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
AddTextIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
AddTextIState.prototype.getHelp = function() {
    return 'add text to ' + this.obj.name;
};








// Edit text.
var AddText2IState = function(handler, level) {
    var optionName = 'text';
    OptionGathererIState.call(this, handler, level, AddTextIState, 2,
        optionName);
    this.showArrows = false;
};

AddText2IState.prototype = Object.create(OptionGathererIState.prototype);
AddText2IState.prototype.constructor = AddText2IState;

// Set up our options.
AddText2IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    if (prev.depth && prev.depth < this.depth) {
        this.obj = prev.obj;
    }
    OptionGathererIState.prototype.activated.call(this, prev);
};

// Option methods.
AddText2IState.prototype.getOptionValue = function() {
    return 'Hello, world!';
};








// Edit text.
var AddText3IState = function(handler, level) {
    var optionName = 'insert at';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, AddTextIState, 3,
        optionName, options);
};

AddText3IState.prototype = Object.create(OptionSetGathererIState.prototype);
AddText3IState.prototype.constructor = AddText3IState;

// Set up our options.
AddText3IState.prototype.activated = function(prev) {
    if (prev.depth && prev.depth < this.depth) {
        this.obj = prev.obj;
    }
    var options = ['end'];
    if (this.obj.textKeys) {
        for (var i = 0; i < this.obj.textKeys.length; i++) {
            options.push(i);
        }
    }
    this.setOptions(options);
    OptionSetGathererIState.prototype.activated.call(this, prev);
};








// Edit text.
var AddText4IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, AddTextIState, 4);
    this.showArrows = false;
};

AddText4IState.prototype = Object.create(BaseCustomizeIState.prototype);
AddText4IState.prototype.constructor = AddText4IState;


// Update loop.
AddText4IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var obj = this.prev.obj;
    if (obj.textKeys == undefined) {
        obj.textKeys = [];
    }

    var textKey = this.level.getNewTextKeyName(obj);
    var text = options['text'];
    var i = options['insert at'];
    if (i == 'end') {
        i = obj.textKeys.length;
    }

    obj.textKeys.splice(i, 0, textKey);
    this.level.addTextKey(textKey, text);

    this.finished(); // Activates previous.
};
