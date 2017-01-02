// Special item: the avatar's mask!
var MaskItemSprite = function(game, x, y, name, palette) {
    CarriedItemSprite.call(this, game, x, y, name, palette, false);
    this.pickupTime = 1000;
};

MaskItemSprite.prototype = Object.create(CarriedItemSprite.prototype);
MaskItemSprite.prototype.constructor = MaskItemSprite;


// Handle our custom image.
MaskItemSprite.prototype.createImage = function(name) {
    this.masq = new AvatarMasq(game, name);
    this.maskY = this.masq.yOffset;
    this.masq.spriteC.y = this.maskY;
    return this.masq.spriteC;
};

// Adjust tint.
MaskItemSprite.prototype.setPalette = function(palette) {
    this.masq.spriteC.tint = palette.c2.i;
};

// Call to transfer ownership.
MaskItemSprite.prototype.pickUp = function(avatar) {
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
    t.to({ y: this.maskY }, time, Phaser.Easing.Cubic.Out, true, delay);
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
    this.rgb = Color.rgb(palette.c2.i);
    var maskY = AvatarMasq.OFFSET.hours;
    Phaser.Sprite.call(this, game, x, y + maskY, 'altar_face');
    this.anchor.setTo(0.5);

    this.minuteHand = this.game.add.sprite(0, 0, 'altar_minute');
    this.minuteHand.anchor.setTo(0.5);
    this.addChild(this.minuteHand);

    this.hourHand = this.game.add.sprite(0, 0, 'altar_hour');
    this.hourHand.anchor.setTo(0.5);
    this.addChild(this.hourHand);

    this.tweens = [];
    var t = this.game.add.tween(this.minuteHand).to({
            rotation: 2 * Math.PI
        }, MaskAltar.MINUTE_TIME, Phaser.Easing.Linear.None,
        true, 0, Number.POSITIVE_INFINITY);
    this.tweens.push(t);
    var t = this.game.add.tween(this.hourHand).to({
            rotation: 2 * Math.PI
        }, MaskAltar.HOUR_TIME, Phaser.Easing.Linear.None,
        true, 0, Number.POSITIVE_INFINITY);
    this.tweens.push(t);
};

MaskAltar.prototype = Object.create(Phaser.Sprite.prototype);
MaskAltar.prototype.constructor = MaskAltar;

// Constants.
MaskAltar.MINUTE_TIME = 3000; // ms
MaskAltar.HOUR_TIME = 10000; // ms
MaskAltar.SHINE_TIME = 2200; // ms
MaskAltar.MINUTE_SPINS = 5;
MaskAltar.HOUR_SPINS = 3;
MaskAltar.FADE_TIME = 5000; // ms


// Update tint.
MaskAltar.prototype.update = function() {
    var tint = (this.rgb.r << 16) +
        (this.rgb.g << 8) +
        (this.rgb.b);
    this.tint = tint;
    this.minuteHand.tint = tint;
    this.hourHand.tint = tint;
};

// Our mask's been picked up.
MaskAltar.prototype.shine = function(avatar) {
    this.gamestate = game.state.getCurrentState();
    this.avatar = avatar;

    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }

    var rotation = MaskAltar.HOUR_SPINS * 2 * Math.PI;
    var t = this.game.add.tween(this.hourHand).to({
        rotation: rotation
    }, MaskAltar.SHINE_TIME, Phaser.Easing.Cubic.In, true);

    var rotation = MaskAltar.MINUTE_SPINS * 2 * Math.PI;
    var t = this.game.add.tween(this.minuteHand).to({
        rotation: rotation
    }, MaskAltar.SHINE_TIME, Phaser.Easing.Cubic.In, true);
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
