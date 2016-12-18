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
    var catalogLevel = this.level.catalogLevel.next();
    this.game.state.start('PlayLevelState', true, false,
        catalogLevel, this.gpad);
};

// User opted to restart.
EndIState.prototype.selectRestart = function(option) {
    this.game.state.start('PlayLevelState', true, false,
        this.level.catalogLevel, this.gpad);
};

// User opted to exit.
EndIState.prototype.selectExit = function(option) {
    var palette = this.level.tier.palette;
    this.game.state.start('TitleMenuState', true, false, palette);
};
