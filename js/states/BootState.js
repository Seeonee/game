// This is our very first state, 
// launched before we even hit preload.
// It's only real job is to load any assets 
// that preload depends on.
var BootState = function(game) {};

// Load the progress bar that'll be used by preload.
BootState.prototype.preload = function() {
    this.game.load.image('loadingBar', 'assets/loadingBar.png');
};

// Our only job on creation is to transition 
// into preload.
BootState.prototype.create = function() {
    this.game.settings = new Settings();
    this.game.stage.backgroundColor = this.game.settings.colors.BACKGROUND.i;
    this.game.state.start('PreloadState');
};
