// Spotlight towards our warp destination.
var WContrail = function(game, angle) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        WContrail.prototype.painter, this);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0, 0.5);
    this.alpha = 0;
    this.rotation = Math.PI / 2 - angle;

    this.shining = false;
};

WContrail.prototype = Object.create(Phaser.Sprite.prototype);
WContrail.prototype.constructor = WContrail;

// Constants.
WContrail.W1 = 4;
WContrail.LENGTH = 250;
WContrail.WITHER = 4;
WContrail.FLICKER_TIME = 700; // ms


// Paint our bitmap.
WContrail.prototype.painter = function(bitmap) {
    // Set up a bunch of values we'll need.
    var r = WContrail.W1;
    var w = WContrail.LENGTH;
    var h = 2 * r;
    var h2 = h * WContrail.WITHER;
    var maxh = Math.max(h, h2);
    var dy = (maxh - h) / 2;
    var dh = (maxh - h2) / 2;
    var color1 = this.game.settings.colors.WHITE.s;
    var color2 = this.game.settings.colors.WHITE.rgba(0);

    Utils.resizeBitmap(bitmap, w, maxh);
    c = bitmap.context;
    var gradient = c.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.95, color2);
    c.fillStyle = gradient;
    c.beginPath();
    c.moveTo(0, dy);
    c.lineTo(w, dh);
    c.lineTo(w, maxh - dh);
    c.lineTo(0, maxh - dy);
    c.lineTo(0, 0);
    c.closePath();
    c.fill();
};

// Turn on or off the spotlight.
WContrail.prototype.setShining = function(shining) {
    if (shining == this.shining) {
        return;
    }
    this.shining = shining;
    this.alpha = this.shining ? 1 : 0;
    if (this.shining) {
        this.tween = this.game.add.tween(this);
        this.tween.to({ alpha: 0.3 }, WContrail.FLICKER_TIME,
            Phaser.Easing.Bounce.InOut, true,
            0, Number.POSITIVE_INFINITY, true);
    } else {
        if (this.tween) {
            this.tween.stop();
            this.tween = undefined;
        }
    }
};
