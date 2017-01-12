// Slash.
var SlashEffects = function(slash) {
    this.game = slash.game;
    var bitmap = this.game.bitmapCache.get(
        SlashEffects.painter);
    Phaser.Sprite.call(this, this.game, 0, 0, bitmap);
    this.anchor.setTo(0, 0.5);
    this.tweens = [];
    this.alpha = 0;
};

SlashEffects.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.prototype.constructor = SlashEffects;

// Constants.
SlashEffects.ARC_ALPHA1 = 0.3;
SlashEffects.ARC_ALPHA2 = 0;
SlashEffects.FLICKER_TIME = 650; // ms


// Paint our bitmap.
SlashEffects.painter = function(bitmap) {
    var r = SlashPower.RADIUS;
    var a = SlashPower.CATCH;
    var pad = 3;
    Utils.resizeBitmap(bitmap, r + 2 * pad, 2 * r + 2 * pad);
    var c = bitmap.context;
    // c.fillStyle = '#ffffff';
    c.strokeStyle = '#ffffff';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0 + pad, r + pad);
    c.arc(0, r, r, -a, a, false);
    c.closePath();
    c.stroke();
};

// Stop all tweens.
SlashEffects.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Begin targeting.
SlashEffects.prototype.arm = function() {
    var t = this.game.add.tween(this);
    this.alpha = SlashEffects.ARC_ALPHA1;
    t.to({ alpha: SlashEffects.ARC_ALPHA2 },
        SlashEffects.FLICKER_TIME,
        Phaser.Easing.Bounce.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
};

// Take the shot.
SlashEffects.prototype.slash = function() {
    this.clearTweens();
    this.alpha = 1;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, SlashPower.LOCKOUT,
        Phaser.Easing.Cubic.In, true);
    this.tweens.push(t);
};

// End the charge, with zero gfx or animation.
SlashEffects.prototype.nevermind = function() {
    this.clearTweens();
    this.alpha = 0;
};
