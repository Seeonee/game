// A door that requires a key to pass through.
var DoorSprite = function(game, x, y, name, palette) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        DoorSprite.painterOuter);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5);
    this.rotation = Math.PI / 4;

    // More decals.
    var bitmap = this.game.bitmapCache.get(
        DoorSprite.painterInner);
    this.inner = this.addChild(this.game.add.sprite(
        0, 0, bitmap));
    this.inner.anchor.setTo(0.5);

    // And our icon!
    this.icon = this.addChild(this.game.add.sprite(
        0, 0, 'item_' + name));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);
    this.icon.rotation = -Math.PI / 4;

    this.setPalette(palette);
};

DoorSprite.prototype = Object.create(Phaser.Sprite.prototype);
DoorSprite.prototype.constructor = DoorSprite;

// Constants.
DoorSprite.D = 30;
DoorSprite.D2 = 24;
DoorSprite.UNLOCK_TIME = 500; // ms
DoorSprite.UNLOCK_SCALE = 2;


// Paint our bitmap.
DoorSprite.painterOuter = function(bitmap) {
    var d = DoorSprite.D;
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.fillRect(0, 0, d, d);
};

// Paint our bitmap.
DoorSprite.painterInner = function(bitmap) {
    var d = DoorSprite.D2;
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.fillRect(0, 0, d, d);
};

// Update colors.
DoorSprite.prototype.setPalette = function(palette) {
    this.tint = palette.c1.i;
    this.inner.tint = palette.c3.i;
    this.icon.tint = palette.c2.i;
};

// Call to destruct!
DoorSprite.prototype.unlock = function() {
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, DoorSprite.UNLOCK_TIME, Phaser.Easing.Cubic.Out,
        true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: DoorSprite.UNLOCK_SCALE, y: DoorSprite.UNLOCK_SCALE },
        DoorSprite.UNLOCK_TIME, Phaser.Easing.Cubic.Out, true);
    t2.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
};
