// An expanding + spinning ring + triangle.
var PortalFlash = function(game) {
    this.game = game;
    var r = PortalFlash.RADIUS;
    r *= PortalFlash.SCALE;
    var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
    var c = bitmap.context;
    c.strokeStyle = PortalFlash.COLOR;
    c.lineWidth = Tier.PATH_WIDTH;
    c.lineWidth *= PortalFlash.SCALE;
    c.beginPath();
    c.arc(r, r, r / 2, 0, 2 * Math.PI, false);
    c.stroke();
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;


    var w = r * 0.6;
    var h = w * 0.87;
    bitmap = this.game.add.bitmapData(w, h);
    c = bitmap.context;
    c.strokeStyle = PortalFlash.COLOR;
    c.fillStyle = PortalFlash.COLOR;
    c.lineWidth = 1.5;
    c.lineWidth *= PortalFlash.SCALE;
    c.beginPath();
    var xs = [0, w / 2, w];
    var ys = [h, 0, h];
    c.moveTo(xs[0], ys[0]);
    c.lineTo(xs[1], ys[1]);
    c.lineTo(xs[2], ys[2]);
    c.lineTo(xs[0], ys[0]);
    c.closePath();
    c.fill();
    this.triangle = this.game.make.sprite(0, 0, bitmap);
    this.addChild(this.triangle);
    this.triangle.anchor.setTo(0.5, 0.65);
    // this.events.onRevived.add(function(portalFlash) {});
};

PortalFlash.prototype = Object.create(Phaser.Sprite.prototype);
PortalFlash.prototype.constructor = PortalFlash;

// Constants.
PortalFlash.RADIUS = PortalPoint.RADIUS;
PortalFlash.SCALE = 5;
PortalFlash.COLOR = '#ffffff';
PortalFlash.DURATION = 5000; // ms
PortalFlash.ROTATION = 2.1 * Math.PI;


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
    // var t = this.game.add.tween(this);
    // t.to({ rotation: 2.1 * Math.PI },
    //     PortalFlash.DURATION, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 1 },
        PortalFlash.DURATION / 2, Phaser.Easing.Quadratic.Out,
        true, 0, 0, true);
    var t3 = this.game.add.tween(this.scale);
    t3.to({ x: 1, y: 1 },
        PortalFlash.DURATION, Phaser.Easing.Quadratic.Out, true);
    t3.flash = this;
    t3.onComplete.add(function(point, tween) {
        tween.flash.kill();
    });
};
