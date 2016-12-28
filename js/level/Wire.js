// A wire routes power from a source to a sink.
// Enabledness changes in the source are propagated 
// to the sink.
var Wire = function(name, sourceName, sinkName,
    weight1, weight2) {
    this.name = name;
    this.sourceName = sourceName;
    this.sinkName = sinkName;
    this.renderNeeded = true;

    // Our weight is how much we shift over before 
    // starting our wire's slope.
    // Usually not needed, but can be set to 1 or 2 if 
    // you need a few wires to un-bunch.
    this.weight1 = weight1 ? weight1 : 0;
    this.weight2 = weight2 ? weight2 : 0;
};

Wire.TYPE = 'wire'; // Helps with editing.

// Constants.
Wire.WIDTH = 2;
Wire.PAD = 4;
Wire.ALPHA_ON = 0.5;
Wire.ALPHA_ON_LOW = 0;
Wire.ALPHA_OFF = 0;
Wire.ALPHA_BASE_ON_LOW = 0;
Wire.ALPHA_BASE_OFF = 0;
Wire.ALPHA_EDIT_ON_LOW = 0.25;
Wire.ALPHA_EDIT_OFF = 0.1;
Wire.SEGMENT_X = 15;
Wire.SEGMENT_Y = Wire.SEGMENT_X / 2;
Wire.WEIGHT_SHIFT = 9;


// Called during the draw walk by our tier.
Wire.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        this.game = tier.game;
        this.source = tier.pointMap[this.sourceName];
        this.sink = tier.pointMap[this.sinkName];

        this.enabled = this.source.enabled;
        this.sink.setEnabled(this.enabled);
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

        if (this.game.settings.edit) {
            Wire.ALPHA_ON_LOW = Wire.ALPHA_EDIT_ON_LOW;
            Wire.ALPHA_OFF = Wire.ALPHA_EDIT_OFF;
        } else {
            Wire.ALPHA_ON_LOW = Wire.ALPHA_BASE_ON_LOW;
            Wire.ALPHA_OFF = Wire.ALPHA_BASE_OFF;
        }
        var bitmap = this.createBitmap();
        this.image = this.game.add.sprite(
            this.x - Wire.PAD, this.y - Wire.PAD, bitmap);
        this.game.state.getCurrentState().z.wire.tier().add(
            this.image);

        if (!this.flickerview) {
            this.flickerview = this.game.state.getCurrentState().flicker
                .view(Wire.ALPHA_ON, Wire.ALPHA_ON_LOW);
        }
        this.image.alpha = Wire.ALPHA_OFF;
        this.flickerview.alpha = Wire.ALPHA_OFF;
        if (this.enabled) {
            this.fadingIn();
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
    var xsign = dx ? Math.sign(dx) : 1;
    var ysign = dy ? Math.sign(dy) : 1;
    var xs = xsign * Wire.SEGMENT_X;
    var ys = ysign * Wire.SEGMENT_Y;

    var x10 = x1;
    var y10 = y1;
    var x20 = x2;
    var y20 = y2;
    if (this.source.useOffsets) {
        x1 += xs;
        y1 += ys;
        if (dx) {
            dx -= xs;
        }
        if (dy) {
            dy -= ys;
        }
    }
    if (this.sink.useOffsets) {
        x2 -= xs;
        y2 -= ys;
        if (dx) {
            dx -= xs;
        }
        if (dy) {
            dy -= ys;
        }
    }

    var points = [];
    var xbase = Wire.PAD;
    var ybase = Wire.PAD;
    points.push({ x: xbase + x1, y: ybase + y1 });
    if (dx) {
        if (this.weight1) {
            var shift = xsign * this.weight1 * Wire.WEIGHT_SHIFT;
            points.push({ x: xbase + x1 + shift, y: ybase + y1 });
            xbase += shift;
            x2 -= shift;
            dx -= shift;
        }
        if (this.weight2) {
            var shift = this.weight2 * Wire.WEIGHT_SHIFT;
            dx -= xsign * shift;
            dy -= ysign * shift;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            var dy2 = xsign * Math.abs(dy);
            points.push({ x: xbase + x1 + dy2, y: ybase + y1 + dy });
        } else {
            var dx2 = ysign * Math.abs(dx);
            points.push({ x: xbase + x1 + dx, y: ybase + y1 + dx2 });
        }
        if (this.weight2) {
            points.push({
                x: xbase + x2 - xsign * shift,
                y: ybase + y2 - ysign * shift
            });
        }
        points.push({ x: xbase + x2, y: ybase + y2 });
    } else {
        points.push({ x: xbase + x1, y: ybase + y2 });
    }

    var w = 0;
    var h = 0;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        w = Math.max(w, Math.abs(p.x));
        h = Math.max(h, Math.abs(p.y));
    }
    w += Wire.PAD;
    h += Wire.PAD;

    var bitmap = this.game.add.bitmapData(w, h);
    var c = bitmap.context;
    c.lineWidth = Wire.WIDTH;
    c.lineCap = 'round';
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (i == 0) {
            c.moveTo(p.x, p.y);
        } else {
            c.lineTo(p.x, p.y);
        }
    }
    c.stroke();

    var o1 = this.source.attachmentRadius;
    var o2 = this.sink.attachmentRadius;
    if (o1) {
        Utils.clearArc(c, xbase + x10, ybase + y10, o1);
    }
    if (o2) {
        Utils.clearArc(c, xbase + x20, ybase + y20, o2);
    }

    return bitmap;
};

