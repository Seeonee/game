// Pause the game.
var PausedIState = function(handler, level) {
    IMenuState.call(this, PausedIState.NAME, handler, this);
    this.level = level;
    this.dropCloth = true;
    this.blurBackground = true;

    this.root.text = level.name;
    this.addCancel('continue', this.selectContinue);
    var settings = this.add('settings');
    var hud = settings.add('show HUD');
    hud.add('sometimes', this.showHUD);
    hud.add('always', this.showHUD);
    hud.add('never', this.showHUD);
    hud.addCancel('back');
    settings.addCancel('back');
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

// Update HUD.
PausedIState.prototype.showHUD = function(option) {

};

// User opted to unpause.
PausedIState.prototype.selectContinue = function(option) {
    this.unpause();
    this.activate(UnpausedIState.NAME);
};

// User opted to restart.
PausedIState.prototype.selectRestart = function(option) {
    this.unpause();
    this.game.state.start('PlayLevelState', true, false,
        this.level.name, this.gpad);
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
