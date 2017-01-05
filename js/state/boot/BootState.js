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
    // this.game.stage.smoothed = false;
    this.game.settings = new Settings();
    var i = Math.floor(Math.random() * (7 + 1)) % 7;
    this.palette = this.game.settings.colors['t' + i];
    this.game.stage.backgroundColor = this.palette.c3.i;
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
    this.game.state.start('PreloadState', true, false, this.palette);
};
