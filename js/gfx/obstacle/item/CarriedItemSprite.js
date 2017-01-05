// An item that can be picked up and carried.
var CarriedItemSprite = function(game, x, y, name, palette, drift) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.pickupTime = CarriedItemSprite.PICKUP_TIME;
    this.carryHeight = CarriedItemSprite.CARRY_HEIGHT;

    // Stealing this hack from Shard.js.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);
    this.image = this.createImage(name)
    this.gobetween.addChild(this.image);

    this.setPalette(palette);

    this.tweens = [];
    if (drift || drift == undefined) {
        var t = this.game.add.tween(this.gobetween);
        t.to({ y: CarriedItemSprite.HOVER_DRIFT },
            CarriedItemSprite.HOVER_TIME,
            Phaser.Easing.Sinusoidal.InOut, true, 0,
            Number.POSITIVE_INFINITY, true);
        this.tweens.push(t);
    }
};

CarriedItemSprite.prototype = Object.create(Phaser.Sprite.prototype);
CarriedItemSprite.prototype.constructor = CarriedItemSprite;

// Constants.
CarriedItemSprite.HOVER_TIME = 2000; // ms
CarriedItemSprite.HOVER_HEIGHT = 50;
CarriedItemSprite.CARRY_HEIGHT = 80;
CarriedItemSprite.HOVER_DRIFT = 15;
CarriedItemSprite.USE_TIME = 500; // ms
CarriedItemSprite.PICKUP_TIME = 700; // ms


// Create the image(s) to use.
CarriedItemSprite.prototype.createImage = function(name) {
    var bitmap = this.game.bitmapCache.get(
        CarriedItemSprite.prototype.painter, this);
    this.corona = this.game.add.sprite(0, 0, bitmap);
    this.corona.anchor.setTo(0.5);
    this.corona.y -= CarriedItemSprite.HOVER_HEIGHT;

    this.icon = this.corona.addChild(this.game.add.sprite(
        0, 0, 'item_' + name));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);

    return this.corona;
};

// Paint our bitmap.
CarriedItemSprite.prototype.painter = function(bitmap) {
    var r = 15;
    var pad = 3;
    Utils.resizeBitmap(bitmap, 2 * (r + pad), 2 * (r + pad));
    var c = bitmap.context;
    c.translate(pad, pad);
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    c.lineWidth = 1.5;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.stroke();
};

// Update colors.
CarriedItemSprite.prototype.setPalette = function(palette) {
    this.corona.tint = palette.c2.i;
    // this.icon.tint = palette.c2.i;
};

// Call to transfer ownership.
CarriedItemSprite.prototype.pickUp = function(avatar) {
    var x = this.parent.parent.x + this.x;
    var y = this.parent.parent.y + this.y;
    var dx = x - avatar.x;
    var dy = y - avatar.y;
    avatar.addChild(this);
    this.x = dx;
    this.y = dy;

    var t = this.game.add.tween(this);
    t.to({ x: 0, y: -this.carryHeight },
        this.pickupTime, Phaser.Easing.Back.InOut, true);
    t.onComplete.add(this.pickedUp, this);
};

// Called when the item is fully in place overhead.
CarriedItemSprite.prototype.pickedUp = function() {
    // Noop; override if you want.
};

// Call to consume the item.
CarriedItemSprite.prototype.useUp = function() {
    var t = this.game.add.tween(this.image.scale);
    t.to({ x: 0, y: 0 }, CarriedItemSprite.USE_TIME,
        Phaser.Easing.Back.In, true);
    t.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
    var t2 = this.game.add.tween(this);
    t2.to({ y: 0 }, CarriedItemSprite.USE_TIME,
        Phaser.Easing.Cubic.Out, true);
};
