// Keeps all flickers in sync.
var FlickerManager = function(game) {
    this.game = game;
    this.alpha = 1;
    this.tween = this.game.add.tween(this);
    this.tween.to({ alpha: 0 },
        FlickerManager.TIME, Phaser.Easing.Sinusoidal.InOut,
        true, 0, Number.POSITIVE_INFINITY, true);
    this.tween.yoyoDelay(FlickerManager.DELAY);
};

// Constants.
FlickerManager.TIME = 1000; // ms
FlickerManager.DELAY = 1500; // ms
FlickerManager.TOLERANCE = 0.01;


// Set our colors.
FlickerManager.prototype.view = function(max, min) {
    max = max != undefined ? max : 1;
    min = min != undefined ? min : 0;
    return new FlickerView(this, max, min);
}

// Shut down.
FlickerManager.prototype.stop = function() {
    this.tween.stop();
    this.alpha = 0;
};








// View into the manager.
var FlickerView = function(manager, max, min) {
    this.manager = manager;
    this.max = max;
    this.min = min;
    this.range = max - min;
    this._free = true;
    this.t = undefined;
    this._alpha = undefined;
};

Object.defineProperty(FlickerView.prototype, 'alpha', {
    get: function() {
        if (this.t) {
            return this._alpha;
        }
        var alpha = this.manager.alpha * this.range + this.min;
        if (this._alpha != undefined) {
            var delta = Math.abs(this._alpha - alpha);
            if (this._free && delta < FlickerManager.TOLERANCE) {
                this._alpha = undefined;
                return alpha;
            } else {
                return this._alpha;
            }
        } else {
            return alpha;
        }
    },
    set: function(value) {
        if (this.t) {
            this.t.stop();
            this.t = undefined;
        }
        this._alpha = value;
        this._free = false;
    }
});

// Indicate that we should shine until we resync.
FlickerView.prototype.free = function() {
    this._free = true;
}

// Indicate that we should shine until we resync.
FlickerView.prototype.tween = function(to, time, easing, delay, free) {
    if (this.t) {
        this.t.stop();
    }
    if (this._alpha == undefined) {
        this._alpha = this.alpha;
    }
    delay = delay != undefined ? delay : 0;
    this.t = this.manager.game.add.tween(this);
    this.t.to({ _alpha: to }, time, easing, true, delay);
    this._free = free;
    this.t.onComplete.add(function() {
        this.t = undefined;
    }, this);
}








// Add some features to sprites that'll make life easier.
Phaser.Sprite.prototype.update = function() {
    this.updateChildren();
};

// Method for updating all children.
Phaser.Sprite.prototype.updateChildren = function() {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].update) {
            this.children[i].update();
        }
    }
};
