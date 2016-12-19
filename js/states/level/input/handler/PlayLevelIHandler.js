// Default handler for gamepad input during a level.
var PlayLevelIHandler = function(game, gpad, level) {
    IHandler.call(this, game, gpad);
    this.level = level;

    // Set up all of our available states;
    // creation automatically registers them.
    // Aaaaand... we actually have only one state.
    new MoveIState(this, this.level);

    // Set our starting state.
    this.activate(MoveIState.NAME);
};

PlayLevelIHandler.prototype = Object.create(IHandler.prototype);
PlayLevelIHandler.prototype.constructor = PlayLevelIHandler;
