// Slash.
var SlashEffects = function(slash) {
    this.game = slash.game;
    var bitmap = this.game.bitmapCache.get(
        SlashEffects.painter);
    Phaser.Sprite.call(this, this.game, 0, 0, bitmap);
    this.anchor.setTo(0, 0.5);
    this.tweens = [];
    this.visible = false;
};

SlashEffects.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.prototype.constructor = SlashEffects;

// Constants, eventually.


// Paint our bitmap.
SlashEffects.painter = function(bitmap) {
    var r = SlashPower.RADIUS;
    Utils.resizeBitmap(bitmap, r, r);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, r, r);
};

// Begin targeting.
SlashEffects.prototype.arm = function() {
    this.visible = true;
};

// Take the shot.
SlashEffects.prototype.slash = function() {
    this.game.time.events.add(SlashPower.LOCKOUT, function() {
        this.visible = false;
    }, this);
};

// End the charge, with zero gfx or animation.
SlashEffects.prototype.nevermind = function() {
    this.visible = false;
};
