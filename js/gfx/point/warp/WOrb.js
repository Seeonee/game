// The warp orb effect.
var WOrb = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        WOrb.painter);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5);
    this.visible = false;

    this.events.onCharged = new Phaser.Signal();
    this.events.onFizzled = new Phaser.Signal();
};

WOrb.prototype = Object.create(Phaser.Sprite.prototype);
WOrb.prototype.constructor = WOrb;

// Constants.
WOrb.R1 = 100;
WOrb.R2 = 20;
WOrb.HOVER_Y = 44;
WOrb.FADE_TIME = 250; // ms
WOrb.SCALE_TIME = 450; // ms


// Paint our bitmap.
WOrb.painter = function(bitmap) {
    var r = WOrb.R1;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.arc(r, r, r, 0, Math.PI * 2, false);
    c.fill();
};

// Begin the theatre!
WOrb.prototype.charge = function(x, y) {
    this.x = x;
    this.y = y - WOrb.HOVER_Y;
    this.scale.setTo(1);
    this.alpha = 0;
    this.visible = true;

    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, WOrb.FADE_TIME,
        Phaser.Easing.Cubic.Out, true);
    var t2 = this.game.add.tween(this.scale);
    var scale = WOrb.R2 / WOrb.R1;
    t2.to({ x: scale, y: scale }, WOrb.SCALE_TIME,
        Phaser.Easing.Quadratic.Out, true);
    t2.onComplete.add(function() {
        this.events.onCharged.dispatch();
    }, this);
};

// Begin the theatre!
WOrb.prototype.fizzle = function() {
    var t = this.game.add.tween(this.scale);
    var scale = 0.05;
    t.to({ x: scale, y: scale }, WOrb.FADE_TIME,
        Phaser.Easing.Quartic.Out, true);
    t.onComplete.add(function() {
        this.events.onFizzled.dispatch();
    }, this);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 0 }, WOrb.FADE_TIME,
        Phaser.Easing.Cubic.Out);
    t.chain(t2);
    t2.onComplete.add(function() {
        this.visible = false;
    }, this);
};
