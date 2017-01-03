// This state is responsible for loading 
// all primary assets.
// Note that other states may be allowed to 
// load rarely-used assets on their own later.
var PreloadState = function(game) {};

// The color palette to use.
PreloadState.prototype.init = function(palette) {
    this.palette = palette;
};

// Load the commonly-used game assets.
PreloadState.prototype.preload = function() {
    this.initializeLoadingBar();

    this.game.load.image('keyplate', 'assets/keyplate.png');
    this.game.load.image('keyplate_outline', 'assets/keyplate_outline.png');
    this.game.load.image('hours_w', 'assets/mask_hours_w.png');
    this.game.load.image('hours_c', 'assets/mask_hours_c.png');
    this.game.load.image('smoke', 'assets/smoke.png');

    this.game.load.image('death_w', 'assets/mask_herne_w.png');
    this.game.load.image('death_c', 'assets/mask_herne_c.png');
    this.game.load.image('wisdom_w', 'assets/mask_norwife_w.png');
    this.game.load.image('wisdom_c', 'assets/mask_norwife_c.png');
    this.game.load.image('sky_w', 'assets/mask_dunlevy_w.png');
    this.game.load.image('sky_c', 'assets/mask_dunlevy_c.png');
    this.game.load.image('mischief_w', 'assets/mask_ragna_w.png');
    this.game.load.image('mischief_c', 'assets/mask_ragna_c.png');

    this.game.load.image('ring_inner', 'assets/ring_inner.png');
    this.game.load.image('ring_outer', 'assets/ring_outer.png');
    this.game.load.spritesheet('switch_light', 'assets/switch_light.png',
        10, 10);

    this.game.load.image('meter_shard', 'assets/meter_shard.png');
    this.game.load.image('item_key', 'assets/item_key.png');
    this.game.load.image('item_lightning', 'assets/item_lightning.png');
    this.game.load.image('altar_face', 'assets/altar_face.png');
    this.game.load.image('altar_minute', 'assets/altar_minute.png');
    this.game.load.image('altar_hour', 'assets/altar_hour.png');

    this.game.load.image('power_diamond', 'assets/powerdiamond.png');
    this.game.load.image('power_icon_crown', 'assets/power_crown.png');
    this.game.load.image('power_icon_hourglass', 'assets/power_hourglass.png');
    this.game.load.image('power_icon_trace', 'assets/power_trace.png');
    this.game.load.image('power_icon_might', 'assets/power_might.png');
    this.game.load.image('power_icon_wit', 'assets/power_wit.png');
    this.game.load.image('power_icon_presence', 'assets/power_presence.png');
    this.game.load.image('power_icon_sword', 'assets/power_sword.png');
    this.game.load.image('power_icon_axe', 'assets/power_axe.png');
    this.game.load.image('power_icon_bow', 'assets/power_bow.png');
    this.game.load.image('power_icon_shield', 'assets/power_shield.png');
};

// Set up the progress bar that tracks our asset loading.
PreloadState.prototype.initializeLoadingBar = function() {
    var loadingBar = this.add.sprite(
        this.game.width / 2, this.game.height / 3, 'loadingBar');
    loadingBar.x -= loadingBar.width / 2;
    loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(loadingBar);
};

// Created? Moving on!
PreloadState.prototype.create = function() {
    this.game.state.start('TitleMenuState', true, false, this.palette);
};
