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
    this.WARP = undefined;

    // Level editor controls.
    this.EDIT_STEP_DOWN = undefined;
    this.EDIT_STEP_UP = undefined;
    this.EDIT_ADD = undefined;
    this.EDIT_FLOAT = undefined;
    this.EDIT_DELETE = undefined;
    this.EDIT_MODE_UP = undefined;
    this.EDIT_MODE_DOWN = undefined;
};

// Get the name of a button.
ButtonMappings.prototype.buttonName = function(buttonCode) {
    return 'unknown'; // Override me!
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
    this.WARP = this.SELECT;

    // Level editor controls.
    this.EDIT_STEP_DOWN = Phaser.Gamepad.PS3XC_L1;
    this.EDIT_STEP_UP = Phaser.Gamepad.PS3XC_R1;
    this.EDIT_ADD = this.SELECT;
    this.EDIT_FLOAT = Phaser.Gamepad.PS3XC_R2;
    this.EDIT_DELETE = this.CANCEL;
    this.EDIT_MODE_UP = Phaser.Gamepad.PS3XC_DPAD_UP;
    this.EDIT_MODE_DOWN = Phaser.Gamepad.PS3XC_DPAD_DOWN;
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
    this.WARP = this.SELECT;

    // Level editor controls.
    this.EDIT_STEP_DOWN = Phaser.Gamepad.XBOX360_LEFT_BUMPER;
    this.EDIT_STEP_UP = Phaser.Gamepad.XBOX360_RIGHT_BUMPER;
    this.EDIT_ADD = this.SELECT;
    this.EDIT_FLOAT = Phaser.Gamepad.XBOX360_RIGHT_TRIGGER;
    this.EDIT_DELETE = this.CANCEL;
    this.EDIT_MODE_UP = Phaser.Gamepad.XBOX360_DPAD_UP;
    this.EDIT_MODE_DOWN = Phaser.Gamepad.XBOX360_DPAD_DOWN;
};


// Get the name of a button.
ButtonMappingsPlaystation.prototype.buttonName = function(buttonCode) {
    switch (buttonCode) {
        case Phaser.Gamepad.PS3XC_X:
            return 'X';
        case Phaser.Gamepad.PS3XC_CIRCLE:
            return 'O';
        case Phaser.Gamepad.PS3XC_SQUARE:
            return 'Square';
        case Phaser.Gamepad.PS3XC_TRIANGLE:
            return 'Triangle';
        case Phaser.Gamepad.PS3XC_L1:
            return 'L1';
        case Phaser.Gamepad.PS3XC_R1:
            return 'R1';
        case Phaser.Gamepad.PS3XC_L2:
            return 'L2';
        case Phaser.Gamepad.PS3XC_R2:
            return 'R2';
        case Phaser.Gamepad.PS3XC_SELECT:
            return 'Select';
        case Phaser.Gamepad.PS3XC_START:
            return 'Start / Options';
        case Phaser.Gamepad.PS3XC_STICK_LEFT_BUTTON:
            return 'L3';
        case Phaser.Gamepad.PS3XC_STICK_RIGHT_BUTTON:
            return 'R3';
        case Phaser.Gamepad.PS3XC_DPAD_UP:
            return 'D-Up';
        case Phaser.Gamepad.PS3XC_DPAD_DOWN:
            return 'D-Down';
        case Phaser.Gamepad.PS3XC_DPAD_LEFT:
            return 'D-Left';
        case Phaser.Gamepad.PS3XC_DPAD_RIGHT:
            return 'D-Right';
        case Phaser.Gamepad.PS3XC_STICK_LEFT_X:
            return 'Left stick';
        case Phaser.Gamepad.PS3XC_STICK_LEFT_Y:
            return 'Left stick';
        case Phaser.Gamepad.PS3XC_STICK_RIGHT_X:
            return 'Right stick';
        case Phaser.Gamepad.PS3XC_STICK_RIGHT_Y:
            return 'Right stick';
        default:
            return 'unknown'; // Override me!
    }
};

// Get the name of a button.
ButtonMappingsXbox.prototype.buttonName = function(buttonCode) {
    switch (buttonCode) {
        case Phaser.Gamepad.XBOX360_A:
            return 'A';
        case Phaser.Gamepad.XBOX360_B:
            return 'B';
        case Phaser.Gamepad.XBOX360_X:
            return 'X';
        case Phaser.Gamepad.XBOX360_Y:
            return 'Y';
        case Phaser.Gamepad.XBOX360_LEFT_BUMPER:
            return 'LB';
        case Phaser.Gamepad.XBOX360_RIGHT_BUMPER:
            return 'RB';
        case Phaser.Gamepad.XBOX360_LEFT_TRIGGER:
            return 'LT';
        case Phaser.Gamepad.XBOX360_RIGHT_TRIGGER:
            return 'RT';
        case Phaser.Gamepad.XBOX360_BACK:
            return 'Back';
        case Phaser.Gamepad.XBOX360_START:
            return 'Start';
        case Phaser.Gamepad.XBOX360_STICK_LEFT_BUTTON:
            return 'L3';
        case Phaser.Gamepad.XBOX360_STICK_RIGHT_BUTTON:
            return 'R3';
        case Phaser.Gamepad.XBOX360_DPAD_LEFT:
            return 'D-Left';
        case Phaser.Gamepad.XBOX360_DPAD_RIGHT:
            return 'D-Right';
        case Phaser.Gamepad.XBOX360_DPAD_UP:
            return 'D-Up';
        case Phaser.Gamepad.XBOX360_DPAD_DOWN:
            return 'D-Down';
        case Phaser.Gamepad.XBOX360_STICK_LEFT_X:
            return 'Left stick';
        case Phaser.Gamepad.XBOX360_STICK_LEFT_Y:
            return 'Left stick';
        case Phaser.Gamepad.XBOX360_STICK_RIGHT_X:
            return 'Right stick';
        case Phaser.Gamepad.XBOX360_STICK_RIGHT_Y:
            return 'Right stick';
        default:
            return 'unknown';
    }
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
