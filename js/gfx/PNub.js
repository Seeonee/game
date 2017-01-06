// A slightly enlarged point.
var PNub = function(game, x, y, tint) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        PNub.painter);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.tint = tint;
};

PNub.prototype = Object.create(Phaser.Sprite.prototype);
PNub.prototype.constructor = PNub;

// Constants.
PNub.RADIUS = Tier.PATH_WIDTH;


// Paint our bitmap.
PNub.painter = function(bitmap) {
    var r = PNub.RADIUS;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.beginPath();
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Set our colors.
PNub.prototype.updatePalette = function(palette) {
    this.tint = palette.c1.i;
};
