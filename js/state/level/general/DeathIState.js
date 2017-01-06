// Player has died.
var DeathIState = function(handler) {
    IState.call(this, DeathIState.NAME, handler);
};

DeathIState.NAME = 'death';
DeathIState.prototype = Object.create(IState.prototype);
DeathIState.prototype.constructor = DeathIState;

// Handle an update.
DeathIState.prototype.update = function() {
    if (this.gpad.justReleased(this.buttonMap.SELECT) ||
        this.gpad.justReleased(this.buttonMap.START)) {
        var params = this.game.state.getCurrentState().params;
        params.restart = true;
        var state = this.game.state.getCurrentState().key;
        this.game.state.start(state, true, false, params);
    }
};
