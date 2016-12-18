// This is a middle wrapper for level input.
// Points (and paths) can enable istates here, 
// which will fire after the menu handler but 
// before the default level handler (e.g. movement).
var PointIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    // Set up all of our available states;
    // creation automatically registers them.
    new PortalIState(this, level);
    new WarpIState(this, level);
};

PointIHandler.prototype = Object.create(IHandler.prototype);
PointIHandler.prototype.constructor = PointIHandler;
