// Default handler for gamepad input during a level.
var PlayLevelIHandler = function(game, gpad, level) {
    IHandler.call(this, game, gpad);
    this.level = level;

    // Set up all of our available states;
    // creation automatically registers them.
    new DefaultLevelIState(this, this.level);
    new StepUpIState(this, this.level);
    new StepDownIState(this, this.level);
    new FloatIState(this, this.level);
    new AddFromPathIState(this, this.level);
    new AddFromPointIState(this, this.level);
    new DeleteIState(this, this.level);

    // Set our starting state.
    this.activate(DefaultLevelIState.NAME);
};

PlayLevelIHandler.prototype = Object.create(IHandler.prototype);
PlayLevelIHandler.prototype.constructor = PlayLevelIHandler;
