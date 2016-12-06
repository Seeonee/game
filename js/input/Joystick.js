// This handles pulling "joystick" input from either 
// a real gamepad, or an in-browser debug equivalent.
var Joystick = function(game, x, y) {
    this.game.input.gamepad.start();
    this.pad1 = game.input.gamepad.pad1;
    this.angle = 0; // 0 to 2PI
    this.tilt = 0; // 0.0 to 1.0
};

// Updates based on the actual gamepad joystick.
Joystick.prototype.updateGamepadJoystick = function() {
    var lx = this.pad1.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) || 0;
    var ly = this.pad1.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) || 0;
    this.angle = Utils.angleBetweenPoints(0, 0, lx, ly);
    this.tilt = Utils.distanceBetweenPoints(0, 0, lx, ly);
};
