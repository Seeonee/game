// Ember smoldering in the center of a warp point.
var WEmber = function(game) {
    this.game = game;
    if (WEmber.CACHED_BITMAP == undefined) {
        var r = WEmber.RADIUS;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        c = bitmap.context;
        c.fillStyle = this.game.settings.colors.WHITE.s;
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        WEmber.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, 0, 0, WEmber.CACHED_BITMAP);
    this.anchor.setTo(0.5, 0.5);
    this.alpha = 1;

    this.flicker();

    this.tween.pause();
    this.enabled = true;
    this.flaring = false;
};

WEmber.prototype = Object.create(Phaser.Sprite.prototype);
WEmber.prototype.constructor = WEmber;

// Constants.
WEmber.RADIUS = 4;
WEmber.EMBER_FADE_TIME = 1000; // ms
WEmber.EMBER_DELAY = 1400; // ms
WEmber.DISABLED_ALPHA = 0.25;


// Start our slow burn.
WEmber.prototype.flicker = function() {
    if (this.tween) {
        return;
    }
    this.tween = this.game.add.tween(this);
    this.tween.to({ alpha: 0 }, WEmber.EMBER_FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
    this.tween.yoyoDelay(WEmber.EMBER_DELAY);
};

// Update our effects.
WEmber.prototype.updateEffects = function() {
    this.alpha = this.enabled ? 1 : WEmber.DISABLED_ALPHA;
    if (this.enabled && !this.flaring) {
        this.flicker();
    } else {
        this.tween.stop();
        this.tween = undefined;
    }
};

// Set our enabled state.
WEmber.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    this.enabled = enabled;
    this.updateEffects();
};

// Avatar is here! Stay lit.
WEmber.prototype.setFlaring = function(flaring) {
    if (flaring == this.flaring) {
        return;
    }
    this.flaring = flaring;
    this.updateEffects();
};

// Pause or unpause us.
WEmber.prototype.setPaused = function(paused) {
    if (this.tween) {
        paused ? this.tween.pause() : this.tween.resume();
    }
};
