// This handles pulling "joystick" input from either 
// a real gamepad, or an in-browser debug equivalent.
var GPad = function(game, pad) {
    this.game = game;
    this.pad = pad;
    this.baseTime = this.game.time.time;
    this.buttonTimes = {};

    this.angle = 0; // 0 to 2PI
    this.tilt = 0; // 0.0 to 1.0
};

// Find out if we've got access to a gamepad.
// We don't actually use this yet.
GPad.prototype.gamepadReady = function() {
    return this.game.input.gamepad.supported &&
        this.game.input.gamepad.active &&
        this.pad.connected;
};

// Updates based on the actual gamepad joystick.
// Returns an object with .angle and .tilt keys.
GPad.prototype.getAngleAndTilt = function() {
    var lx = this.pad.axis(this.game.settings.buttonMap.MOVE_X) || 0;
    var ly = this.pad.axis(this.game.settings.buttonMap.MOVE_Y) || 0;
    this.angle = Utils.angleBetweenPoints(0, 0, lx, ly);
    this.tilt = Utils.distanceBetweenPoints(0, 0, lx, ly);
    return { angle: this.angle, tilt: this.tilt };
};

// Returns true if any tilt (+angle) is being applied.
GPad.prototype.isTilted = function() {
    var lx = this.pad.axis(this.game.settings.buttonMap.MOVE_X) || 0;
    var ly = this.pad.axis(this.game.settings.buttonMap.MOVE_Y) || 0;
    return lx != 0 || ly != 0;
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
GPad.prototype.justPressed = function(buttonCode) {
    return this.buttonEvent(buttonCode,
        'timeDown', this.pad.justPressed);
};

// Figure out if a button was just released, taking into account 
// if we've already consumed this event.
GPad.prototype.justReleased = function(buttonCode) {
    return this.buttonEvent(buttonCode,
        'timeUp', this.pad.justReleased);
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
GPad.prototype.buttonEvent = function(buttonCode, timeName, handler) {
    var button = this.pad._buttons[buttonCode];
    if (!button) {
        return;
    }
    var time = button[timeName];
    if (time <= this.baseTime) {
        return;
    }
    if (!(buttonCode in this.buttonTimes)) {
        return handler.call(this.pad, buttonCode);
    }
    if (time > this.buttonTimes[buttonCode]) {
        delete this.buttonTimes[buttonCode];
        return handler.call(this.pad, buttonCode);
    }
    // Otherwise, ignore it. I.e. don't pass to handler.
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
GPad.prototype.consumeButtonEvent = function(buttonCode) {
    var t = this.game.time.time + 1;
    if (buttonCode) {
        this.buttonTimes[buttonCode] = t;
    } else {
        this.baseTime = t;
    }
};
