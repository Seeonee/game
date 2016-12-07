// Class that stores all of our button mappings.
var ButtonMappings = function() {
    // Initialize with defaults.
    this.MOVE_X = Phaser.Gamepad.PS3XC_STICK_LEFT_X;
    this.MOVE_Y = Phaser.Gamepad.PS3XC_STICK_LEFT_Y;
    this.ADD_BUTTON = Phaser.Gamepad.PS3XC_X;
    this.ADD_CANCEL_BUTTON = Phaser.Gamepad.PS3XC_CIRCLE;
    this.FLOAT_BUTTON = Phaser.Gamepad.PS3XC_R2;
    this.DELETE_BUTTON = Phaser.Gamepad.PS3XC_CIRCLE;
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