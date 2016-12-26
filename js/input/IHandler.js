// This is the base handler for a state's input.
// It farms the actual logic out to the currently 
// active IState.
var IHandler = function(game, gpad) {
    this.game = game;
    this.gpad = gpad;
    this.buttonMap = this.game.settings.buttonMap;
    this.states = {};
    this.state = undefined;
    this.wrapped = undefined;
    this.wrapper = undefined;
    // Turn off this.enabled to suspend input.
    // Wrapped handlers will still be allowed 
    // to operate.
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
    if (handled == false && this.wrapped) {
        return this.wrapped.update();
    }
    return handled;
};

// Like update(), but while paused.
IHandler.prototype.pauseUpdate = function() {
    var handled = false;
    if (this.enabled) {
        if (this.state) {
            handled = this.state.pauseUpdate();
        }
    }
    if (handled == false && this.wrapped) {
        return this.wrapped.pauseUpdate();
    }
    return handled;
};

// Give our states a chance to render.
IHandler.prototype.render = function() {
    var handled = false;
    if (this.enabled) {
        if (this.state) {
            handled = this.state.render();
        }
    }
    if (handled == false && this.wrapped) {
        return this.wrapped.render();
    }
    return handled;
};

// Wrap another handler.
// If it's already wrapped, we form a new, 
// tighter wrap around it that its former 
// wrapper will call first.
IHandler.prototype.wrap = function(ihandler) {
    this.wrapped = ihandler;
    var oldWrapper = ihandler.wrapper;
    ihandler.wrapper = this;
    if (oldWrapper) {
        this.wrapper = oldWrapper;
        oldWrapper.wrapped = this;
    }
};

// Unwrap ourselves from another handler.
IHandler.prototype.unwrap = function() {
    if (this.wrapped) {
        this.wrapped.wrapper = this.wrapper;
    }
    if (this.wrapper) {
        this.wrapper.wrapped = this.wrapped;
    }
    this.wrapped = undefined;
    this.wrapper = undefined;
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
    if (next === prev) {
        return;
    }
    if (prev) {
        prev.deactivated(next);
    }
    this.state = next;
    if (next) {
        next.activated(prev);
    }
};

// Test whether a named state is active.
IHandler.prototype.isActive = function(name) {
    return this.state && this.state.name == name;
};

// Propagate any settings changes.
IHandler.prototype.updateSettings = function(settings, recurse) {
    recurse = recurse == undefined ? false : recurse;
    var outermost = this;
    if (!recurse) {
        // Tell our outermost wrapper to start the 
        // recursive updateSettings() chain.
        while (outermost && outermost.wrapper) {
            outermost = outermost.wrapper;
        }
    }
    if (!recurse) {
        // It's no longer our responsibility
        // (unless we were the outermost).
        outermost.updateSettings(settings, true);
    } else {
        // Handle it now, and tell all our states and 
        // wrapped handlers to do the same.
        this.buttonMap = settings.buttonMap;
        var keys = Object.keys(this.states);
        for (var i = 0; i < keys.length; i++) {
            var istate = this.states[keys[i]];
            istate.updateSettings(settings);
        }
        if (this.wrapped) {
            this.wrapped.updateSettings(settings, true);
        }
    }
};


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
// Return false if you want to indicate 
// that sub-handlers can tackle this update.
IState.prototype.update = function() {
    // Subclasses can specifically return false 
    // if they want to indicate that they 
    // did nothing to handle a call.
};

// This will be called by the handler, 
// giving us a chance to update things
// while the game is paused.
IState.prototype.pauseUpdate = function() {
    // Subclasses can specifically return false 
    // if they want to indicate that they 
    // did nothing to handle a call.
};

// This will be called by the handler, 
// giving us a chance to render things.
IState.prototype.render = function() {
    // Subclasses can specifically return false 
    // if they want to indicate that they 
    // did nothing to handle a call.
};

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

// Propagate any settings changes.
IState.prototype.updateSettings = function(settings) {
    this.buttonMap = settings.buttonMap;
};
