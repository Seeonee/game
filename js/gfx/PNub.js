// A slightly enlarged point.
var PNub = function(game, x, y, tint) {
    var r = PNub.RADIUS;
    if (PNub.CACHED_BITMAP == undefined) {
        var bitmap = game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.fillStyle = game.settings.colors.WHITE.s;
        c.beginPath();
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        PNub.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, x, y, PNub.CACHED_BITMAP);
    this.anchor.setTo(0.5, 0.5);
    this.tint = tint;
};

PNub.prototype = Object.create(Phaser.Sprite.prototype);
PNub.prototype.constructor = PNub;

// Constants.
PNub.RADIUS = Tier.PATH_WIDTH;
