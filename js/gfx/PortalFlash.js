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
    this.triangle = this.game.make.sprite(0, 0, 'smoke');
    this.addChild(this.triangle);
    this.triangle.anchor.setTo(0.5, 0.6);
    this.triangle.scale.setTo(PortalFlash.SCALE);
    // this.events.onRevived.add(function(portalFlash) {});
};

PortalFlash.prototype = Object.create(Phaser.Sprite.prototype);
PortalFlash.prototype.constructor = PortalFlash;

// Constants.
PortalFlash.RADIUS = PortalPoint.RADIUS;
PortalFlash.SCALE = 5;
PortalFlash.COLOR = '#ffffff';
PortalFlash.DURATION = 500; // ms
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
    t3.flash = this;
    t3.onComplete.add(function(point, tween) {
        tween.flash.kill();
    });
};
