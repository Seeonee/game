// Burst.
var TraceBurst = function(trace) {
    Phaser.Sprite.call(this, trace.game, 0, 0, 'keyplate');
    this.anchor.setTo(0.5);
    this.tweens = [];
};

TraceBurst.prototype = Object.create(Phaser.Sprite.prototype);
TraceBurst.prototype.constructor = TraceBurst;


// Reset.
TraceBurst.prototype.reset = function(trace) {
    this.revive();
    this.alpha = 1;
    this.scale.setTo(1);
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];

    this.play();
};

// Start our gfx cycle.
TraceBurst.prototype.play = function() {
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.InOut, true);
    this.tweens.push(t);
    var t = this.game.add.tween(this.scale);
    t.to({ x: 1.5, y: 1.5 }, 500, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.kill();
    }, this);
    this.tweens.push(t);
};











// Player ghost.
var TraceSilhouette = function(trace) {
    Phaser.Sprite.call(this, trace.game, 0, 0, 'keyplate');
    this.anchor.setTo(0.5);
    this.tweens = [];
};

TraceSilhouette.prototype = Object.create(Phaser.Sprite.prototype);
TraceSilhouette.prototype.constructor = TraceSilhouette;

// Constants.
TraceSilhouette.FLICKER_TIME = 1000; // ms


// Reset.
TraceSilhouette.prototype.reset = function(trace) {
    this.revive();
    // this.tint = trace.palette.c2.i;
    this.scale.setTo(0.6);
    this.alpha = 0;

    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];

    this.play();
};

// Start our gfx cycle.
TraceSilhouette.prototype.play = function() {
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
TraceSilhouette.prototype.recall = function(trace) {
    this.trace = trace;
    this.game.time.events.remove(this.event);
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, 250, Phaser.Easing.Quartic.In, true);
    this.tweens.push(t);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 0 }, 500, Phaser.Easing.Quadratic.In);
    t.chain(t2);
    this.tweens.push(t2);

    var t = this.game.add.tween(this.scale);
    t.to({ x: 0.5, y: 0.5 }, 250, Phaser.Easing.Cubic.In, true);
    this.tweens.push(t);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: 1.5, y: 1.5 }, 500, Phaser.Easing.Cubic.Out);
    t.chain(t2);
    t2.onComplete.add(function() {
        this.kill();
        this.trace.base.visible = false;
        this.trace.alive = false;
        this.trace.dying = false;
    }, this);
    this.tweens.push(t2);
};










// Triangular particle.
var TraceSpark = function(trace, fraction) {
    Phaser.Sprite.call(this, trace.game, 0, 0, 'smoke');
    this.fraction = fraction;
    this.anchor.setTo(0.5, 0.6);
    this.tweens = [];
};

TraceSpark.prototype = Object.create(Phaser.Sprite.prototype);
TraceSpark.prototype.constructor = TraceSpark;

// Constants.
TraceSpark.SHIFT = 50;
TraceSpark.TIME = 10000; // ms
TraceSpark.ALPHA0 = 0;
TraceSpark.ALPHA1 = 0.3;
TraceSpark.DRIFT = -6;


// Reset.
TraceSpark.prototype.reset = function(trace) {
    this.revive();
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.tint = trace.palette.c1.i;

    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];

    this.rotation = Math.random() * 2 * Math.PI;
    var scale = 0.4 + Math.random() * 0.6;
    this.scale.setTo(scale);
    this.time = TraceSpark.TIME;
    this.time *= 0.6 + Math.random() * 1.4;

    this.burst();
};

// Start our gfx cycle.
TraceSpark.prototype.burst = function() {
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
    this.tweens = [];

    this.alpha = 1;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0, x: 0, y: 0 }, 500,
        Phaser.Easing.Sinusoidal.InOut, true);
    this.tweens.push(t);
    var t = this.game.add.tween(this.scale);
    t.to({ x: 0.25, y: 0.25 }, 500, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.kill();
    }, this);
    this.tweens.push(t);
};
