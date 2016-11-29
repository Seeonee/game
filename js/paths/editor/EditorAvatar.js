// Avatar used to walk around editing the Paths object.
var EditorAvatar = function(game, graphics, paths) {
    Avatar.call(this, game, graphics);
    this.paths = paths;
    this.action = undefined;
};

EditorAvatar.prototype = Object.create(Avatar.prototype);
EditorAvatar.prototype.constructor = EditorAvatar;

// Constants.
EditorAvatar.DELETE_BUTTON = Phaser.Gamepad.PS3XC_CIRCLE;
EditorAvatar.FLOAT_BUTTON = Phaser.Gamepad.PS3XC_R2;
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

// Optional physics debug view.
EditorAvatar.prototype.update = function() {
    // Action already underway?
    if (this.action) {
        this.action.update(this);
    } else {
        // Starting an action?
        if (this.pad().justPressed(EditorAvatar.DELETE_BUTTON)) {
            this.action = new DeleteAction(this);
        } else if (this.pad().justPressed(EditorAvatar.FLOAT_BUTTON)) {
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
