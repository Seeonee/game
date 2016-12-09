// Handle basic movement during a level.
var MoveIState = function(handler, level) {
    IState.call(this, MoveIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

MoveIState.NAME = 'move';
MoveIState.prototype = Object.create(IState.prototype);
MoveIState.prototype.constructor = MoveIState;

// Handle an update while tilting the joystick.
MoveIState.prototype.update = function() {
    var joystick = this.gpad.getAngleAndTilt();
    this.avatar.move(joystick.angle, joystick.tilt);
    this.activate(DefaultLevelIState.NAME);
};
