// First, define a warp point socket for an ember.
var WSocket = function(game, x, y, palette) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        WSocket.painter);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.tint = palette.c1.i;
    this.anchor.setTo(0.5, 0.5);
};

WSocket.prototype = Object.create(Phaser.Sprite.prototype);
WSocket.prototype.constructor = WSocket;

// Constants.
WSocket.RING_RADIUS = 20;


// Paint our bitmap.
WSocket.painter = function(bitmap) {
    // Container ring.
    var r = WSocket.RING_RADIUS;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.strokeStyle = bitmap.game.settings.colors.WHITE.s;
    c.lineWidth = Tier.PATH_WIDTH * WarpPoint.PATH_RATIO;
    c.beginPath();
    c.arc(r, r, r / 2, 0, 2 * Math.PI, false);
    c.stroke();
};

// Set our colors.
WSocket.prototype.updatePalette = function(palette) {
    this.tint = palette.c1.i;
};








// Ember smoldering in the center of a warp point.
var WEmber = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        WEmber.painter);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);

    this.enabled = true;
    this.flaring = false;
    this.flickerview = this.game.state.getCurrentState().flicker.view();
};

WEmber.prototype = Object.create(Phaser.Sprite.prototype);
WEmber.prototype.constructor = WEmber;

// Constants.
WEmber.EMBER_RADIUS = 4;
WEmber.DISABLED_ALPHA = 0; // 0.25;


// Paint our bitmap.
WEmber.painter = function(bitmap) {
    var r = WEmber.EMBER_RADIUS;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Start our slow burn.
WEmber.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    this.alpha = this.enabled ?
        this.flickerview.alpha :
        WEmber.DISABLED_ALPHA;
};

// Set our enabled state.
WEmber.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    this.enabled = enabled;
    if (this.enabled) {
        this.flickerview.alpha = 1;
        this.flickerview.free();
    }
};

// Avatar is here! Stay lit.
WEmber.prototype.setFlaring = function(flaring) {
    if (flaring == this.flaring) {
        return;
    }
    this.flaring = flaring;
    if (flaring) {
        this.flickerview.alpha = 1;
    } else {
        this.flickerview.tween(0, FlickerManager.TIME,
            Phaser.Easing.Sinusoidal.InOut, 0, true);
    }
};
