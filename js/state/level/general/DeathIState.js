// Player has died.
var DeathIState = function(handler, level) {
    IState.call(this, DeathIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.sparks = [];
    this.tweens = [];
    this.pool = new SpritePool(this.game, DeathIState.DeathSpark);
};

DeathIState.NAME = 'death';
DeathIState.prototype = Object.create(IState.prototype);
DeathIState.prototype.constructor = DeathIState;

// Constants!
DeathIState.FADE_TIME = 2000; // ms
DeathIState.MASK_FLY_TIME = 2000; // ms
DeathIState.MASK_FLY_DISTANCE = 250;
DeathIState.MASK_SPIN = Math.PI;
DeathIState.MASK_SPIN_TIME = 120000; // ms
DeathIState.SPARKS = 30;
DeathIState.SPARK_TIME = 1500; // ms
DeathIState.SPARK_OFFSET = -6;
DeathIState.SPARK_DISTANCE = 200;
DeathIState.SPARK_SPREAD = Math.PI;
DeathIState.SPARK_FADE_CHANCE = 0.5;
DeathIState.SPARK_FADE_ALPHA = 0.1;
DeathIState.SPARK_FADE_TIME = 1000; // ms
DeathIState.SPARK_FADE_DELAY_BASE = 40000; // ms
DeathIState.SPARK_FADE_DELAY_VARY = 5000; // ms


// Activated.
DeathIState.prototype.activated = function(prev) {
    this.a = this.avatar.deathAngle;
    this.masq = this.avatar.masq;
    this.maskFound = this.masq;
    if (!this.maskFound) {
        this.masq = this.avatar.keyplate;
        this.tint = this.level.tier.palette.c1.i;
    } else {
        this.tint = this.level.tier.palette.c2.i;
    }
    this.maskX = this.masq.x;
    this.maskY = this.masq.y;

    this.masq.x += this.masq.parent.x;
    this.masq.y += this.masq.parent.y;
    this.game.camera.follow(this.masq);
    this.game.add.existing(this.masq);

    var d = DeathIState.MASK_FLY_DISTANCE;
    var x = this.masq.x + d * Math.sin(this.a);
    var y = this.masq.y + d * Math.cos(this.a);
    var spin = DeathIState.MASK_SPIN;
    var rotation = -spin / 2 + Math.random() * spin;
    this.flying = true;
    this.particle = 0;
    this.startTime = this.game.time.now;
    this.storeNextSparkTime();
    var t = this.game.add.tween(this.masq)
    t.to({ x: x, y: y, rotation: rotation },
        DeathIState.MASK_FLY_TIME,
        Phaser.Easing.Quintic.Out, true);
    t.onComplete.add(function() {
        this.flying = false;
    }, this);
    this.tweens.push(t);

    var t2 = this.game.add.tween(this.masq);
    t2.to({ rotation: rotation + Math.sign(rotation) * 2 * Math.PI },
        DeathIState.MASK_SPIN_TIME, Phaser.Easing.Linear.None,
        false, 0, Number.POSITIVE_INFINITY);
    t.chain(t2);
    this.tweens.push(t2);

    var t = this.game.add.tween(this.level.z).to({ alpha: 0 },
        DeathIState.FADE_TIME, Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);
};

// Handle an update.
DeathIState.prototype.storeNextSparkTime = function() {
    this.progress = this.particle / DeathIState.SPARKS;
    this.progress = Math.pow(this.progress, 3);
    this.sparkTime = this.startTime + this.progress *
        DeathIState.MASK_FLY_TIME;
    if (this.progress > 0.65) {
        this.flying = false;
    }
    this.particle++;
};

// Handle an update.
DeathIState.prototype.update = function() {
    this.avatar.velocity.x = 0;
    this.avatar.velocity.y = 0;

    if (this.flying && this.sparkTime < this.game.time.now) {
        // Use a SpritePool.
        var s = this.pool.make(this.game);
        s.burn(this.masq, this.tint,
            this.a, this.progress);
        this.storeNextSparkTime();
    }
    if (this.gpad.justReleased(this.buttonMap.SELECT) ||
        this.gpad.justReleased(this.buttonMap.START)) {
        this.fixEverything();
        this.game.state.getCurrentState().restoreLevel();
        this.activate(UnpausedIState.NAME);
    }
};

// Undo all our gfx.
DeathIState.prototype.fixEverything = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
    this.pool.killAll();

    this.level.z.alpha = 1;

    this.masq.rotation = 0;
    this.masq.x = this.maskX;
    this.masq.y = this.maskY;
    this.avatar.addChild(this.masq);

    this.game.camera.follow(this.avatar);
    this.game.state.getCurrentState().updateDeadzone();
};








