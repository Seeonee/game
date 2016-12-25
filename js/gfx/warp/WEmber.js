// First, define a warp point socket for an ember.
var WSocket = function(game, x, y, palette) {
    this.game = game;
    if (WSocket.CACHED_BITMAP == undefined) {
        // Container ring.
        var r = WSocket.RING_RADIUS;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.strokeStyle = this.game.settings.colors.WHITE.s;
        c.lineWidth = Tier.PATH_WIDTH * WarpPoint.PATH_RATIO;
        c.beginPath();
        c.arc(r, r, r / 2, 0, 2 * Math.PI, false);
        c.stroke();
        WSocket.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, x, y, WSocket.CACHED_BITMAP);
    this.tint = palette.c1.i;
    this.anchor.setTo(0.5, 0.5);
};

WSocket.prototype = Object.create(Phaser.Sprite.prototype);
WSocket.prototype.constructor = WSocket;

// Constants.
WSocket.RING_RADIUS = 20;


// Set our colors.
WSocket.prototype.updatePalette = function(palette) {
    this.tint = palette.c1.i;
};








// Ember smoldering in the center of a warp point.
var WEmber = function(game) {
    this.game = game;
    if (WEmber.CACHED_BITMAP == undefined) {
        var r = WEmber.EMBER_RADIUS;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        c = bitmap.context;
        c.fillStyle = this.game.settings.colors.WHITE.s;
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        WEmber.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, 0, 0, WEmber.CACHED_BITMAP);
    this.anchor.setTo(0.5, 0.5);

    this.enabled = true;
    this.flaring = false;
    this.flickerview = this.game.state.getCurrentState().flicker.view();
};

WEmber.prototype = Object.create(Phaser.Sprite.prototype);
WEmber.prototype.constructor = WEmber;

// Constants.
WEmber.EMBER_RADIUS = 4;
WEmber.EMBER_FADE_TIME = 1000; // ms
WEmber.EMBER_DELAY = 1400; // ms
WEmber.DISABLED_ALPHA = 0.25;


// Start our slow burn.
WEmber.prototype.update = function() {
    this.alpha = this.flickerview.alpha;
};

// Update our effects.
WEmber.prototype.updateEffects = function() {
    this.flickerview.alpha = this.enabled ? 1 : WEmber.DISABLED_ALPHA;
    if (this.enabled && !this.flaring) {
        this.flickerview.free();
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
