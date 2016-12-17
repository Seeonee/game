// Class that stores all of our button mappings.
var ButtonMappings = function() {
    // Initialize with defaults.
    // Basic menu actions.
    this.START = Phaser.Gamepad.PS3XC_START;
    this.SELECT = Phaser.Gamepad.PS3XC_X;
    this.CANCEL = Phaser.Gamepad.PS3XC_CIRCLE;

    // Player avatar controls during a level.
    this.MOVE_X = Phaser.Gamepad.PS3XC_STICK_LEFT_X;
    this.MOVE_Y = Phaser.Gamepad.PS3XC_STICK_LEFT_Y;
    this.PORTAL = Phaser.Gamepad.PS3XC_X;

    // Level editor controls.
    this.EDIT_STEP_DOWN = Phaser.Gamepad.PS3XC_SQUARE;
    this.EDIT_STEP_UP = Phaser.Gamepad.PS3XC_TRIANGLE;
    this.EDIT_ADD = Phaser.Gamepad.PS3XC_X;
    this.EDIT_FLOAT = Phaser.Gamepad.PS3XC_R2;
    this.EDIT_DELETE = Phaser.Gamepad.PS3XC_CIRCLE;
    this.EDIT_LOSE_KEY = Phaser.Gamepad.PS3XC_DPAD_UP;
    this.EDIT_GAIN_KEY = Phaser.Gamepad.PS3XC_DPAD_DOWN;
};

// Restore a JSON'd ButtonMappings object.
ButtonMappings.load = function(json) {
    var buttonMap = new ButtonMappings();
    var keys = Object.keys(json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        buttonMap[key] = json[key];
    }
    return buttonMap;
};
