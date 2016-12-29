// Manager for the gfx involved in deploying a trace.
var Trace = function(avatar, palette) {
    this.avatar = avatar;
    this.game = avatar.game;
    this.avatar.trace = this;
    this.point = avatar.point;
    this.path = avatar.path;

    this.reuseTime = this.game.time.now + Trace.REUSE_DELAY;
    this.palette = palette;
    this.x = avatar.x;
    this.y = avatar.y + avatar.keyplate.y;
    this.z = this.game.state.getCurrentState().z;

    // This one is for absolutely positioning.
    this.base = this.game.add.sprite(this.x, this.y);
    this.base.anchor.setTo(0.5);
    this.z.fg.tier().add(this.base);

    // This is the actual diamond silhouette.
    // It bursts in and shrinks, then flickers.
    this.silhouette = new TraceSilhouette(this, palette);
    this.silhouette.anchor.setTo(0.5);
    this.silhouette.scale.setTo(0.6);
    this.base.addChild(this.silhouette);

    this.sparks = [];
    for (var i = 0; i < Trace.PARTICLES; i++) {
        var spark = new TraceSpark(this, i / Trace.PARTICLES);
        this.sparks.push(this.base.addChild(spark));
    }

    this.burst = this.game.add.sprite(0, 0, 'keyplate');
    this.burst.anchor.setTo(0.5, 0.5);
    this.base.addChild(this.burst);

    var t = this.game.add.tween(this.burst);
    t.to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.InOut, true);
    var t = this.game.add.tween(this.burst.scale);
    t.to({ x: 1.5, y: 1.5 }, 500, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.burst.destroy();
    }, this);
};

// Constants.
Trace.PARTICLES = 15;
Trace.REUSE_DELAY = 700; // ms


// Shut it down.
Trace.prototype.recall = function() {
    this.silhouette.recall();
    for (var i = 0; i < this.sparks.length; i++) {
        this.sparks[i].recall();
    }
};










// Player ghost.
var TraceSilhouette = function(trace) {
    Phaser.Sprite.call(this, trace.game, 0, 0, 'keyplate');
    this.anchor.setTo(0.5);
    // this.tint = trace.palette.c2.i;
    this.scale.setTo(0.6);
    this.play();
};

TraceSilhouette.prototype = Object.create(Phaser.Sprite.prototype);
TraceSilhouette.prototype.constructor = TraceSilhouette;

// Constants.
TraceSilhouette.FLICKER_TIME = 1000; // ms


// Start our gfx cycle.
TraceSilhouette.prototype.play = function() {
    this.alpha = 0;
    this.tweens = [];
    var t = this.game.add.tween(this);
    t.to({ alpha: 0.5 }, TraceSilhouette.FLICKER_TIME,
        Phaser.Easing.Bounce.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
    this.flicker();
};

// Resizing.
TraceSilhouette.prototype.flicker = function() {
    if (!this.alive) {
        return;
    }
    var scale = 0.4 + Math.random() * 0.3;
    this.scale.setTo(scale);

    var time = TraceSilhouette.FLICKER_TIME;
    time *= 0.3 + Math.random() * 1.7;
    this.event = this.game.time.events.add(
        time, this.flicker, this);
};

// Shut it down.
TraceSilhouette.prototype.recall = function() {
    this.game.time.events.remove(this.event);
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.alpha = 1;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.InOut, true);
    var t = this.game.add.tween(this.scale);
    t.to({ x: 1.5, y: 1.5 }, 500, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.destroy();
    }, this);
};










// Triangular particle.
var TraceSpark = function(trace, fraction) {
    Phaser.Sprite.call(this, trace.game, 0, 0, 'smoke');
    this.fraction = fraction;
    this.anchor.setTo(0.5, 0.6);
    this.tint = trace.palette.c1.i;

    this.rotation = Math.random() * 2 * Math.PI;
    var scale = 0.4 + Math.random() * 0.6;
    this.scale.setTo(scale);

    this.burst();
};

TraceSpark.prototype = Object.create(Phaser.Sprite.prototype);
TraceSpark.prototype.constructor = TraceSpark;

// Constants.
TraceSpark.SHIFT = 50;
TraceSpark.TIME = 10000; // ms
TraceSpark.ALPHA0 = 0;
TraceSpark.ALPHA1 = 0.3;
TraceSpark.DRIFT = -6;


// Start our gfx cycle.
TraceSpark.prototype.burst = function() {
    this.tweens = [];
    this.time = TraceSpark.TIME;
    this.time *= 0.6 + Math.random() * 1.4;
    var time = this.time;

    var rotation = this.rotation +
        (Math.random() >= 0.5 ? 2 * Math.PI : -2 * Math.PI);
    var t = this.game.add.tween(this);
    t.to({ rotation: rotation }, time,
        Phaser.Easing.Linear.None, true,
        0, Number.POSITIVE_INFINITY);
    this.tweens.push(t);

    var a = this.fraction * 2 * Math.PI;
    // a *= 1 + (0.5 - Math.random()) * 0.2;
    var d = TraceSpark.SHIFT;
    d *= 0.8 + Math.random() * 0.6;
    var x = this.x + d * Math.sin(a);
    var y = this.y + d * Math.cos(a);
    var t = this.game.add.tween(this);
    var drift = TraceSpark.DRIFT;
    t.to({
            x: x - drift / 2,
            y: y - drift / 2,
            alpha: TraceSpark.ALPHA1
        },
        500 + Math.random() * 200,
        Phaser.Easing.Quintic.Out, true);
    this.tweens.push(t);
    t.onComplete.add(this.play, this);
};

// Looping gfx.
TraceSpark.prototype.play = function() {
    var time = this.time;

    this.alpha = TraceSpark.ALPHA1;
    var alpha = TraceSpark.ALPHA0;
    var t = this.game.add.tween(this);
    t.to({ alpha: alpha }, time / 5,
        Phaser.Easing.Bounce.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);

    var drift = TraceSpark.DRIFT;
    var y = this.y + drift;
    var x = this.x + drift;
    var t = this.game.add.tween(this);
    t.to({ y: y, x: x }, time / 4,
        Phaser.Easing.Sinusoidal.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
};

// Shut it down.
TraceSpark.prototype.recall = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.alpha = 1;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0, x: 0, y: 0 }, 500,
        Phaser.Easing.Sinusoidal.InOut, true);
    var t = this.game.add.tween(this.scale);
    t.to({ x: 0.25, y: 0.25 }, 500, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.destroy();
    }, this);
};
