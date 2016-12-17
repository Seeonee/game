// Tracker for which tier we're currently on.
var TierMeter = function(game, level) {
    this.game = game;
    this.level = level;
    this.lowest = parseInt(this.level.tiers[0].name.substring(1));
    this.numTiers = level.tiers.length;

    this.bitmap = this.game.add.bitmapData(TierMeter.W2,
        TierMeter.H2 + (this.numTiers - 1) * TierMeter.H);
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
TierMeter.W = 8;
TierMeter.H = 8;
TierMeter.W2 = 12;
TierMeter.H2 = 8;
TierMeter.CAMERA_X = 25;
TierMeter.CAMERA_Y = 25;


// Change the current tier.
TierMeter.prototype.setTier = function(tier) {
    var index = this.numTiers - this.lowest - 1 -
        parseInt(tier.name.substring(1));

    var w = TierMeter.W;
    var h = TierMeter.H;
    var w2 = TierMeter.W2;
    var h2 = TierMeter.H2;
    var bw = this.bitmap.width;
    var bh = this.bitmap.height;
    var c = this.bitmap.context;
    c.clearRect(0, 0, bw, bh);
    c.fillStyle = tier.palette.c1.s;
    c.fillRect(0, 0, w, bh);
    var y = index * h;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.fillRect(0, y, w2, h2);

    this.bitmap.dirty = true;
};
