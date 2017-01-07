// Edit text.
var DeleteTextIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteTextIState, 1);
    this.showArrows = false;
    new DeleteText2IState(handler, level);
    new DeleteText3IState(handler, level);
};

DeleteTextIState.TYPE = 'delete-text';
DeleteTextIState.NAME = BaseCustomizeIState.getName(DeleteTextIState, 1);
DeleteTextIState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteTextIState.prototype.constructor = DeleteTextIState;

// Activate/deactivate.
DeleteTextIState.prototype.activated = function(prev) {
    this.obj = this.avatar.point;
    this.obj = this.obj ? this.obj : this.avatar.path;
    this.canceled = prev.depth && prev.depth > this.depth;
    BaseCustomizeIState.prototype.activated.call(this, prev);
};

// Called on update.
DeleteTextIState.prototype.update = function() {
    if (this.canceled) {
        this.activate(this.prev.name);
    } else {
        this.advance();
    }
};

// Help text.
DeleteTextIState.prototype.getHelp = function() {
    return 'delete text from ' + this.obj.name;
};








// Edit text.
var DeleteText2IState = function(handler, level) {
    var optionName = 'delete';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, DeleteTextIState, 2,
        optionName, options);
};

DeleteText2IState.prototype = Object.create(OptionSetGathererIState.prototype);
DeleteText2IState.prototype.constructor = DeleteText2IState;

// Set up our options.
DeleteText2IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    if (prev.depth && prev.depth < this.depth) {
        this.obj = prev.obj;
    }
    var options = [];
    for (var i = 0; i < this.obj.textKeys.length; i++) {
        options.push(this.obj.textKeys[i]);
    }
    this.setOptions(options);
    OptionSetGathererIState.prototype.activated.call(this, prev);
};








// Edit text.
var DeleteText3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, DeleteTextIState, 3);
    this.showArrows = false;
};

DeleteText3IState.prototype = Object.create(BaseCustomizeIState.prototype);
DeleteText3IState.prototype.constructor = DeleteText3IState;


// Update loop.
DeleteText3IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var textKey = options.delete;
    var obj = this.prev.obj;
    var i = obj.textKeys.indexOf(textKey);
    obj.textKeys.splice(i, 1);
    this.level.removeTextKey(textKey);
    this.avatar.htext.setText('deleted text event ' +
        textKey, true);
    this.finished(); // Activates previous.
};
