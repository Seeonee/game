// Special item: the avatar's mask!
var MaskItemSprite = function(game, x, y, palette) {
    CarriedItemSprite.call(this, game, x, y, 'mask', palette);
    this.pickupTime = 1000;
    // this.carryHeight = 50;
};

MaskItemSprite.prototype = Object.create(CarriedItemSprite.prototype);
MaskItemSprite.prototype.constructor = MaskItemSprite;


// Handle our custom image.
MaskItemSprite.prototype.createImage = function(name) {
    this.masq = new AvatarMasq(game, 'keyhole', -55);
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
