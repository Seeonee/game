// This state is responsible for loading 
// all primary assets.
// Note that other states may be allowed to 
// load rarely-used assets on their own later.
var PreloadState = function(game) {};

// Load the commonly-used game assets.
PreloadState.prototype.preload = function() {
    this.initializeLoadingBar();

    this.game.load.image('keyplate', 'assets/keyplate.png');
    this.game.load.image('keyhole_w', 'assets/keyhole_w.png');
    this.game.load.image('keyhole_c', 'assets/keyhole_c.png');
    this.game.load.image('smoke', 'assets/smoke.png');

    // this.game.load.image('herne', 'assets/mask_herne.png');
    // this.game.load.image('norwife', 'assets/mask_norwife.png');
    // this.game.load.image('ragna', 'assets/mask_ragna.png');
    // this.game.load.image('dunlevy', 'assets/mask_dunlevy.png');

    this.game.load.image('power_diamond', 'assets/powerdiamond.png');
    this.game.load.image('power_icon_crown', 'assets/power_crown.png');
    this.game.load.image('power_icon_hourglass', 'assets/power_hourglass.png');
    this.game.load.image('power_icon_stealth', 'assets/power_stealth.png');
    this.game.load.image('power_icon_might', 'assets/power_might.png');
    this.game.load.image('power_icon_wit', 'assets/power_wit.png');
    this.game.load.image('power_icon_presence', 'assets/power_presence.png');
    this.game.load.image('power_icon_sword', 'assets/power_sword.png');
    this.game.load.image('power_icon_axe', 'assets/power_axe.png');
    this.game.load.image('power_icon_shield', 'assets/power_shield.png');

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
