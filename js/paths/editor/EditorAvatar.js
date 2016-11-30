// Avatar used to walk around editing the Paths object.
var EditorAvatar = function(game, graphics, paths) {
    Avatar.call(this, game, graphics);
    this.paths = paths;
    this.action = undefined;
    this.buttonTimes = {};
};

EditorAvatar.prototype = Object.create(Avatar.prototype);
EditorAvatar.prototype.constructor = EditorAvatar;

// Constants.
EditorAvatar.ADD_BUTTON = Phaser.Gamepad.PS3XC_X;
EditorAvatar.ADD_CANCEL_BUTTON = Phaser.Gamepad.PS3XC_CIRCLE;
EditorAvatar.FLOAT_BUTTON = Phaser.Gamepad.PS3XC_R2;
EditorAvatar.DELETE_BUTTON = Phaser.Gamepad.PS3XC_CIRCLE;

EditorAvatar.ADD_PATH_MARK_RADIUS = 5;
EditorAvatar.ADD_PATH_SELECTED_MARK_RADIUS = 8;
EditorAvatar.ADD_SNAP_DISTANCE = 15;

EditorAvatar.FLOAT_MAX_SPEED = 200;
EditorAvatar.FLOAT_SNAP_DISTANCE = 15;
EditorAvatar.FLOAT_POINT_ICON_SCALE = 0.9;
EditorAvatar.FLOAT_PATH_ICON_SCALE = 0.7;
EditorAvatar.FLOAT_ICON_SCALE = 0.5;

EditorAvatar.DELETE_COLOR = 0xD92C57;
EditorAvatar.DELETE_MERGE_COLOR = 0xE75D75;


// Quick access to the gamepad.
EditorAvatar.prototype.pad = function() {
    return this.paths.joystick.pad1;
};

// Move at a given angle and ratio of speed (0 to 1).
EditorAvatar.prototype.move = function(angle, ratio) {
    if (this.action) {
        this.action.move(angle, ratio);
    } else {
        Avatar.prototype.move.call(this, angle, ratio);
    }
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
EditorAvatar.prototype.justPressed = function(buttonCode) {
    return this.buttonEvent(buttonCode, this.pad().justPressed);
};

// Figure out if a button was just released, taking into account 
// if we've already consumed this event.
EditorAvatar.prototype.justReleased = function(buttonCode) {
    return this.buttonEvent(buttonCode, this.pad().justReleased);
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
EditorAvatar.prototype.buttonEvent = function(buttonCode, handler) {
    var button = this.pad()._buttons[buttonCode];
    if (!button) {
        return false;
    }
    if (!(buttonCode in this.buttonTimes)) {
        return handler.call(this.pad(), buttonCode);
    }

    var time = Math.max(button.timeDown, button.timeUp);
    if (time > this.buttonTimes[buttonCode]) {
        delete this.buttonTimes[buttonCode];
        return handler.call(this.pad(), buttonCode);
    }
    // Otherwise, ignore it. I.e. don't pass to handler.
};

// Figure out if a button was just pressed, taking into account 
// if we've already consumed this event.
EditorAvatar.prototype.consumeButtonEvent = function(buttonCode) {
    this.buttonTimes[buttonCode] = this.game.time.time + 1;
};

// Optional physics debug view.
EditorAvatar.prototype.update = function() {
    // Action already underway?
    if (this.action) {
        this.action.update(this);
    } else {
        // Starting an action?
        if (this.justReleased(EditorAvatar.ADD_BUTTON)) {
            if (this.path) {
                this.action = new AddFromPathAction(this);
            } else if (this.point) {
                this.action = new AddFromPointAction(this);
            }
        } else if (this.justPressed(EditorAvatar.DELETE_BUTTON)) {
            this.action = new DeleteAction(this);
        } else if (this.justPressed(EditorAvatar.FLOAT_BUTTON)) {
            this.action = new FloatAction(this);
        }

        if (this.action) {
            // If we are now performing an action, let's do it!
            this.action.update();
        } else {
            // Guess it's plain old nothing!
            Avatar.prototype.update.call(this);
        }
    }
};
