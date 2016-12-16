// This is the base handler for a state's input.
// It farms the actual logic out to the currently 
// active IState.
var IHandler = function(game, gpad) {
    this.game = game;
    this.gpad = gpad;
    this.buttonMap = this.game.settings.buttonMap;
    this.states = {};
    this.state = undefined;
    // Turn off this.enabled to suspend input.
    this.enabled = true;
};

// Some constants.
IHandler.DEFAULT_STATE_NAME = 'default';

// On update, farm out work to our current state.
// States are allowed to reach back and change 
// our state to affect how we'll process future 
// input.
IHandler.prototype.update = function() {
    var handled = false;
    if (this.enabled) {
        if (this.state) {
            handled = this.state.update();
        } else if (this.states[IHandler.DEFAULT_STATE_NAME]) {
            this.activate(IHandler.DEFAULT_STATE_NAME);
            handled = this.state.update();
        }
    }
    return handled;
};

// Like update(), but while paused.
IHandler.prototype.pauseUpdate = function() {
    if (this.enabled && this.state) {
        this.state.pauseUpdate();
    }
};

// Give our states a chance to render.
IHandler.prototype.render = function() {
    if (this.enabled && this.state) {
        this.state.render();
    }
};

// Set the current state to a named one.
// If the named state isn't defined or if 
// no name is passed, all state is cleared.
// When states transition, the previous 
// state's deactivated() is called with 
// the next state as an argument, and the 
// next state's activated() is called with 
// the previous state as an argument.
IHandler.prototype.activate = function(name) {
    var prev = this.state;
    var next = this.states[name];
    if (prev) {
        prev.deactivated(next);
    }
    this.state = next;
    if (next) {
        next.activated(prev);
    }
}

// An input handling state (base class).
// Takes in a unique name and an IHandler.
// Registers itself under the handler for 
// later use by other states.
// Also sets up easy passthrough vars to 
// .game, .gpad, and .buttonMap on the handler.
var IState = function(name, handler) {
    this.name = name;
    this.handler = handler;
    this.game = this.handler.game;
    this.gpad = this.handler.gpad;
    this.buttonMap = this.handler.buttonMap;
    this.handler.states[name] = this;
};

// This will be called by the handler, 
// giving us a chance to update things.
IState.prototype.update = function() {};

// This will be called by the handler, 
// giving us a chance to update things
// while the game is paused.
IState.prototype.pauseUpdate = function() {};

// This will be called by the handler, 
// giving us a chance to render things.
IState.prototype.render = function() {};

// Convenience method to activate a named 
// state in our handler.
IState.prototype.activate = function(name) {
    this.handler.activate(name);
};

// Check if we're active.
IState.prototype.isActive = function() {
    return this.handler.state === this;
};

// Called when we become the active state.
// If defined, prev is the state that was 
// just active.
IState.prototype.activated = function(prev) {};

// Called when we stop being the active state.
// If defined, next is the state that is 
// becoming active.
IState.prototype.deactivated = function(next) {};
