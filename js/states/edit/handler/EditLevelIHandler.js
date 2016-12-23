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
    // new CustomizePointIState(this, this.level);

    // Test states.
    this.modes.push(new TestLevelIState(this, this.level));

    // Reset the level.
    this.modes.push(new ResetLevelIState(this, this.level));

    // Save the level.
    this.modes.push(new SaveLevelIState(this, this.level));

    // Set our starting state.
    this.activate(GeneralEditIState.NAME);
};

EditLevelIHandler.prototype = Object.create(IHandler.prototype);
EditLevelIHandler.prototype.constructor = EditLevelIHandler;


// Checks for a mode toggle, and cycles as needed.
// Returns true if the mode was cycled.
EditLevelIHandler.prototype.cycle = function() {
    if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_UP)) {
        this.gpad.consumeButtonEvent();
        this.mode = (this.mode + 1) % this.modes.length;
        this.activate(this.modes[this.mode].name);
        return true;
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_MODE_DOWN)) {
        this.gpad.consumeButtonEvent();
        this.mode = (this.mode + this.modes.length - 1) % this.modes.length;
        this.activate(this.modes[this.mode].name);
        return true;
    }
    return false;
};