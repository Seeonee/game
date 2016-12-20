// Handle the edit overlay.
var GeneralEditIState = function(handler, level) {
    IState.call(this, GeneralEditIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

GeneralEditIState.NAME = 'edit';
GeneralEditIState.prototype = Object.create(IState.prototype);
GeneralEditIState.prototype.constructor = GeneralEditIState;

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
