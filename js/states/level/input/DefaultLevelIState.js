// Default handler for gamepad input during a level.
var DefaultLevelIState = function(handler, level) {
    IState.call(this, DefaultLevelIState.NAME, handler);
    this.level = level;
};

DefaultLevelIState.NAME = IHandler.DEFAULT_STATE_NAME;
DefaultLevelIState.prototype = Object.create(IState.prototype);
DefaultLevelIState.prototype.constructor = DefaultLevelIState;

// Called on update.
DefaultLevelIState.prototype.update = function() {
    var avatar = this.level.avatar;
    // Starting an action?
    if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
        if (avatar.path) {
            this.activate(AddFromPathIState.NAME);
        } else if (avatar.point) {
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
    } else {
        this.activate(MoveIState.NAME);
    }
    // State is guaranteed to have changed, 
    // so let it update.
    this.handler.state.update();
}
