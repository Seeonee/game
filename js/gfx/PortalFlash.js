// A horizontal flash.
var PortalFlash = function(game, zgroup, x, y, pointedUp) {
    this.game = game;
    this.zgroup = zgroup;
    this.x = x;
    this.y = y;
    this.pointedUp = pointedUp;
};

// Constants.
PortalFlash.RADIUS = PortalPoint.RADIUS;
PortalFlash.SCALE = 5;
PortalFlash.COLOR = '#ffffff';
PortalFlash.DURATION = 500; // ms
PortalFlash.ROTATION = 2.1 * Math.PI;


// Horizontal flash at our position.
PortalFlash.prototype.flash = function() {
    var scale = PortalFlash.SCALE;
    var r = PortalFlash.RADIUS;
    r *= scale;
    var b = this.game.add.bitmapData(2 * r, 2 * r);
    var c2 = b.context;
    c2.strokeStyle = PortalFlash.COLOR;
    c2.lineWidth = Tier.PATH_WIDTH;
    c2.lineWidth *= scale;
    c2.beginPath();
    c2.arc(r, r, r / 2, 0, 2 * Math.PI, false);
    c2.stroke();
    var image = this.game.add.sprite(
        this.x, this.y, b);
    this.zgroup.add(image);
    image.anchor.setTo(0.5, 0.5);
    var image2 = this.game.make.sprite(0, 0, 'smoke');
    image.addChild(image2);
    image2.anchor.setTo(0.5, 0.6);
    image2.scale.setTo(scale);
    if (this.pointedUp == false) {
        image2.rotation = Math.PI;
    }

    image.alpha = 0;
    image.scale.setTo(1 / scale);
    var time = 500;
    var t = this.game.add.tween(image);
    t.to({ rotation: 2.1 * Math.PI },
        time, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(image);
    t2.to({ alpha: 1 },
        time / 2, Phaser.Easing.Quadratic.Out,
        true, 0, 0, true);
    var t3 = this.game.add.tween(image.scale);
    t3.to({ x: 1, y: 1 },
        time, Phaser.Easing.Quadratic.Out, true);
    t3.image = image;
    t3.onComplete.add(function(a, tween) {
        tween.image.destroy();
    });
};
