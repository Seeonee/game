// Special item: the avatar's mask!
var MaskItemSprite = function(game, x, y, name, palette) {
    CarriedItemSprite.call(this, game, x, y, name, palette);
    this.pickupTime = 1000;
    // this.carryHeight = 50;
};

MaskItemSprite.prototype = Object.create(CarriedItemSprite.prototype);
MaskItemSprite.prototype.constructor = MaskItemSprite;


// Handle our custom image.
MaskItemSprite.prototype.createImage = function(name) {
    this.masq = new AvatarMasq(game, name, -55);
    this.masq.spriteC.y = -CarriedItemSprite.HOVER_HEIGHT;
    return this.masq.spriteC;
};

// Adjust tint.
MaskItemSprite.prototype.setPalette = function(palette) {
    this.masq.spriteC.tint = palette.c2.i;
};

// Call to transfer ownership.
MaskItemSprite.prototype.pickUp = function(avatar) {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
    this.avatar = avatar;
    if (this.avatar.masq) {
        var t = this.game.add.tween(
            this.avatar.masq).to({
                alpha: 0,
                y: this.avatar.masq.y + 5
            },
            300, Phaser.Easing.Cubic.In, true);
        t.onComplete.add(function() {
            Utils.destroy(this.avatar.masq);
        }, this);
    }
    CarriedItemSprite.prototype.pickUp.call(this, avatar);
};

// Called when the item is fully in place overhead.
MaskItemSprite.prototype.pickedUp = function() {
    var time = 3000;
    var delay = 1500;
    var t = this.game.add.tween(this);
    t.to({ y: -55 }, time, Phaser.Easing.Cubic.Out, true, delay);
    var t = this.game.add.tween(this.masq.spriteC);
    t.to({ y: 0 }, time, Phaser.Easing.Cubic.Out, true, delay);
    var t = this.game.add.tween(this.gobetween);
    t.to({ y: 0 }, time, Phaser.Easing.Cubic.Out, true, delay);
    t.onComplete.add(function() {
        this.avatar.masq = this.avatar.addChild(this.masq.spriteC);
        this.avatar.masq.y = this.masq.yOffset;
        this.avatar.masq.scale.setTo(this.masq.scale);
    }, this);
};








// Altar for the mask.
var MaskAltar = function(game, x, y, palette) {
    Phaser.Sprite.call(this, game, x, y - 55, 'altar');
    this.anchor.setTo(0.5);
    this.rgb = Color.rgb(palette.c2.i);
    // this.tint = palette.c2.i;
    this.tween = this.game.add.tween(this).to({ rotation: 2 * Math.PI },
        MaskAltar.SPIN_TIME, Phaser.Easing.Linear.None, true, 0,
        Number.POSITIVE_INFINITY);
};

MaskAltar.prototype = Object.create(Phaser.Sprite.prototype);
MaskAltar.prototype.constructor = MaskAltar;

// Constants.
MaskAltar.SPIN_TIME = 10000; // ms
MaskAltar.SHINE_TIME = 2200; // ms
MaskAltar.SHINE_SPINS = 5;
MaskAltar.FADE_TIME = 5000; // ms


// Update tint.
MaskAltar.prototype.update = function() {
    this.tint = (this.rgb.r << 16) +
        (this.rgb.g << 8) +
        (this.rgb.b);
};

// Our mask's been picked up.
MaskAltar.prototype.shine = function(avatar) {
    this.gamestate = game.state.getCurrentState();
    this.avatar = avatar;

    this.tween.stop();
    var rotation = MaskAltar.SHINE_SPINS * 2 * Math.PI;
    var t = this.game.add.tween(this).to({ rotation: rotation },
        MaskAltar.SHINE_TIME, Phaser.Easing.Cubic.In, true);
    var white = this.game.settings.colors.WHITE.i;
    var t = this.game.add.tween(this.rgb).to(
        Color.rgb(white), MaskAltar.SHINE_TIME,
        Phaser.Easing.Quintic.In, true);
    t.onComplete.add(function() {
        new HFlash(this.game).flash(this.gamestate.z.fg,
            this.avatar.x, this.avatar.y);
    }, this);
    var t2 = this.game.add.tween(this).to({ alpha: 0.1 },
        MaskAltar.FADE_TIME, Phaser.Easing.Sinusoidal.InOut);
    t.chain(t2);
};
