// Pause the game.
var EndIState = function(handler, level) {
    IMenuState.call(this, EndIState.NAME, handler, this);
    this.level = level;
    this.avatar = this.level.avatar;

    this.root.text = level.name + ' complete';
    this.add('next level', this.selectNextLevel);
    this.add('restart', this.selectRestart);
    this.add('exit', this.selectExit);
};

EndIState.NAME = 'paused';
EndIState.prototype = Object.create(IMenuState.prototype);
EndIState.prototype.constructor = EndIState;

// Called when the player gets to the end point.
EndIState.prototype.activated = function(prev) {
    // Don't let the menu activate yet.
};

// Don't do anything while paused.
EndIState.prototype.pauseUpdate = function() {
    return false;
};

// Update loop.
EndIState.prototype.update = function() {
    if (this.charging) {
        return;
    }
    if (this.charged) {
        IMenuState.prototype.update.call(this);
        return;
    }
    if (this.avatar.point.isEnabled() &&
        this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.chargeUp();
    } else {
        return false;
    }
};

// Begin the gfx leading to the end menu.
EndIState.prototype.chargeUp = function() {
    this.charging = true;
    this.game.state.getCurrentState().menuhandler.enabled = false;

    var tier = this.level.tier;
    var endPoint = this.avatar.point;
    tier.events.onFadingOut.remove(endPoint.fadingOut, endPoint);
    this.avatar.point.chargeUp(this.fullyCharged, this);
};

// Called when the gfx are complete.
EndIState.prototype.fullyCharged = function() {
    this.charging = false;
    this.charged = true;
    // *Now* let our menu activate.
    this.color = this.level.tier.palette.c1;
    IMenuState.prototype.activated.call(this);
};

// User opted to play the next level.
EndIState.prototype.selectNextLevel = function(option) {
    var params = new LevelStateParams(this.gpad);
    params.catalogLevel = this.game.state.getCurrentState()
        .catalogLevel.next();
    var state = this.game.state.getCurrentState().key;
    this.game.state.start(state, true, false, params);
};

// User opted to restart.
EndIState.prototype.selectRestart = function(option) {
    var params = this.game.state.getCurrentState().params;
    params.restart = true;
    var state = this.game.state.getCurrentState().key;
    this.game.state.start(state, true, false, params);
};

// User opted to exit.
EndIState.prototype.selectExit = function(option) {
    var palette = this.level.tier.palette;
    this.game.state.start('TitleMenuState', true, false, palette);
};
