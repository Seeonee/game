// TODO: Get rid of this eventually!!!
var AVATAR_GRAPHICS = AvatarGraphicsKey;
// var AVATAR_GRAPHICS = AvatarGraphicsBall;

// This state is responsible for loading 
// all primary assets.
// Note that other states may be allowed to 
// load rarely-used assets on their own later.
var PreloadState = function(game) {};

// Load the commonly-used game assets.
PreloadState.prototype.preload = function() {
    this.initializeLoadingBar();
    AVATAR_GRAPHICS.preload(game);
    // TODO: Do the rest of the this.game.load.image() calls here!
};

// Set up the progress bar that tracks our asset loading.
PreloadState.prototype.initializeLoadingBar = function() {
    var loadingBar = this.add.sprite(
        this.game.width / 2, this.game.height / 2, 'loadingBar');
    loadingBar.x -= loadingBar.width / 2;
    loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(loadingBar);
};

// Created? Moving on!
PreloadState.prototype.create = function() {
    this.game.state.start('TitleMenuState');
};
