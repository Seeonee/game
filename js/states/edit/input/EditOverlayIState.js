// Handle the edit overlay.
var EditOverlayIState = function(handler, level) {
    IState.call(this, EditOverlayIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

EditOverlayIState.NAME = 'edit';
EditOverlayIState.prototype = Object.create(IState.prototype);
EditOverlayIState.prototype.constructor = EditOverlayIState;

// Handle an update.
EditOverlayIState.prototype.update = function() {
    if (this.game.settings.edit) {
        if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
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
        } else if (this.gpad.justReleased(this.buttonMap.EDIT_GAIN_KEY)) {
            this.activate(GainKeyIState.NAME);
        } else if (this.gpad.justReleased(this.buttonMap.EDIT_LOSE_KEY)) {
            this.activate(LoseKeyIState.NAME);
        }
    }
    if (this.isActive()) {
        return false;
    } else {
        return this.handler.state.update();
    }
};
