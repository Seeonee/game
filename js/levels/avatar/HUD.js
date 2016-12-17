// Tracker for which tier we're currently on.
var TierMeter = function(game, level) {
    this.game = game;
    this.level = level;
    this.lowest = parseInt(this.level.tiers[0].name.substring(1));
    this.numTiers = level.tiers.length;

    var w = TierMeter.PATH_LX + TierMeter.XBAR;
    var dh = TierMeter.PATH_W + TierMeter.YPAD;
    var h = TierMeter.PATH_LY + TierMeter.PATH_W +
        (this.numTiers - 1) * dh;
    this.bitmap = this.game.add.bitmapData(w, h);
    var c = this.bitmap.context;
    for (var i = 0; i < this.numTiers; i++) {
        var t = this.level.tiers[this.numTiers - 1 - i];
        var y = i * dh;
        var xs = [0, TierMeter.PATH_LX, TierMeter.PATH_LX, 0];
        var ys = [y + TierMeter.PATH_LY, y, y + TierMeter.PATH_W,
            y + TierMeter.PATH_LY + TierMeter.PATH_W
        ];
        c.fillStyle = t.palette.c1.s;
        c.beginPath();
        c.moveTo(xs[0], ys[0]);
        c.lineTo(xs[1], ys[1]);
        c.lineTo(xs[2], ys[2]);
        c.lineTo(xs[3], ys[3]);
        c.lineTo(xs[0], ys[0]);
        c.closePath();
        c.fill();
    }
    Phaser.Sprite.call(this, game, 0, 0, this.bitmap);
    level.z.fg.add(this);

    this.fixedToCamera = true;
    this.cameraOffset.setTo(TierMeter.CAMERA_X, TierMeter.CAMERA_Y);

    this.level.events.onTierChange.add(this.setTier, this);
    this.setTier(this.level.tier);
};

TierMeter.prototype = Object.create(Phaser.Sprite.prototype);
TierMeter.prototype.constructor = TierMeter;

// Constants.
TierMeter.PATH_W = 5;
TierMeter.PATH_LX = 10;
TierMeter.PATH_LY = 10;
TierMeter.XBAR = 13;
TierMeter.YPAD = 3;
TierMeter.CAMERA_X = 15;
TierMeter.CAMERA_Y = 15;


// Change the current tier.
TierMeter.prototype.setTier = function(tier) {
    var index = (this.numTiers - 1) -
        (parseInt(tier.name.substring(1)) - this.lowest);

    var x = TierMeter.PATH_LX;
    var dh = TierMeter.PATH_W + TierMeter.YPAD;
    var y = index * dh;
    var w = TierMeter.XBAR;
    var h = TierMeter.PATH_W;
    var r = h / 2;
    var c = this.bitmap.context;
    c.clearRect(x, 0, w, this.bitmap.height);
    c.beginPath();
    c.fillStyle = tier.palette.c1.s;
    c.fillRect(x, y, w - r, h);
    c.arc(x + w - r, y + r, r, 0, 2 * Math.PI, false);
    c.fill();

    this.bitmap.dirty = true;
};
