// Class that stores all of our button mappings.
var ButtonMappings = function() {
    // Initialize with defaults.
    // Basic menu actions.
    this.START = undefined;
    this.SELECT = undefined;
    this.CANCEL = undefined;

    // Player avatar controls during a level.
    this.MOVE_X = undefined;
    this.MOVE_Y = undefined;
    this.PORTAL = undefined;

    // Level editor controls.
    this.EDIT_STEP_DOWN = undefined;
    this.EDIT_STEP_UP = undefined;
    this.EDIT_ADD = undefined;
    this.EDIT_FLOAT = undefined;
    this.EDIT_DELETE = undefined;
    this.EDIT_LOSE_KEY = undefined;
    this.EDIT_GAIN_KEY = undefined;
};

// Mappings for PS4 controller.
var ButtonMappingsPlaystation = function() {
    // Initialize with defaults.
    // Basic menu actions.
    this.START = Phaser.Gamepad.PS3XC_START;
    this.SELECT = Phaser.Gamepad.PS3XC_X;
    this.CANCEL = Phaser.Gamepad.PS3XC_CIRCLE;

    // Player avatar controls during a level.
    this.MOVE_X = Phaser.Gamepad.PS3XC_STICK_LEFT_X;
    this.MOVE_Y = Phaser.Gamepad.PS3XC_STICK_LEFT_Y;
    this.PORTAL = this.SELECT;

    // Level editor controls.
    this.EDIT_STEP_DOWN = Phaser.Gamepad.PS3XC_SQUARE;
    this.EDIT_STEP_UP = Phaser.Gamepad.PS3XC_TRIANGLE;
    this.EDIT_ADD = this.SELECT;
    this.EDIT_FLOAT = Phaser.Gamepad.PS3XC_R2;
    this.EDIT_DELETE = this.CANCEL;
    this.EDIT_LOSE_KEY = Phaser.Gamepad.PS3XC_DPAD_UP;
    this.EDIT_GAIN_KEY = Phaser.Gamepad.PS3XC_DPAD_DOWN;
};

// Mappings for XBOX controller. Untested!
var ButtonMappingsXbox = function() {
    // Initialize with defaults.
    // Basic menu actions.
    this.START = Phaser.Gamepad.XBOX360_START;
    this.SELECT = Phaser.Gamepad.XBOX360_A;
    this.CANCEL = Phaser.Gamepad.XBOX360_B;

    // Player avatar controls during a level.
    this.MOVE_X = Phaser.Gamepad.XBOX360_STICK_LEFT_X;
    this.MOVE_Y = Phaser.Gamepad.XBOX360_STICK_LEFT_Y;
    this.PORTAL = this.SELECT;

    // Level editor controls.
    this.EDIT_STEP_DOWN = Phaser.Gamepad.XBOX360_X;
    this.EDIT_STEP_UP = Phaser.Gamepad.XBOX360_Y;
    this.EDIT_ADD = this.SELECT;
    this.EDIT_FLOAT = Phaser.Gamepad.XBOX360_RIGHT_TRIGGER;
    this.EDIT_DELETE = this.CANCEL;
    this.EDIT_LOSE_KEY = Phaser.Gamepad.XBOX360_DPAD_UP;
    this.EDIT_GAIN_KEY = Phaser.Gamepad.XBOX360_DPAD_DOWN;
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
