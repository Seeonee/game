// Pause the game.
var UnpausedIState = function(handler, ihandler) {
    IState.call(this, UnpausedIState.NAME, handler);
    this.ihandler = ihandler; // Wrapped handler.
};

UnpausedIState.NAME = 'unpaused';
UnpausedIState.prototype = Object.create(IState.prototype);
UnpausedIState.prototype.constructor = UnpausedIState;

// Handle an update.
UnpausedIState.prototype.update = function() {
    if (this.gpad.justReleased(this.buttonMap.PAUSE_BUTTON)) {
        this.activate(PausedIState.NAME);
    } else {
        this.ihandler.update();
    }
};

// Handle a render.
UnpausedIState.prototype.render = function() {
    this.ihandler.render();
};
