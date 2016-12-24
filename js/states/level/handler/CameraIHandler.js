// This is an outer wrapper for camera input.
var CameraIHandler = function(game, gpad, level, ihandler) {
    IHandler.call(this, game, gpad);
    this.level = level;
    this.wrap(ihandler);

    new CameraIState(this);
    this.activate(CameraIState.NAME);
};

CameraIHandler.prototype = Object.create(IHandler.prototype);
CameraIHandler.prototype.constructor = CameraIHandler;
