// Handle wire editing.
var WireEditorIState = function(handler, level) {
    IState.call(this, WireEditorIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.avatar.events.onAttachEdit.add(
        this.updateHelpText, this);
};

WireEditorIState.NAME = 'wires';
WireEditorIState.prototype = Object.create(IState.prototype);
WireEditorIState.prototype.constructor = WireEditorIState;

// Called when we become the active state.
WireEditorIState.prototype.activated = function(prev) {
    this.updateHelpText();
};

// Called when we deactivate.
WireEditorIState.prototype.deactivated = function(next) {
    this.avatar.move(0, 0);
};

// Handle an update.
WireEditorIState.prototype.update = function() {
    if (this.handler.cycle()) {
        // We're no longer active; it's k.
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_ADD) ||
        this.gpad.justReleased(this.buttonMap.EDIT_CUSTOMIZE)) {
        if (this.avatar.point && this.avatar.point.type != Point.TYPE) {
            this.activate(AddWireIState.NAME);
        }
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_DELETE)) {
        if (this.avatar.point && this.avatar.point.wires.length > 0) {
            this.activate(DeleteWireIState.NAME);
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

// Show what the avatar's attached to.
WireEditorIState.prototype.updateHelpText = function() {
    if (!this.isActive()) {
        return;
    }
    var obj = this.avatar.point;
    if (!obj) {
        this.avatar.htext.setText(EditLevelIHandler.addArrows('wires'));
        return;
    }
    var s = 'wires ' + ' / ' + obj.name;
    var num = obj.wires ? obj.wires.length : 0;
    s += '\n' + num + ' wire' +
        (num != 1 ? 's' : '');
    if (num > 0) {
        s += ': ';
        for (var i = 0; i < num; i++) {
            if (i > 0) {
                s += ', '
            }
            s += obj.wires[i].name;
        }
    }
    this.avatar.htext.setText(EditLevelIHandler.addArrows(s));
};
