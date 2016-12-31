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
};

// When we stop moving, snap to a halt.
MoveIState.prototype.deactivated = function(next) {
    this.avatar.move(0, 0);
    this.handler.state.update();
};
