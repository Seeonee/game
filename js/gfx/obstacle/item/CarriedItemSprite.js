// An item that can be picked up and carried.
var CarriedItemSprite = function(game, x, y, name, palette, drift) {
    Phaser.Sprite.call(this, game, x, y);
    this.x0 = x;
    this.y0 = y;
    this.anchor.setTo(0.5);
    this.pickupTime = CarriedItemSprite.PICKUP_TIME;
    this.carryHeight = CarriedItemSprite.CARRY_HEIGHT;

    // Stealing this hack from Shard.js.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);
    this.image = this.createImage(name)
    this.gobetween.addChild(this.image);

    this.setPalette(palette);

    this.drift = drift;
    this.startDrift();
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
        CarriedItemSprite.painter);
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
CarriedItemSprite.painter = function(bitmap) {
    var r = 15;
    var pad = 3;
    Utils.resizeBitmap(bitmap, 2 * (r + pad), 2 * (r + pad));
    var c = bitmap.context;
    c.translate(pad, pad);
    c.strokeStyle = bitmap.game.settings.colors.WHITE.s;
    c.lineWidth = 1.5;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.stroke();
};

// Update colors.
CarriedItemSprite.prototype.setPalette = function(palette) {
    this.corona.tint = palette.c2.i;
    // this.icon.tint = palette.c2.i;
};

// Begin bobbing up and down.
CarriedItemSprite.prototype.startDrift = function() {
    if (this.drift || this.drift == undefined) {
        if (this.drifttween) {
            return;
        }
        var t = this.game.add.tween(this.gobetween);
        t.to({ y: CarriedItemSprite.HOVER_DRIFT },
            CarriedItemSprite.HOVER_TIME,
            Phaser.Easing.Sinusoidal.InOut, true, 0,
            Number.POSITIVE_INFINITY, true);
        this.drifttween = t;
    }
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
    this.pickupTween = t;
};

// Called when the item is fully in place overhead.
CarriedItemSprite.prototype.pickedUp = function() {
    // Noop; override if you want.
};

// If we're being carried, drop back to original coords.
CarriedItemSprite.prototype.drop = function() {
    if (this.pickupTween) {
        this.pickupTween.stop();
        this.pickupTween = undefined;
    }
    this.x = this.x0;
    this.y = this.y0;
};

// Call to consume the item.
CarriedItemSprite.prototype.useUp = function() {
    if (this.pickupTween) {
        this.pickupTween.stop();
        this.pickupTween = undefined;
    }
    this.useupTweens = [];

    var t = this.game.add.tween(this.image.scale);
    t.to({ x: 0, y: 0 }, CarriedItemSprite.USE_TIME,
        Phaser.Easing.Back.In, true);
    t.onComplete.add(function() {
        this.drifttween.stop();
        this.drifttween = undefined;
        this.kill();
    }, this);
    this.useupTweens.push(t);

    var t2 = this.game.add.tween(this);
    t2.to({ y: 0 }, CarriedItemSprite.USE_TIME,
        Phaser.Easing.Cubic.Out, true);
    this.useupTweens.push(t2);
};

// If we're being carried, drop back to original coords.
CarriedItemSprite.prototype.rehold = function() {
    if (this.useupTweens) {
        for (var i = 0; i < this.useupTweens.length; i++) {
            this.useupTweens[i].stop();
        }
        this.useupTweens = undefined;
    }

    this.revive();
    this.image.scale.setTo(1);
    this.x = 0;
    this.y = -this.carryHeight;
    this.startDrift();
};