// Lights on!
Wire.prototype.notifyEnabled = function() {
    if (!this.enabled) {
        this.enabled = true;
        this.flickerview.alpha = Wire.ALPHA_ON;
        this.flickerview.free();
        this.sink.setEnabled(true);
    }
};

// Lights off!
Wire.prototype.notifyDisabled = function() {
    if (this.enabled) {
        this.enabled = false;
        this.flickerview.alpha = Wire.ALPHA_ON;
        this.flickerview.tween(Wire.ALPHA_OFF,
            FlickerManager.TIME, Phaser.Easing.Cubic.Out,
            0);
        this.sink.setEnabled(false);
    }
};

// Are we enabled?
Wire.prototype.isEnabled = function() {
    return this.enabled;
};

// Called when the tier updates.
Wire.prototype.update = function() {
    this.image.alpha = this.flickerview.alpha;
};

// Highlight the wire.
Wire.prototype.setHighlight = function(palette) {
    this.image.tint = palette.c2.i;
    this.flickerview.alpha = 1;
};

// Unhighlight the wire.
Wire.prototype.cancelHighlight = function() {
    var alpha = this.enabled ?
        Wire.ALPHA_ON_LOW : Wire.ALPHA_OFF;
    this.image.alpha = alpha;
    this.flickerview.alpha = alpha;
    this.flickerview.free();
    this.image.tint = this.game.settings.colors.WHITE.i;
};

// Handle various fade events.
Wire.prototype.fadingIn = function(tier) {
    var alpha = this.enabled ? Wire.ALPHA_ON_LOW : Wire.ALPHA_OFF;
    this.flickerview.alpha = 0;
    this.flickerview.tween(alpha,
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.None,
        Tier.FADE_TIME / 2, this.enabled);
};

Wire.prototype.fadedIn = function(tier) {};

Wire.prototype.fadingOut = function(tier) {
    // We stop being the active tier, so our 
    // update() calls end. That meanns we have
    // to tween our alpha directly.
    this.game.add.tween(this.image).to({ alpha: 0 },
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.None, true);
};

Wire.prototype.fadedOut = function(tier) {};

// Update one of our ends.
Wire.prototype.replaceEnd = function(old, obj) {
    this.delete();
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
    var result = {
        source: this.source.name,
        sink: this.sink.name
    };
    if (this.weight1) {
        result.weight1 = this.weight1;
    }
    if (this.weight2) {
        result.weight2 = this.weight2;
    }
    return result;
};

// Load a JSON representation of a wire.
Wire.load = function(game, name, json) {
    return new Wire(name, json.source, json.sink,
        json.weight1, json.weight2);
};
