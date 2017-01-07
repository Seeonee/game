// Handle text editing.
var TextEditorIState = function(handler, level) {
    IState.call(this, TextEditorIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.avatar.events.onAttachEdit.add(
        this.updateHelpText, this);
};

TextEditorIState.NAME = 'text';
TextEditorIState.prototype = Object.create(IState.prototype);
TextEditorIState.prototype.constructor = TextEditorIState;

// Called when we become the active state.
TextEditorIState.prototype.activated = function(prev) {
    this.updateHelpText();
};

// Called when we deactivate.
TextEditorIState.prototype.deactivated = function(next) {
    this.avatar.move(0, 0);
};

// Handle an update.
TextEditorIState.prototype.update = function() {
    if (this.handler.cycle()) {
        // We're no longer active; it's k.
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_ADD) ||
        this.gpad.justReleased(this.buttonMap.EDIT_CUSTOMIZE)) {
        this.activate(AddTextIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_DELETE)) {
        var obj = this.getAttached();
        if (obj.textKeys && obj.textKeys.length) {
            this.activate(DeleteTextIState.NAME);
        }
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_FLOAT)) {
        this.activate(FloatIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_UP)) {
        this.activate(StepUpIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_DOWN)) {
        this.activate(StepDownIState.NAME);
    }
    if (this.isActive()) {
        this.updateHelpText();
        return false;
    } else {
        return this.handler.state.update();
    }
};

// Get the avatar's attached object.
TextEditorIState.prototype.getAttached = function() {
    var obj = this.avatar.point;
    obj = obj ? obj : this.avatar.path;
    return obj;
};

// Show what the avatar's attached to.
TextEditorIState.prototype.updateHelpText = function() {
    if (!this.isActive()) {
        return;
    }
    var obj = this.getAttached();
    var s = 'text events';
    if (!obj) {
        this.avatar.htext.setText(EditLevelIHandler.addArrows(s));
        return;
    }
    s += ' / ' + obj.name;
    var num = obj.textKeys ? obj.textKeys.length : 0;
    s += '\n' + num + ' text key' +
        (num != 1 ? 's' : '');
    if (num > 0) {
        s += ':';
        for (var i = 0; i < num; i++) {
            var textKey = obj.textKeys[i];
            s += '\n\n[' + textKey + ']\n';
            s += this.level.getTextKey(textKey);
        }
    }
    this.avatar.htext.setText(EditLevelIHandler.addArrows(s));
};
