// Pause the game.
var UnpausedIState = function(handler) {
    IState.call(this, UnpausedIState.NAME, handler);
};

UnpausedIState.NAME = 'unpaused';
UnpausedIState.prototype = Object.create(IState.prototype);
UnpausedIState.prototype.constructor = UnpausedIState;

// Handle an update.
UnpausedIState.prototype.update = function() {
    if (this.gpad.justReleased(this.buttonMap.PAUSE)) {
        this.activate(PausedIState.NAME);
    } else {
        return false;
    }
};

// Handle a render.
UnpausedIState.prototype.render = function() {
    return false;
};
