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
        SentrySprite.painterRing);
    this.ring = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.ring.anchor.setTo(0.5);
    this.ring.alpha = SentrySprite.IDLE_ALPHA;

    var bitmap = this.game.bitmapCache.get(
        SentrySprite.painterBurst);
    this.burst = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.burst.anchor.setTo(0.5);
    this.burst.alpha = 0;

    this.setPalette(palette);
    this.sPool = new SpritePool(this.game, SentrySpark);
    this.sparkTime = -1;
};

SentrySprite.prototype = Object.create(Phaser.Sprite.prototype);
SentrySprite.prototype.constructor = SentrySprite;

// Constants.
SentrySprite.Y_OFFSET = 10;
SentrySprite.LINE_WIDTH = 2;
SentrySprite.IDLE_ALPHA = 0;
SentrySprite.EXPAND_TIME = 50; // ms
SentrySprite.SPARK_INTERVAL = 300; // ms
SentrySprite.SPARK_LIFESPAN = 1000; // ms


// Paint our bitmap.
SentrySprite.painterRing = function(bitmap) {
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
SentrySprite.painterBurst = function(bitmap) {
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
    this.chargeTime = this.game.time.now;
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
SentrySprite.prototype.update = function() {
    if (this.chargeTime) {
        var progress = this.game.time.now - this.chargeTime;
        progress /= Sentry.CHARGE_TIME;
        if (progress >= 1) {
            return;
        }
        if (this.sparkTime < this.game.time.now) {
            var time = SentrySprite.SPARK_LIFESPAN;
            time /= (1 + 2 * progress);
            if (time / 2 > (1 - progress) * Sentry.CHARGE_TIME) {
                this.chargeTime = undefined;
                return;
            }
            this.sPool.make(this).burn(time);
            this.sparkTime = this.game.time.now +
                SentrySprite.SPARK_INTERVAL / (1 + 6 * progress);
        }
    }
};

// Cool off after a burst.
SentrySprite.prototype.coolDown = function() {
    this.chargeTime = undefined;
    var t = this.game.add.tween(this.ring);
    t.to({ alpha: SentrySprite.IDLE_ALPHA },
        Sentry.RECHARGE_TIME * 0.95,
        Phaser.Easing.Sinusoidal.InOut, true);

    this.burst.alpha = 1;
    var t = this.game.add.tween(this.burst);
    t.to({ alpha: 0 }, Sentry.KILL_TIME,
        Phaser.Easing.Quartic.In, true);
    var t = this.game.add.tween(this.burst.scale);
    t.to({ x: 1.05, y: 1.05 }, Sentry.KILL_TIME,
        Phaser.Easing.Quintic.Out, true);
};






// Sparks while charging.
var SentrySpark = function(parent) {
    Phaser.Sprite.call(this, parent.game, 0, 0, 'smoke');
    this.anchor.setTo(0.5);
    parent.addChild(this);
    this.alpha = 0;
};

SentrySpark.prototype = Object.create(Phaser.Sprite.prototype);
SentrySpark.prototype.constructor = SentrySpark;


// Light the spark.
SentrySpark.prototype.burn = function(time) {
    this.alpha = 0;
    var a = Math.random() * 2 * Math.PI;
    var r = 50 + Math.random() * 50;
    this.rotation = -a;
    this.x = r * Math.sin(a);
    this.y = r * Math.cos(a);
    var x = 0;
    var y = 0;
    this.game.add.tween(this).to({ x: x, y: y }, time,
        Phaser.Easing.Quadratic.In, true).onComplete.add(
        function() {
            this.kill();
        }, this);
    this.game.add.tween(this).to({ alpha: 1 }, time / 2,
        Phaser.Easing.Sinusoidal.In, true, 0, 0, true);
    var scale1 = 0.2 + Math.random() * 0.3;
    var scale2 = 4 * scale1; //  0.8 + Math.random() * 0.7;
    this.scale.setTo(scale1);
    this.game.add.tween(this.scale).to({ x: scale2, y: scale2 },
        time, Phaser.Easing.Sinusoidal.In, true);
};