// Smoke from the flying mask.
DeathIState.DeathSpark = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        DeathIState.DeathSpark.painter);
    Phaser.Sprite.call(this, this.game, 0, 0, bitmap);
    this.anchor.setTo(0.5);
    this.tweens = [];
};

DeathIState.DeathSpark.prototype = Object.create(Phaser.Sprite.prototype);
DeathIState.DeathSpark.prototype.constructor = DeathIState.DeathSpark;

// Yup, constants.
DeathIState.DeathSpark.R = 20;
DeathIState.DeathSpark.SCALE = 4.1;


// Set off the spark.
DeathIState.DeathSpark.prototype.burn = function(parent, tint, a, progress) {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];

    this.x = parent.x;
    this.y = parent.y;
    this.rotation = Math.random() * 2 * Math.PI;
    var progress2 = 1 - Math.pow(progress, 1 / 3);
    var scale = progress2 * 4;
    scale *= 0.9 + Math.random() * 0.2;
    this.scale.setTo(scale / DeathIState.DeathSpark.SCALE);
    this.tint = tint;
    var alpha = Math.random() > 0.8 ? 0.5 : 1;
    this.alpha = alpha;

    this.game.world.addChildAt(this, 0);

    var progress3 = 1 - Math.pow(progress, 1 / 5);
    var time = DeathIState.SPARK_TIME * progress2;
    var d = DeathIState.SPARK_OFFSET +
        DeathIState.SPARK_DISTANCE * progress3;
    var spread = DeathIState.SPARK_SPREAD * progress3;
    var a2 = -a - spread / 2 + Math.random() * spread;
    var x = this.x + d * Math.sin(a2);
    var y = this.y - d * Math.cos(a2);
    var t = this.game.add.tween(this).to({ x: x, y: y, alpha: alpha },
        time, Phaser.Easing.Cubic.Out, true);
    this.tweens.push(t);

    if (Math.random() > DeathIState.SPARK_FADE_CHANCE) {
        var alpha = DeathIState.SPARK_FADE_ALPHA;
        var time = DeathIState.SPARK_FADE_TIME + Math.random() *
            DeathIState.SPARK_FADE_TIME;
        var delay = 1000 + Math.random() * 5000;
        var t2 = this.game.add.tween(this).to({ alpha: alpha },
            time, Phaser.Easing.Sinusoidal.InOut, false, delay,
            Number.POSITIVE_INFINITY, true);
        t2.repeatDelay(delay);
        t.chain(t2);
        this.tweens.push(t2);
    }

    var time = DeathIState.SPARK_FADE_DELAY_BASE +
        Math.random() * DeathIState.SPARK_FADE_DELAY_VARY;
    rotation = this.rotation + (2 * Math.PI *
        (Math.random() > 0.5 ? 1 : -1));
    var t = this.game.add.tween(this).to({ rotation: rotation },
        time, Phaser.Easing.Linear.None, true, 0, Number.POSITIVE_INFINITY);
    this.tweens.push(t);
};

// Paint our bitmap.
DeathIState.DeathSpark.painter = function(bitmap) {
    var r = DeathIState.DeathSpark.R;
    r *= DeathIState.DeathSpark.SCALE;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
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
