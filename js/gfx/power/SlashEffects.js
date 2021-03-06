// Slash.
var SlashEffects = function(slash) {
    this.game = slash.game;

    this.bitmap = this.createBitmap();
    Phaser.Sprite.call(this, this.game, 0, 0, this.bitmap);
    this.anchor.setTo(0, 0.5);
    this.alpha = 0;

    this.r = SlashEffects.R1;
    this.update();

    this.tweens = [];
    this.sparkTime = -1;
    this.spool = new SpritePool(this.game, SlashEffects.Spark);
    this.gpool = new SpritePool(this.game, SlashEffects.Gust);
};

SlashEffects.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.prototype.constructor = SlashEffects;

// Constants.
SlashEffects.R1 = 0.22;
SlashEffects.ARC_ALPHA1 = 1; // 0.5;
SlashEffects.ARC_W = 9;
SlashEffects.FADE_IN = 250; // ms
SlashEffects.SPARK_INTERVAL = 200; // ms
SlashEffects.SPARK_TIME = 500; // ms
SlashEffects.GUST_TIME = 200; // ms
SlashEffects.SMOKE_DRIFT = SlashPower.RADIUS;
SlashEffects.GUST_Y = 30;
SlashEffects.GUST_DRIFT = 60;


// Make our bitmap.
SlashEffects.prototype.createBitmap = function() {
    var r = SlashPower.RADIUS;
    return this.game.add.bitmapData(r + SlashEffects.ARC_W, 2 * r);
};

// Paint our bitmap.
SlashEffects.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    if (this._r != this.r) {
        var threshold = 0.9;
        if (this._r < threshold && this.r > threshold) {
            this.game.camera.flash();
        }
        this._r = this.r;
        var r = SlashPower.RADIUS * this._r;
        var a = SlashPower.CATCH;
        var c = this.bitmap.context;
        c.clearRect(0, 0, this.bitmap.width, this.bitmap.height);
        c.strokeStyle = '#ffffff';
        c.lineWidth = SlashEffects.ARC_W;
        c.beginPath();
        c.arc(0, SlashPower.RADIUS, r, -a, a, false);
        c.stroke();
        this.bitmap.dirty = true;
    }
    if (this.sparkTime >= 0 && this.game.time.now > this.sparkTime) {
        this.sparkTime = this.game.time.now + SlashEffects.SPARK_INTERVAL;
        this.spool.make(this.game).fire(this);
    }
};

// Stop all tweens.
SlashEffects.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Begin targeting.
SlashEffects.prototype.arm = function(palette) {
    this.clearTweens();
    this.gpool.killAll();

    this.tint = palette.c2.i;
    this.sparkTime = 0;

    this.r = SlashEffects.R0;
    var t = this.game.add.tween(this);
    t.to({ r: SlashEffects.R1 },
        SlashEffects.FADE_IN, Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);

    this.alpha = 0;
    var t = this.game.add.tween(this);
    t.to({ alpha: SlashEffects.ARC_ALPHA1 },
        SlashEffects.FADE_IN, Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);
};

// Take the shot.
SlashEffects.prototype.slash = function() {
    this.clearTweens();
    this.spool.killAll();
    this.sparkTime = -1;

    this.tint = this.game.settings.colors.WHITE.i;

    this.alpha = 1;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, SlashPower.LOCKOUT,
        Phaser.Easing.Cubic.In, true);
    this.tweens.push(t);

    var t = this.game.add.tween(this);
    t.to({ r: 1 }, SlashPower.LOCKOUT,
        Phaser.Easing.Quintic.Out, true);
    this.tweens.push(t);

    this.gpool.make(this.game).fire(this);
};

// End the charge, with zero gfx or animation.
SlashEffects.prototype.nevermind = function() {
    this.clearTweens();
    this.alpha = 0;
    this.tint = this.game.settings.colors.WHITE.i;
};








// Sparks during slash arm.
SlashEffects.Spark = function(game) {
    Phaser.Sprite.call(this, game, 0, 0);
    this.anchor.setTo(0.5);

    this.smoke = this.addChild(this.game.add.sprite(0, 0, 'smoke'));
    this.smoke.anchor.setTo(0.5);
    this.smoke.alpha = 0;

    this.tweens = [];
};

SlashEffects.Spark.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.Spark.prototype.constructor = SlashEffects.Spark;


// Cleanup.
SlashEffects.Spark.prototype.cleanUp = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Fire!
SlashEffects.Spark.prototype.fire = function(parent) {
    this.cleanUp();
    parent.addChild(this);
    var a = SlashPower.CATCH;
    var r = Utils.randInt(0, 3) / 3;
    this.rotation = Math.PI + Math.PI / 2 - a + r * 2 * a;

    this.smoke.tint = parent.tint;
    this.smoke.x = 0;
    this.smoke.y = SlashEffects.SMOKE_DRIFT;
    this.smoke.alpha = 1;
    this.smoke.scale.setTo(0.1);
    var t = this.game.add.tween(this.smoke);
    t.to({ y: 0, alpha: 0 }, SlashEffects.SPARK_TIME,
        Phaser.Easing.Sinusoidal.In, true);
    this.tweens.push(t);
    t.onComplete.add(function() {
        this.kill();
    }, this);

    var scale = 1;
    var t = this.game.add.tween(this.smoke.scale);
    t.to({ x: scale, y: scale }, SlashEffects.SPARK_TIME,
        Phaser.Easing.Sinusoidal.Out, true);
    this.tweens.push(t);
};








// Gust during slash.
SlashEffects.Gust = function(game) {
    Phaser.Sprite.call(this, game, 0, 0);
    this.anchor.setTo(0.5);
    this.rotation = -Math.PI / 2;

    this.smoke = this.addChild(this.game.add.sprite(0, 0, 'smoke'));
    this.smoke.anchor.setTo(0.5);
    this.smoke.rotation = Math.PI;

    this.tweens = [];
};

SlashEffects.Gust.prototype = Object.create(Phaser.Sprite.prototype);
SlashEffects.Gust.prototype.constructor = SlashEffects.Gust;


// Cleanup.
SlashEffects.Gust.prototype.cleanUp = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Fire!
SlashEffects.Gust.prototype.fire = function(parent) {
    this.cleanUp();
    parent.addChild(this);

    this.smoke.y = SlashEffects.GUST_Y;
    var t = this.game.add.tween(this.smoke);
    t.to({ y: this.y + SlashEffects.GUST_DRIFT },
        SlashEffects.GUST_TIME,
        Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);
    t.onComplete.add(function() {
        this.kill();
    }, this);
};
