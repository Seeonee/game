// Default handler for gamepad input during level editing.
var EditLevelIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    // Default editor state.
    new EditOverlayIState(this, this.level);

    // Edit states. Lots to do still!
    new StepUpIState(this, this.level);
    new StepDownIState(this, this.level);
    new FloatIState(this, this.level);
    new AddFromPathIState(this, this.level);
    new AddFromPointIState(this, this.level);
    new DeleteIState(this, this.level);
    // new GainKeyIState(this, this.level);
    // new LoseKeyIState(this, this.level);

    // Set our starting state.
    this.activate(EditOverlayIState.NAME);
};

PlayLevelIHandler.prototype = Object.create(IHandler.prototype);
PlayLevelIHandler.prototype.constructor = PlayLevelIHandler;
