// An orbiting ring fragment.
var ERing = function(game, x, y, name, palette, index, max) {
    Phaser.Sprite.call(this, game, x, y, name);
    this.anchor.setTo(0); // Top left. It's actually the default.
    this.randomizeScale();

    this.colorOn = palette.c2.i;
    this.colorOff = this.game.settings.colors.WHITE.i;
    this.tint = this.colorOn;

    this.index = index;
    this.max = max;
    this.ratio = this.index / this.max;
    this.goalAngle = this.ratio * 2 * Math.PI -
        ERing.ANGLE / 2 - Math.PI / 2;
    while (this.goalAngle < 0) {
        this.goalAngle += 2 * Math.PI;
    }
    this.goalAngle %= 2 * Math.PI;
    this.spin = (Math.random() >= 0.5 ? 2 : -2) * Math.PI;
    this.rotation = this.goalAngle;

    this.stable = false;
    this.startRotation();
};

ERing.prototype = Object.create(Phaser.Sprite.prototype);
ERing.prototype.constructor = ERing;

// Constants.
ERing.ANGLE = Math.PI / 6;
ERing.SPIN_TIME = 8000; // ms
ERing.TIME_VARIANCE = 0.4;
ERing.SCALE_TIME = 400; // ms
ERing.SCALE_VARIANCE = 0.4;
ERing.SCALE_ROAM = 0.1;
ERing.DISABLED_ALPHA = 0.25;
ERing.STABILIZE_TIME = 1000; // ms
ERing.STABILIZE_VARIANCE = 0.15;


// Randomize our scale.
ERing.prototype.randomizeScale = function(tween) {
    var scale = 1 - ERing.SCALE_VARIANCE +
        Math.random() * 2 * ERing.SCALE_VARIANCE;
    if (tween) {
        var t = this.game.add.tween(this.scale);
        t.to({ x: scale, y: scale }, ERing.SCALE_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
    } else {
        this.scale.setTo(scale);
    }
};

// Set up our rotation.
ERing.prototype.startRotation = function() {
    if (this.tween) {
        this.tween.stop();
    }
    this.rotation = (this.rotation + 2 * Math.PI) % (2 * Math.PI);
    var variance = ERing.TIME_VARIANCE;
    var ratio = 1 - variance + Math.random() * 2 * variance;
    var time = ERing.SPIN_TIME * ratio;
    var delay = (0.1 + Math.random()) * ERing.SPIN_TIME / 2;
    this.tween = this.game.add.tween(this);
    this.tween.to({ rotation: this.rotation + this.spin },
        time, Phaser.Easing.Linear.InOut, true, delay,
        Number.POSITIVE_INFINITY);
};

// Set our enabled state.
ERing.prototype.setEnabled = function(enabled) {
    this.tint = enabled ? this.colorOn : this.colorOff;
    this.alpha = enabled ? 1 : ERing.DISABLED_ALPHA;
};

// Pause ring's rotation.
ERing.prototype.setPaused = function(paused) {
    if (!this.tween) {
        return;
    }
    if (paused) {
        this.tween.pause();
    } else {
        this.tween.resume();
    }
};

// Lock rings into their final spots.
ERing.prototype.setStable = function(stable) {
    if (stable == this.stable) {
        return;
    }
    this.stable = stable;
    if (stable) {
        if (this.tween) {
            this.tween.stop();
        }
        while (this.rotation < 0) {
            this.rotation += 2 * Math.PI;
        }
        this.rotation %= 2 * Math.PI;
        var sign = Math.sign(this.goalAngle - this.rotation);
        if (sign != Math.sign(this.spin)) {
            this.rotation += sign * 2 * Math.PI;
        }
        var variance = ERing.STABILIZE_VARIANCE;
        var ratio = 1 - variance + Math.random() * 2 * variance;
        var time = ERing.STABILIZE_TIME * ratio;
        var delay = ERing.STABILIZE_TIME * (1 + variance) - time;
        this.tween = this.game.add.tween(this);
        this.tween.to({ rotation: this.goalAngle },
            time, Phaser.Easing.Quadratic.Out, true);
        var t = this.game.add.tween(this.scale);
        t.to({ x: 1, y: 1 }, ERing.SCALE_TIME,
            Phaser.Easing.Sinusoidal.InOut, false, delay);
        this.tween.chain(t);
    } else {
        this.randomizeScale(true);
        this.startRotation();
    }
};
