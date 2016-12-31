// This is a handler for activating powers.
// It gets wrapped in before movement, but after 
// special input based on the current point.
var PowerIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    new TraceIState(this, level);
};

PowerIHandler.prototype = Object.create(IHandler.prototype);
PowerIHandler.prototype.constructor = PowerIHandler;
