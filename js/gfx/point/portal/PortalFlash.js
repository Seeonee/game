// An expanding + spinning ring + triangle.
var PortalFlash = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        PortalFlash.painter);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

PortalFlash.prototype = Object.create(Phaser.Sprite.prototype);
PortalFlash.prototype.constructor = PortalFlash;

// Constants.
PortalFlash.RADIUS = PortalPoint.RADIUS;
PortalFlash.SCALE = 5;
PortalFlash.COLOR = '#ffffff';
PortalFlash.DURATION = 500; // ms
PortalFlash.ROTATION = 1.5 * Math.PI;


// Paint our bitmap.
PortalFlash.painter = function(bitmap) {
    var r = PortalFlash.RADIUS;
    r *= PortalFlash.SCALE;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.strokeStyle = PortalFlash.COLOR;
    c.fillStyle = PortalFlash.COLOR;
    c.lineWidth = Tier.PATH_WIDTH;
    c.lineWidth *= PortalFlash.SCALE;

    // Draw the ring.
    c.beginPath();
    c.arc(r, r, r / 2, 0, 2 * Math.PI, false);
    c.stroke();

    // Draw the triangle.
    var w = r * 0.6; // Size it down a bit within the ring.
    var h = w * 0.87; // Ratio for equilateral triangle.
    var x = r - (w / 2);
    var y = 0.91 * (r - (h / 2)); // Slide it up slightly.
    c.beginPath();
    var xs = [0, w / 2, w];
    var ys = [h, 0, h];
    c.moveTo(x + xs[0], y + ys[0]);
    c.lineTo(x + xs[1], y + ys[1]);
    c.lineTo(x + xs[2], y + ys[2]);
    c.lineTo(x + xs[0], y + ys[0]);
    c.closePath();
    c.fill();
};

// Portal flash at our position.
PortalFlash.prototype.flash = function(zgroup, x, y, pointedUp) {
    this.x = x;
    this.y = y;
    zgroup.add(this);
    if (this.pointedUp == false) {
        this.triangle.rotation = Math.PI;
    }
    this.alpha = 0;
    this.visible = true;
    this.scale.setTo(1 / PortalFlash.SCALE);
    this.rotation = 0;
    var t = this.game.add.tween(this);
    t.to({ rotation: 2.1 * Math.PI },
        PortalFlash.DURATION, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 1 },
        PortalFlash.DURATION / 2, Phaser.Easing.Quadratic.Out,
        true, 0, 0, true);
    var t3 = this.game.add.tween(this.scale);
    t3.to({ x: 1, y: 1 },
        PortalFlash.DURATION, Phaser.Easing.Quadratic.Out, true);
    t3.onComplete.add(function(point, tween) {
        this.kill();
    }, this);
};
