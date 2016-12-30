// Default handler for gamepad input during a level.
// This is basically the fallback movement handler.
var MoveIState = function(handler, level) {
    IState.call(this, MoveIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

MoveIState.NAME = IHandler.DEFAULT_STATE_NAME;
MoveIState.prototype = Object.create(IState.prototype);
MoveIState.prototype.constructor = MoveIState;

// Called on update.
MoveIState.prototype.update = function() {
    var joystick = this.gpad.getAngleAndTilt();
    this.avatar.move(joystick.angle, joystick.tilt);
    if (this.gpad.justReleased(this.buttonMap.EDIT_STEP_UP)) {
        this.gpad.consumeButtonEvent();
        if (this.avatar.trace == undefined) {
            this.avatar.trace = new Trace(this.avatar);
        }
        var trace = this.avatar.trace;
        if (trace.dying) {
            return;
        }
        if (!trace.alive) {
            trace.reset(this.avatar, this.level.tier);
        } else if (trace.tier === this.level.tier) {
            this.avatar.point = trace.point;
            this.avatar.path = trace.path;
            this.avatar.x = trace.x;
            this.avatar.y = trace.y;
            this.avatar.updateAttachment();
            trace.recall();
        }
    }
};

// When we stop moving, snap to a halt.
MoveIState.prototype.deactivated = function(next) {
    this.avatar.move(0, 0);
    this.handler.state.update();
};
