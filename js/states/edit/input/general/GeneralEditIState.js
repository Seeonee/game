// Handle the edit overlay.
var GeneralEditIState = function(handler, level) {
    IState.call(this, GeneralEditIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.avatar.events.onAttachEdit.add(
        this.updateHelpText, this);
};

GeneralEditIState.NAME = 'edit';
GeneralEditIState.prototype = Object.create(IState.prototype);
GeneralEditIState.prototype.constructor = GeneralEditIState;

// Called when we become the active state.
GeneralEditIState.prototype.activated = function(prev) {
    this.attachedObj = undefined;
    this.updateHelpText();
};

// Handle an update.
GeneralEditIState.prototype.update = function() {
    if (this.handler.cycle()) {
        // We're no longer active; it's k.
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
        if (this.avatar.path) {
            this.activate(AddFromPathIState.NAME);
        } else if (this.avatar.point) {
            this.activate(AddFromPointIState.NAME);
        }
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_DELETE)) {
        this.activate(DeleteIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_FLOAT)) {
        this.activate(FloatIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_UP)) {
        this.activate(StepUpIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_DOWN)) {
        this.activate(StepDownIState.NAME);
    }
    if (this.isActive()) {
        return false;
    } else {
        return this.handler.state.update();
    }
};

// Show what the avatar's attached to.
GeneralEditIState.prototype.updateHelpText = function() {
    if (!this.isActive()) {
        return;
    }
    var obj = this.avatar.point ? this.avatar.point : this.avatar.path;
    if (obj === this.attachedObj) {
        return;
    }
    this.attachedObj = obj;
    var s = obj ? ' / ' + obj.name : '';
    var more = obj.getDetails();
    if (more) {
        s += more;
    }
    this.avatar.help.setText('edit' + s);
};
