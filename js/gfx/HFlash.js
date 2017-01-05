// A horizontal flash.
var HFlash = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        HFlash.prototype.painter, this);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

HFlash.prototype = Object.create(Phaser.Sprite.prototype);
HFlash.prototype.constructor = HFlash;

// Constants.
HFlash.FLASH_DIMENSION = 32;
HFlash.FLASH_DELAY = 0; // ms
HFlash.FLASH_COLOR = '#ffffff';
HFlash.Y_SCALE = 50;
HFlash.X_SCALE1 = 8;
HFlash.X_SCALE2 = 0.1;
HFlash.FLASH_IN = 50; // ms
HFlash.FLASH_HOLD = 100; // ms
HFlash.FLASH_OUT = 150; // ms
HFlash.FLASH_TOTAL = HFlash.FLASH_IN +
    HFlash.FLASH_HOLD +
    HFlash.FLASH_OUT;


// Paint our bitmap.
HFlash.prototype.painter = function(bitmap) {
    var d = HFlash.FLASH_DIMENSION;
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = HFlash.FLASH_COLOR;
    c.beginPath();
    c.fillRect(0, 0, d, d);
};

// Horizontal flash at our position.
HFlash.prototype.flash = function(zgroup, x, y, rotation) {
    this.x = x;
    this.y = y;
    var delay = HFlash.FLASH_DELAY;
    if (rotation) {
        this.rotation = rotation;
    }
    zgroup.add(this);
    var d = 2 * Math.max(this.game.scale.width, this.game.scale.height);
    var h = this.height / this.scale.y;
    var yscale = d / h;
    this.scale.setTo(HFlash.X_SCALE1, yscale);
    this.alpha = 0;
    this.visible = true;

    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, HFlash.FLASH_IN,
        Phaser.Easing.Cubic.Out, true, delay);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 0 }, HFlash.FLASH_OUT,
        Phaser.Easing.Quadratic.Out, false,
        HFlash.FLASH_HOLD);
    t.chain(t2);
    var t3 = this.game.add.tween(this.scale);
    t3.to({ x: HFlash.X_SCALE2 },
        HFlash.FLASH_TOTAL,
        Phaser.Easing.Cubic.Out, true, delay);
    t3.onComplete.add(function(a, tween) {
        this.kill();
    }, this);
};
