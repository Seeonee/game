// A horizontal flash.
var HFlash = function(game, zgroup, x, y, rotation) {
    this.game = game;
    this.zgroup = zgroup;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
};

// Constants.
HFlash.FLASH_DIMENSION = 32;
HFlash.FLASH_DELAY = 0; // ms
HFlash.FLASH_COLOR = '#ffffff';
HFlash.Y_SCALE = 30;
HFlash.X_SCALE1 = 8;
HFlash.X_SCALE2 = 0.1;
HFlash.FLASH_IN = 50; // ms
HFlash.FLASH_HOLD = 100; // ms
HFlash.FLASH_OUT = 150; // ms
HFlash.FLASH_TOTAL = HFlash.FLASH_IN +
    HFlash.FLASH_HOLD +
    HFlash.FLASH_OUT;


// Horizontal flash at our position.
HFlash.prototype.flash = function() {
    var delay = HFlash.FLASH_DELAY;
    var d = HFlash.FLASH_DIMENSION;
    var b = this.game.add.bitmapData(d, d);
    var c = b.context;
    c.fillStyle = HFlash.FLASH_COLOR;
    c.beginPath();
    c.fillRect(0, 0, d, d);
    var img = this.game.add.image(this.x, this.y, b);
    img.anchor.setTo(0.5, 0.5);
    if (this.rotation) {
        img.rotation = this.rotation;
    }
    this.zgroup.add(img);
    img.scale.setTo(HFlash.X_SCALE1, HFlash.Y_SCALE);
    img.alpha = 0;

    var t = this.game.add.tween(img);
    t.to({ alpha: 1 }, HFlash.FLASH_IN,
        Phaser.Easing.Cubic.Out, true, delay);
    var t2 = this.game.add.tween(img);
    t2.to({ alpha: 0 }, HFlash.FLASH_OUT,
        Phaser.Easing.Quadratic.Out, false,
        HFlash.FLASH_HOLD);
    t.chain(t2);
    var t3 = this.game.add.tween(img.scale);
    t3.img = img;
    t3.to({ x: HFlash.X_SCALE2 },
        HFlash.FLASH_TOTAL,
        Phaser.Easing.Cubic.Out, true, delay);
    t3.onComplete.add(function(a, tween) {
        tween.img.destroy();
    });
};
