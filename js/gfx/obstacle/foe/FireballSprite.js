// An orbiting fireball trap.
var FireballSprite = function(fireball, x, y, palette) {
    this.fireball = fireball;
    Phaser.Sprite.call(this, fireball.game, x, y);
    this.anchor.setTo(0.5);

    this.spinner = this.addChild(this.game.add.sprite(0, 0));

    var bitmap = this.game.bitmapCache.get(
        FireballSprite.painter);
    this.flame = this.spinner.addChild(this.game.add.sprite(
        0, this.fireball.radius, bitmap));
    this.flame.anchor.setTo(0.5);
    this.flame.scale.setTo(FireballSprite.LEAD_FLAME_SCALE);

    this.orb = this.spinner.addChild(this.game.add.sprite(
        0, this.fireball.radius));
    this.orb.anchor.setTo(0.5);
    this.setPalette(palette);

    this.hitbox = fireball.hitbox;
    this.hitbox.x = 0;
    this.hitbox.y = 0;
    this.orb.addChild(this.hitbox);

    this.sparkTime = -1;
    this.interval = FireballSprite.SPARK_INTERVAL /
        this.fireball.speedRatio;
    this.sparklifespan = FireballSprite.SPARK_LIFESPAN /
        this.fireball.speedRatio;

    if (FireballSprite.SPARK_POOL == undefined) {
        FireballSprite.SPARK_POOL = new SpritePool(
            this.game, FireballSprite.Spark, true);
    }
    this.startSpinning();
};

FireballSprite.prototype = Object.create(Phaser.Sprite.prototype);
FireballSprite.prototype.constructor = FireballSprite;

// Constants.
FireballSprite.LEAD_FLAME_SCALE = 0.8;
FireballSprite.SPARK_R = 24;
FireballSprite.SPARK_INTERVAL = 40; // ms
FireballSprite.SPARK_LIFESPAN = 700; // ms
FireballSprite.SPARK_STARTING_SCALE = 0.7;
FireballSprite.SPARK_TINT_DELAY = 50; // ms
FireballSprite.SPARK_GROWTH_TIME = 100; // ms
FireballSprite.SPARK_GROWTH_SCALE = 1.05;
FireballSprite.DRIFT_VARIANCE = 17;
FireballSprite.ANGLE_VARIANCE = Math.PI / 3;


// Paint our bitmap.
FireballSprite.painter = function(bitmap) {
    var d = FireballSprite.SPARK_R;
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, d, d);
};

// Begin our rotation.
FireballSprite.prototype.startSpinning = function() {
    FireballSprite.SPARK_POOL.killAll();

    if (this.tween) {
        this.tween.stop();
    }
    if (this.tween2) {
        this.tween2.stop();
    }
    var fireball = this.fireball;
    this.spinner.rotation = this.fireball.startAngle;
    this.tween = this.game.add.tween(this.spinner);
    this.tween.to({ rotation: fireball.rotation }, fireball.time,
        Phaser.Easing.Linear.None, true, 0,
        Number.POSITIVE_INFINITY, fireball.yoyo);

    this.orb.rotation = -this.fireball.startAngle;
    this.tween2 = this.game.add.tween(this.orb);
    this.tween2.to({ rotation: -fireball.rotation }, fireball.time,
        Phaser.Easing.Linear.None, true, 0,
        Number.POSITIVE_INFINITY, fireball.yoyo);
};

// Update colors.
FireballSprite.prototype.setPalette = function(palette) {
    this.sparktint = palette.c2.i;
};

// Get current orb coords (relative to our origin).
FireballSprite.prototype.getOrbCoords = function() {
    var r = this.orb.y;
    var a = -this.spinner.rotation;
    var x = r * Math.sin(a);
    var y = r * Math.cos(a);
    return { x: x, y: y };
};

// Update loop.
FireballSprite.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    var time = this.game.time.now;
    if (time > this.sparkTime) {
        var spark = FireballSprite.SPARK_POOL.make(this.game);
        spark.fireAway(this);
        this.sparkTime = time + this.interval;
    }
};






// Fireball trail.
FireballSprite.Spark = function(game) {
    this.game = game;
    var bitmap = game.bitmapCache.get(
        FireballSprite.painter);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5);
    this.visible = false;

    this.tweens = [];
};

FireballSprite.Spark.prototype = Object.create(Phaser.Sprite.prototype);
FireballSprite.Spark.prototype.constructor = FireballSprite.Spark;


// Fireball trail.
FireballSprite.Spark.prototype.fireAway = function(fbsprite) {
    var p = fbsprite.getOrbCoords();
    this.x = p.x;
    this.y = p.y;
    this.tint = this.game.settings.colors.WHITE.i;
    this.visible = true;
    fbsprite.addChild(this);
    this.rotation = fbsprite.spinner.rotation;

    this.rgb = Color.rgb(this.game.settings.colors.WHITE.i);
    var rgb = Color.rgb(fbsprite.sparktint);
    var t = this.game.add.tween(this.rgb).to(rgb,
        fbsprite.sparklifespan / 2,
        Phaser.Easing.Quadratic.Out, true,
        FireballSprite.SPARK_TINT_DELAY);
    this.tweens.push(t);

    this.scale.setTo(FireballSprite.SPARK_STARTING_SCALE);
    var time = FireballSprite.SPARK_GROWTH_TIME;
    var scale = FireballSprite.SPARK_GROWTH_SCALE;
    var t = this.game.add.tween(this.scale).to({ x: scale, y: scale },
        time, Phaser.Easing.Linear.None, true);
    this.tweens.push(t);
    var scale = 0.1 + Math.random() * 0.2;
    var t2 = this.game.add.tween(this.scale).to({ x: scale, y: scale },
        fbsprite.sparklifespan - time,
        Phaser.Easing.Linear.None);
    t.chain(t2);
    this.tweens.push(t2);

    var v = FireballSprite.DRIFT_VARIANCE;
    var dx = Math.random() * v - v / 2;
    var dy = Math.random() * v - v / 2;
    var x = this.x + dx;
    var y = this.y + dy;
    var a = FireballSprite.ANGLE_VARIANCE;
    var rotation = this.rotation + Math.random() * a - a / 2;
    var t = this.game.add.tween(this).to({
            x: x,
            y: y,
            rotation: rotation
        },
        fbsprite.sparklifespan,
        Phaser.Easing.Linear.None, true);
    t.onComplete.add(function() {
        this.visible = false;
        this.kill();
    }, this);
    this.tweens.push(t);

    this.events.onKilled.add(this.stopTweens, this);
};

// Tween cleanup.
FireballSprite.Spark.prototype.stopTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Update loop.
FireballSprite.Spark.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    this.tint = (this.rgb.r << 16) +
        (this.rgb.g << 8) +
        (this.rgb.b);
};
