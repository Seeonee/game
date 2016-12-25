// A wire routes power from a source to a sink.
// Enabledness changes in the source are propagated 
// to the sink.
var Wire = function(name, sourceName, sinkName) {
    this.name = name;
    this.sourceName = sourceName;
    this.sinkName = sinkName;
    this.renderNeeded = true;
};

// Constants.
Wire.WIDTH = 2;
Wire.PAD = 4;
Wire.ALPHA_ON = 1;
Wire.ALPHA_ON_LOW = 0.1;
Wire.ALPHA_OFF = 0.25;
Wire.SEGMENT = 15;
Wire.PULSE_TIME = 1000; // ms
Wire.PULSE_DELAY = 2500; // ms


// Called during the draw walk by our tier.
Wire.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        this.game = tier.game;
        this.source = tier.pointMap[this.sourceName];
        this.sink = tier.pointMap[this.sinkName];

        this.enabled = this.source.enabled;
        this.source.events.onEnabled.add(this.notifyEnabled, this);
        this.source.events.onDisabled.add(this.notifyDisabled, this);
        this.source.wires.push(this);
        this.sink.wires.push(this);

        this.x1 = this.source.gx + this.source.attachmentOffsetX;
        this.y1 = this.source.gy + this.source.attachmentOffsetY;
        this.x2 = this.sink.gx + this.sink.attachmentOffsetX;
        this.y2 = this.sink.gy + this.sink.attachmentOffsetY;
        this.x = Math.min(this.x1, this.x2);
        this.y = Math.min(this.y1, this.y2);
        this.gx = this.x;
        this.gy = this.y;
        this.width = Math.abs(this.x1 - this.x2);
        this.height = Math.abs(this.y1 - this.y2);

        var bitmap = this.createBitmap();
        this.image = this.game.add.sprite(
            this.x - Wire.PAD, this.y - Wire.PAD, bitmap);
        this.game.state.getCurrentState().z.wire.tier().add(
            this.image);
        this.image.alpha = 0;
        this.fadingIn();

        if (Wire.GLOW == undefined) {
            Wire.GLOW = { alpha: Wire.ALPHA_ON };
            var t = this.game.add.tween(Wire.GLOW);
            t.to({ alpha: Wire.ALPHA_ON_LOW },
                Wire.PULSE_TIME, Phaser.Easing.Sinusoidal.InOut,
                true, 0, Number.POSITIVE_INFINITY, true);
            t.yoyoDelay(Wire.PULSE_DELAY);
            Wire.GLOW.t = t;
        }
    }
};

// Finer details of wire line sketching on the bitmap context.
Wire.prototype.createBitmap = function() {
    var x1 = this.x1 - this.x;
    var y1 = this.y1 - this.y;
    var x2 = this.x2 - this.x;
    var y2 = this.y2 - this.y;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var s = Wire.SEGMENT;
    var xsign = dx ? Math.sign(dx) : 1;
    var ysign = dy ? Math.sign(dy) : 1;
    var xs = xsign * s;
    var ys = ysign * s;

    if (Math.abs(dx) < Wire.SEGMENT) {
        this.width += Wire.SEGMENT;
    }
    if (Math.abs(dy) < Wire.SEGMENT) {
        this.height += Wire.SEGMENT;
    }
    var bitmap = this.game.add.bitmapData(
        2 * Wire.PAD + this.width,
        2 * Wire.PAD + this.height);
    var c = bitmap.context;
    c.lineWidth = Wire.WIDTH;
    c.lineCap = 'round';
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    c.translate(Wire.PAD, Wire.PAD);
    c.moveTo(x1 + xs, y1 + ys / 2);
    if (dx) {
        dx -= 2 * xs;
    }
    if (dy) {
        dy -= 2 * (ys / 2);
    }
    if (dx) {
        if (Math.abs(dx) > Math.abs(dy)) {
            var dy2 = xsign * Math.abs(dy);
            c.lineTo(x1 + xs + dy2, y1 + ys / 2 + dy);
        } else {
            var dx2 = ysign * Math.abs(dx);
            c.lineTo(x1 + xs + dx, y1 + ys / 2 + dx2);
        }
        c.lineTo(x2 - xs, y2 - ys / 2);
    } else {
        c.lineTo(x1 + xs, y2 - ys / 2);
    }
    c.stroke();

    var o1 = this.source.attachmentRadius;
    var o2 = this.sink.attachmentRadius;
    if (o1) {
        Utils.clearArc(c, x1, y1, o1);
    }
    if (o2) {
        Utils.clearArc(c, x2, y2, o2);
    }

    return bitmap;
};

// Lights on!
Wire.prototype.notifyEnabled = function() {
    if (!this.enabled) {
        this.enabled = true;
        this.image.alpha = Wire.ALPHA_ON;
        this.flare = true;
        this.sink.setEnabled(true);
    }
};

// Lights off!
Wire.prototype.notifyDisabled = function() {
    if (this.enabled) {
        this.enabled = false;
        this.image.alpha = Wire.ALPHA_ON;
        this.game.add.tween(this.image).to({
                alpha: Wire.ALPHA_OFF
            }, Wire.PULSE_TIME,
            Phaser.Easing.Cubic.Out, true);
        this.sink.setEnabled(false);
    }
};

// Are we enabled?
Wire.prototype.isEnabled = function() {
    return this.enabled;
};

// Called when the tier updates.
Wire.prototype.update = function() {
    if (this.enabled && Wire.GLOW) {
        var alpha = Wire.GLOW.alpha;
        if (this.flare && alpha == Wire.ALPHA_ON) {
            this.flare = false;
        }
        if (!this.flare) {
            this.image.alpha = Wire.GLOW.alpha;
        }
    }
};

// Handle various fade events.
Wire.prototype.fadingIn = function(tier) {
    var alpha = this.enabled ? Wire.ALPHA_ON : Wire.ALPHA_OFF;
    this.game.add.tween(this.image).to({ alpha: alpha },
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.InOut, true,
        Tier.FADE_TIME / 2);
};

Wire.prototype.fadedIn = function(tier) {};

Wire.prototype.fadingOut = function(tier) {
    this.game.add.tween(this.image).to({ alpha: 0 },
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.InOut, true);
};

Wire.prototype.fadedOut = function(tier) {};

// Update one of our ends.
Wire.prototype.replaceEnd = function(old, obj) {
    this.delete();
    if (old.name == this.sourceName) {
        this.sourceName = obj.name;
    } else {
        this.sinkName = obj.name;
    }
    this.renderNeeded = true;
};

// Called when we're being deleted.
Wire.prototype.delete = function() {
    this.image.kill();
    this.unwire(this.source);
    this.unwire(this.sink);
    this.source.events.onEnabled.remove(this.notifyEnabled, this);
    this.source.events.onEnabled.remove(this.notifyDisabled, this);
};

// Unplug from an object.
Wire.prototype.unwire = function(obj) {
    if (!obj || !obj.wires) {
        return;
    }
    var i = obj.wires.indexOf(this);
    if (i >= 0) {
        obj.wires.splice(i, 1);
    }
};

// String version of our details, displayed during editing.
Wire.prototype.getDetails = function() {
    return ' (' + this.source.name + '-' + this.sink.name + ')';
};

// JSON conversion of a wire.
Wire.prototype.toJSON = function() {
    return {
        source: this.source.name,
        sink: this.sink.name
    };
};

// Load a JSON representation of a wire.
Wire.load = function(game, name, json) {
    return new Wire(name, json.source, json.sink);
};
