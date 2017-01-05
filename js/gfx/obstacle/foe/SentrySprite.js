// A sentry that blasts the player on approach.
var SentrySprite = function(game, x, y, palette) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);

    var y = SentrySprite.Y_OFFSET;
    this.head = this.addChild(this.game.add.sprite(0, y, 'foe_sentry', 0));
    this.head.anchor.setTo(0.5);
    this.torso = this.addChild(this.game.add.sprite(0, y, 'foe_sentry', 1));
    this.torso.anchor.setTo(0.5);
    this.feet = this.addChild(this.game.add.sprite(0, y, 'foe_sentry', 2));
    this.feet.anchor.setTo(0.5);

    var bitmap = this.game.bitmapCache.get(
        SentrySprite.prototype.painterRing, this);
    this.ring = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.ring.anchor.setTo(0.5);
    this.ring.alpha = SentrySprite.IDLE_ALPHA;

    var bitmap = this.game.bitmapCache.get(
        SentrySprite.prototype.painterBurst, this);
    this.burst = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.burst.anchor.setTo(0.5);
    this.burst.alpha = 0;

    this.setPalette(palette);
};

SentrySprite.prototype = Object.create(Phaser.Sprite.prototype);
SentrySprite.prototype.constructor = SentrySprite;

// Constants.
SentrySprite.Y_OFFSET = 10;
SentrySprite.LINE_WIDTH = 2;
SentrySprite.IDLE_ALPHA = 0;
SentrySprite.EXPAND_TIME = 50; // ms


// Paint our bitmap.
SentrySprite.prototype.painterRing = function(bitmap) {
    var r = Sentry.TRAP_RADIUS;
    var lw = SentrySprite.LINE_WIDTH;
    var d = 2 * (r + lw);
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.strokeStyle = '#ffffff';
    c.lineWidth = lw;
    c.arc(d / 2, d / 2, r, 0, 2 * Math.PI, false);
    c.stroke();
};

// Paint our bitmap.
SentrySprite.prototype.painterBurst = function(bitmap) {
    var r = Sentry.TRAP_RADIUS;
    var lw = SentrySprite.LINE_WIDTH;
    var d = 2 * (r + lw);
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.arc(d / 2, d / 2, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Update colors.
SentrySprite.prototype.setPalette = function(palette) {
    this.torso.tint = palette.c1.i;
    this.feet.tint = palette.c2.i;
    this.ring.tint = palette.c2.i;
};

// Charge up a burst.
SentrySprite.prototype.chargeUp = function(callback, context) {
    this.ring.alpha = 1;

    this.burst.alpha = 0;
    var t = this.game.add.tween(this.burst);
    t.to({ alpha: 1 }, Sentry.CHARGE_TIME,
        Phaser.Easing.Quadratic.In, true);
    this.burst.scale.setTo(1);
    var t = this.game.add.tween(this.burst.scale);
    t.to({ x: 0.1, y: 0.1 }, Sentry.CHARGE_TIME,
        Phaser.Easing.Cubic.In, true);

    t.onComplete.add(callback, context);
};

// Cool off after a burst.
SentrySprite.prototype.coolDown = function() {
    var t = this.game.add.tween(this.ring);
    t.to({ alpha: SentrySprite.IDLE_ALPHA },
        Sentry.RECHARGE_TIME * 0.95,
        Phaser.Easing.Sinusoidal.InOut, true);

    this.burst.alpha = 1;
    var t = this.game.add.tween(this.burst);
    t.to({ alpha: 0 }, Sentry.KILL_TIME * 1.15,
        Phaser.Easing.Quartic.In, true);

    this.burst.scale.setTo(0.75);
    var t = this.game.add.tween(this.burst.scale);
    t.to({ x: 1.05, y: 1.05 }, Sentry.KILL_TIME,
        Phaser.Easing.Quintic.Out, true, 0, 0, true);
};
