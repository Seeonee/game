// Default handler for gamepad input during level editing.
var EditLevelIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    this.modes = [];
    this.mode = 0;

    // Default editor state.
    this.modes.push(new GeneralEditIState(this, this.level));

    // Edit states.
    new StepUpIState(this, this.level);
    new StepDownIState(this, this.level);
    new FloatIState(this, this.level);
    new AddFromPathIState(this, this.level);
    new AddFromPointIState(this, this.level);
    new AddFromFloatIState(this, this.level);
    new DeleteIState(this, this.level);
    new DisablePointIState(this, this.level);
    new CustomizePointIState(this, this.level);

    // Customization-specific states.
    new CustomizeStartPointIState(this, this.level);
    new CustomizeEndPointIState(this, this.level);
    new CustomizeSwitchPointIState(this, this.level);
    new CustomizeWarpPointIState(this, this.level);
    new CustomizePortalPointIState(this, this.level);
    new CustomizePowerPointIState(this, this.level);
    new CustomizeJunctionPointIState(this, this.level);
    new CustomizeNormalPointIState(this, this.level);

    // Wires.
    this.modes.push(new WireEditorIState(this, this.level));
    new AddWireIState(this, this.level);
    new DeleteWireIState(this, this.level);

    // Objects/obstacles.
    this.modes.push(new ObstacleEditorIState(this, this.level));
    new AddObstacleIState(this, this.level);
    new DeleteObstacleIState(this, this.level);

    // Creation-specific states.
    new CreateShardIState(this, this.level);
    new CreateItemIState(this, this.level);
    new CreateDoorIState(this, this.level);
    new CreateMaskIState(this, this.level);
    new CreateSentryIState(this, this.level);
    new CreateFireballIState(this, this.level);

    // Text.
    this.modes.push(new TextEditorIState(this, this.level));
    // new AddTextIState(this, this.level);
    new DeleteTextIState(this, this.level);

    // Change level properties.
    this.modes.push(new LevelPropertiesIState(this, this.level));

    // Display controls..
    this.modes.push(new EditControlsIState(this, this.level));

    // Save the level.
    this.modes.push(new SaveLevelIState(this, this.level));

    // Reset the level.
    this.modes.push(new ResetLevelIState(this, this.level));

    // Test states.
    this.modes.push(new TestLevelIState(this, this.level));

    // Set our starting state.
    this.activate(GeneralEditIState.NAME);
};

EditLevelIHandler.prototype = Object.create(IHandler.prototype);
EditLevelIHandler.prototype.constructor = EditLevelIHandler;


// Checks for a mode toggle, and cycles as needed.
// Returns true if the mode was cycled.
EditLevelIHandler.prototype.cycle = function() {
    if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_RIGHT)) {
        this.gpad.consumeButtonEvent();
        this.mode = (this.mode + 1) % this.modes.length;
        this.activate(this.modes[this.mode].name);
        return true;
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_LEFT)) {
        this.gpad.consumeButtonEvent();
        this.mode = (this.mode + this.modes.length - 1) % this.modes.length;
        this.activate(this.modes[this.mode].name);
        return true;
    }
    return false;
};

// Add cycle arrows to a help text block.
EditLevelIHandler.addArrows = function(s, line) {
    s = s.replace(' ◂▸', '');
    line = line == undefined ? 0 : line;
    var index = -1;
    do {
        index = s.indexOf('\n', index + 1);
        line -= 1;
    } while (line >= 0);
    index = index >= 0 ? index : s.length;
    return s.substring(0, index) + ' ◂▸' + s.substring(index);
};
