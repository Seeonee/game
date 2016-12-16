// This is an outer wrapper for input handling 
// during a level. Its only job is to make sure 
// that a pause input is always handled regardless 
// of state.
var PlayLevelMenuIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    // Set up all of our available states;
    // creation automatically registers them.
    new UnpausedIState(this);
    new PausedIState(this, level);

    // Set our starting state.
    this.activate(UnpausedIState.NAME);
};

PlayLevelMenuIHandler.prototype = Object.create(IHandler.prototype);
PlayLevelMenuIHandler.prototype.constructor = PlayLevelMenuIHandler;
