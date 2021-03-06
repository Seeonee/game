// Handle the recall power.
var TraceIState = function(handler, level) {
    IState.call(this, TraceIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;

    var bitmap = this.game.bitmapCache.get(
        TraceIState.painter);
    this.orb = this.game.add.sprite(0, 0, bitmap);
    this.orb.anchor.setTo(0.5);
    this.orb.visible = false;
    this.tweens = [];
};

TraceIState.NAME = 'trace';
TraceIState.prototype = Object.create(IState.prototype);
TraceIState.prototype.constructor = TraceIState;

// Constants.
TraceIState.RADIUS = 15;
TraceIState.RECALL_TIME = 500; // ms


// Paint our bitmap.
TraceIState.painter = function(bitmap) {
    var r = TraceIState.RADIUS;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Called when obtained.
TraceIState.prototype.activated = function(prev) {
    this.pressed = false;
    this.trace = this.avatar.power;
};

// Called when lost.
TraceIState.prototype.deactivated = function(next) {
    // Noop.
    this.avatar.tierMeter.setPowerPressed(false);
    this.tracing = false;
    this.orb.visible = false;
};

// Handle an update.
TraceIState.prototype.update = function() {
    if (this.tracing) {
        return;
    }
    if (this.gpad.justPressed(this.buttonMap.POWER)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
        this.avatar.tierMeter.setPowerPressed(true);
        return false;
    } else if (this.pressed &&
        this.gpad.justReleased(this.buttonMap.POWER)) {
        this.gpad.consumeButtonEvent();
        this.avatar.tierMeter.setPowerPressed(false);
        if (this.trace.dying) {
            return;
        }
        if (!this.trace.alive) {
            this.avatar.tierMeter.usePower();
            this.trace.layTrace(this.level.tier);
        } else if (this.trace.tier === this.level.tier) {
            this.avatar.tierMeter.usePower();
            this.tracing = true;
            this.avatar.point = this.trace.point;
            this.avatar.path = this.trace.path;
            this.avatar.updateAttachment();
            this.trace.recall();
            this.recallAvatar();
        }
    } else {
        return false;
    }
};

// Tween clean.
TraceIState.prototype.cleanTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Slide the avatar, and play a small orb effect.
TraceIState.prototype.recallAvatar = function() {
    this.cleanTweens();
    var time = TraceIState.RECALL_TIME;
    var t = this.game.add.tween(this.avatar);
    t.to({ x: this.trace.x, y: this.trace.y },
        time, Phaser.Easing.Quintic.Out, true);
    t.onComplete.add(function() {
        this.avatar.checkCollision();
        this.tracing = undefined;
    }, this);
    this.tweens.push(t);

    var t = this.game.add.tween(this.avatar);
    t.to({ alpha: 0 }, time / 2,
        Phaser.Easing.Quintic.Out, true,
        0, 0, true);
    this.tweens.push(t);

    var y = this.avatar.keyplate.y;
    this.orb.x = this.avatar.x;
    this.orb.y = this.avatar.y + y;
    this.orb.visible = true;
    this.orb.scale.setTo(0.2);
    var t = this.game.add.tween(this.orb);
    t.to({ x: this.trace.x, y: this.trace.y + y },
        time, Phaser.Easing.Quintic.Out, true);
    this.tweens.push(t);

    var t = this.game.add.tween(this.orb.scale);
    t.to({ x: 1, y: 1 }, time / 2,
        Phaser.Easing.Sinusoidal.Out, true,
        0, 0, true);
    t.onComplete.add(function() {
        this.orb.visible = false;
    }, this);
    this.tweens.push(t);
};

// Cancel everything that's underway.
TraceIState.prototype.release = function() {
    this.cleanTweens();
    this.orb.visible = false;
    this.avatar.x = this.trace.x;
    this.avatar.y = this.trace.y;
    this.avatar.alpha = 1;
};
