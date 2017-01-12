// Slash.
var SlashEffects = function(slash) {
    this.game = slash.game;

    this.bitmap = this.createBitmap();
    Phaser.Sprite.call(this, this.game, 0, 0, this.bitmap);
    this.anchor.setTo(0, 0.5);
    this.alpha = 0;

    this.r = SlashEffects.R1;
    this.update();

    this.tweens = [];
};

SlashEffects.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.prototype.constructor = SlashEffects;

// Constants.
SlashEffects.R1 = 0.3;
SlashEffects.ARC_ALPHA1 = 0.5;
SlashEffects.ARC_W = 5;
SlashEffects.FADE_IN = 250; // ms


// Make our bitmap.
SlashEffects.prototype.createBitmap = function() {
    var r = SlashPower.RADIUS;
    return this.game.add.bitmapData(r + SlashEffects.ARC_W, 2 * r);
};

// Paint our bitmap.
SlashEffects.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    if (this._r == this.r) {
        return;
    }
    this._r = this.r;
    var r = SlashPower.RADIUS * this._r;
    var a = SlashPower.CATCH;
    var c = this.bitmap.context;
    c.clearRect(0, 0, this.bitmap.width, this.bitmap.height);
    c.strokeStyle = '#ffffff';
    c.lineWidth = SlashEffects.ARC_W;
    c.beginPath();
    c.arc(0, SlashPower.RADIUS, r, -a, a, false);
    c.stroke();
    this.bitmap.dirty = true;
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
    this.clearTweens();
    this.r = SlashEffects.R0;
    var t = this.game.add.tween(this);
    t.to({ r: SlashEffects.R1 },
        SlashEffects.FADE_IN, Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);

    this.alpha = 0;
    var t = this.game.add.tween(this);
    t.to({ alpha: SlashEffects.ARC_ALPHA1 },
        SlashEffects.FADE_IN, Phaser.Easing.Cubic.Out, true);
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

    var t = this.game.add.tween(this);
    t.to({ r: 1 }, SlashPower.LOCKOUT,
        Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);
};

// End the charge, with zero gfx or animation.
SlashEffects.prototype.nevermind = function() {
    this.clearTweens();
    this.alpha = 0;
};
