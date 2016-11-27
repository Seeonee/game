


// This handles pulling "joystick" input from either 
// a real gamepad, or an in-browser debug equivalent.
var Joystick = function(game, x, y) {
    // Constants, for now.
    this.RADIUS = 75;
    this.DEBUG = false;

    // This is only needed for the debug setup.
    this.bitmap = game.add.bitmapData(2 * this.RADIUS, 2 * this.RADIUS);
    this.bitmap.context.strokeStyle = 'rgb(0, 0, 0);'
    Phaser.Sprite.call(this, game, x, y, this.bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.debugNeeded = 0;

    // Set up the actual gamepad.
    this.game.input.gamepad.start();
    this.pad1 = game.input.gamepad.pad1;

    this.angle = 0; // 0 to 2PI
    this.tilt = 0; // 0.0 to 1.0
};

Joystick.prototype = Object.create(Phaser.Sprite.prototype);
Joystick.prototype.constructor = Joystick;

// Find out if we've got access to a gamepad.
// We don't actually use this yet.
Joystick.prototype.gamepadReady = function() {
    return this.game.input.gamepad.supported && 
        this.game.input.gamepad.active && 
        this.pad1.connected;
};

// Update. If we can't find a gamepad after several tries,
// we give up and use the debug version.
Joystick.prototype.update = function() {
    this.debugNeeded = (!this.gamepadReady()) ? this.debugNeeded + 1 : 0;
    if (this.debugNeeded < 3) {
        this.visible = false;
        this.updateGamepadJoystick();
    } else {
        this.visible = true;
        this.updateDebugJoystick();
    }
}

// Updates based on the actual gamepad joystick.
Joystick.prototype.updateGamepadJoystick = function() {
    var lx = this.pad1.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) || 0;
    var ly = this.pad1.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) || 0;
    this.angle = angleBetweenPoints(0, 0, lx, ly);
    this.tilt = distanceBetweenPoints(0, 0, lx, ly);
};

// Animates and updates based on the debug joystick.
Joystick.prototype.updateDebugJoystick = function() {
    this.bitmap.context.clearRect(0, 0, 2 * this.RADIUS, 2 * this.RADIUS);
    this.bitmap.circle(this.RADIUS, this.RADIUS, this.RADIUS, 'rgb(200, 200, 255)');

    var x = this.game.input.activePointer.x;
    var y = this.game.input.activePointer.y;
    var dx = x - this.x;
    var dy = y - this.y;

    // We want 0rad to be West on the compass.
    // Also want this to be definitely positive.
    this.angle = angleBetweenPoints(this.x, this.y, x, y);
    this.angle = (this.angle + (2 * Math.PI)) % (2 * Math.PI);
    var hyp = Math.sqrt(dx * dx + dy * dy);
    var ratio = 1;
    this.tilt = 1;
    if (hyp > this.RADIUS) {
        ratio = this.RADIUS / hyp;
        dx *= ratio;
        dy *= ratio;
    } else if (hyp < this.RADIUS) {
        ratio = hyp / this.RADIUS;
        this.tilt = ratio;
    }

    this.bitmap.context.beginPath();
    this.bitmap.context.moveTo(this.RADIUS, this.RADIUS);
    this.bitmap.context.lineTo(this.RADIUS + dx, this.RADIUS + dy);
    this.bitmap.context.stroke();
    this.bitmap.dirty = true;
};

