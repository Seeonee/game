// The ball of light that takes us out of the level.
var ETraveller = function(game, x, y, palette) {
    Phaser.Sprite.call(this, game, x, y);
    this.game.state.getCurrentState().z.mg.add(this);
    this.anchor.setTo(0.5);
    this.alpha = 0;

    this.events.onPortalOpen = new Phaser.Signal();
    this.events.onPortalClosed = new Phaser.Signal();

    var r = ETraveller.RADIUS;
    var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.arc(r, r, r, 0, Math.PI * 2, false);
    c.fill();
    this.corona = this.game.add.sprite(0, 0, bitmap);
    this.addChild(this.corona);
    this.corona.anchor.setTo(0.5);
    this.corona.tint = palette.c2.i;
    this.corona.scale.setTo(ETraveller.CORONA_SCALE1);

    this.core = this.game.add.sprite(0, 0, bitmap);
    this.addChild(this.core);
    this.core.anchor.setTo(0.5);
    this.core.scale.setTo(ETraveller.CORE_SCALE1);

    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, ETraveller.FADE_IN_TIME,
        Phaser.Easing.Cubic.Out, true);

    var scale = ETraveller.CORE_SCALE2;
    var t2 = this.game.add.tween(this.core.scale);
    t2.to({ x: scale, y: scale }, ETraveller.CORE_IN_TIME,
        Phaser.Easing.Quadratic.In, true);
    t2.onComplete.add(function() {
        this.events.onPortalOpen.dispatch();
    }, this);
    var scale = ETraveller.CORE_SCALE3;
    var t3 = this.game.add.tween(this.core.scale);
    t3.to({ x: scale, y: scale }, ETraveller.CORE_CREEP_TIME,
        Phaser.Easing.Sinusoidal.In);
    t2.chain(t3);
    var scale = ETraveller.CORE_SCALE4;
    var t4 = this.game.add.tween(this.core.scale);
    t4.to({ x: scale, y: scale }, ETraveller.CORE_OUT_TIME,
        Phaser.Easing.Quadratic.Out);
    t3.chain(t4);

    scale = ETraveller.CORONA_SCALE2;
    var t5 = this.game.add.tween(this.corona.scale);
    t5.to({ x: scale, y: scale }, ETraveller.CORONA_IN_TIME,
        Phaser.Easing.Quadratic.Out, true);
    var scale = ETraveller.CORONA_SCALE3;
    var t6 = this.game.add.tween(this.corona.scale);
    t6.to({ x: scale, y: scale }, ETraveller.CORONA_OUT_TIME,
        Phaser.Easing.Quadratic.Out);
    t5.chain(t6);
    var t7 = this.game.add.tween(this);
    t7.to({ alpha: 0 }, ETraveller.FADE_OUT_TIME,
        Phaser.Easing.Cubic.Out, false, ETraveller.FADE_OUT_DELAY);
    t.chain(t7);
    t7.onComplete.add(function() {
        this.events.onPortalClosed.dispatch();
        this.kill();
    }, this);
};

ETraveller.prototype = Object.create(Phaser.Sprite.prototype);
ETraveller.prototype.constructor = ETraveller;

// Constants.
ETraveller.RADIUS = 30;

ETraveller.CORE_SCALE1 = 0.25;
ETraveller.CORE_SCALE2 = 0.6;
ETraveller.CORE_SCALE3 = 0.65;
ETraveller.CORE_SCALE4 = 0;
ETraveller.CORONA_SCALE1 = 1.1;
ETraveller.CORONA_SCALE2 = 0.9;
ETraveller.CORONA_SCALE3 = 0.25;

ETraveller.FADE_IN_TIME = 500; // ms
ETraveller.FADE_OUT_TIME = 100; // ms
ETraveller.CORE_IN_TIME = 400; // ms
ETraveller.CORE_CREEP_TIME = 600; // ms
ETraveller.CORE_OUT_TIME = 200; // ms
ETraveller.CORONA_IN_TIME = 1000; // ms
ETraveller.CORONA_OUT_TIME = 300; // ms

// ETraveller.FADE_OUT_DELAY = 700; // ms
ETraveller.FADE_OUT_DELAY =
    ETraveller.CORONA_IN_TIME +
    ETraveller.CORONA_OUT_TIME -
    ETraveller.FADE_IN_TIME -
    ETraveller.FADE_OUT_TIME; // ms
