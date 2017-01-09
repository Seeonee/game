// Pause the game.
var PausedIState = function(handler, level) {
    IMenuState.call(this, PausedIState.NAME, handler, this);
    this.level = level;

    this.root.text = level.name;
    this.addCancel('continue', this.selectContinue);
    var settings = Settings.Menu.populateSubmenu(this.root);
    settings.events.onSettingsUpdate.add(
        this.handler.updateSettings, this.handler);
    this.add('restart', this.selectRestart);
    this.add('exit', this.selectExit);
};

PausedIState.NAME = 'paused';
PausedIState.prototype = Object.create(IMenuState.prototype);
PausedIState.prototype.constructor = PausedIState;

// Called when the game is first paused.
PausedIState.prototype.activated = function(prev) {
    this.game.paused = true;
    this.color = this.level.tier.palette.c1;
    IMenuState.prototype.activated.call(this, prev);
};

// Propagate any settings changes.
PausedIState.prototype.updateSettings = function(settings) {
    IMenuState.prototype.updateSettings.call(this, settings);
    this.level.updateSettings(settings);
};

// User opted to unpause.
PausedIState.prototype.selectContinue = function(option) {
    this.unpause();
    this.activate(UnpausedIState.NAME);
};

// User opted to restart.
PausedIState.prototype.selectRestart = function(option) {
    this.unpause();
    this.game.state.getCurrentState().restartLevel();
    this.activate(UnpausedIState.NAME);
};

// User opted to exit.
PausedIState.prototype.selectExit = function(option) {
    this.unpause();
    var palette = this.level.tier.palette;
    this.game.state.start('TitleMenuState', true, false, palette);
};

// Unpause the game.
PausedIState.prototype.unpause = function() {
    this.close();
    this.game.paused = false;
};
