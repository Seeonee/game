// Tracker for which tier we're currently on.
var TierMeter = function(game, level) {
    this.game = game;
    this.level = level;
    this.avatar = this.level.avatar;
    this.lowest = parseInt(this.level.tiers[0].name.substring(1));
    this.numTiers = level.tiers.length;
    this.keys = {};
    this.hud = undefined;
    this.lit = false;

    var r1 = TierMeter.R1;
    var r2 = TierMeter.R2;
    var x = r2 + TierMeter.PAD;
    var y = x;
    var w = 2 * x;
    var h = 2 * y;
    this.bitmap = this.game.add.bitmapData(w, h);
    var c = this.bitmap.context;

    // "Border" arc.
    c.fillStyle = this.game.settings.colors.WHITE.rgba(
        TierMeter.BORDER_ALPHA);
    var apad = TierMeter.APAD;
    var arc = TierMeter.ANGLE * this.numTiers + apad * (this.numTiers - 1);
    var a0 = arc / 2;
    var a1 = a0 + apad;
    var a2 = a0 + (2 * Math.PI - arc) - apad;
    var shift = Math.PI / 2;
    var coords = this.shiftCoordsFor(x, y, a1, shift);
    c.moveTo(coords.x, coords.y);
    c.arc(x, y, r2, a1, a2, false);
    coords = this.shiftCoordsFor(x, y, a2, -shift);
    c.lineTo(coords.x, coords.y);
    c.closePath();
    c.fill();

    // Individual tier arcs.
    for (var i = 0; i < this.numTiers; i++) {
        var t = this.level.tiers[i];
        var da = i * apad;
        var a = i * TierMeter.ANGLE;
        c.fillStyle = t.palette.c1.s;
        c.beginPath();
        var a1 = a0 - da - (a + TierMeter.ANGLE);
        var a2 = a0 - da - a;
        coords = this.shiftCoordsFor(x, y, a1, shift);
        c.moveTo(coords.x, coords.y);
        c.arc(x, y, r2, a1, a2, false);
        coords = this.shiftCoordsFor(x, y, a2, -shift);
        c.lineTo(coords.x, coords.y);
        c.closePath();
        c.fill();
    }
    // Clear the center.
    Utils.clearArc(c, x, y, r1);
    // Super constructor to actually build us as a sprite.
    Phaser.Sprite.call(this, game, 0, 0, this.bitmap);
    level.z.fg.add(this);

    // Triangular indicator for which tier we're on.
    this.triangle = this.game.make.sprite(0, 0, 'smoke');
    var scale = TierMeter.TRIANGLE_SCALE;
    this.triangle.anchor.setTo(0.5, TierMeter.TRIANGLE_OFFSET -
        TierMeter.R2 / (scale * this.triangle.height));
    this.anchor.setTo(0.5);
    this.triangle.scale.setTo(scale);
    this.addChild(this.triangle);

    // Key trackers.
    // Text for how many current-tier keys we hold.
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.text = this.game.add.text(0, 0, '0', style);
    this.addChild(this.text);
    this.text.anchor.setTo(-0.7, 0.45);
    // The little "x" for the number; looks better than font x.
    w = TierMeter.X_STROKE_LENGTH;
    h = w;
    var stroke = TierMeter.X_STROKE_WIDTH;
    var bitmap = this.game.add.bitmapData(w, h);
    c = bitmap.context;
    var xy = [stroke, w - stroke];
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    c.lineWidth = stroke;
    c.beginPath();
    c.moveTo(xy[0], xy[0]);
    c.lineTo(xy[1], xy[1]);
    c.stroke();
    c.beginPath();
    c.moveTo(xy[0], xy[1]);
    c.lineTo(xy[1], xy[0]);
    c.stroke();
    this.textx = this.game.add.sprite(0, 0, bitmap);
    this.textx.anchor.setTo(0.2, 0.5);
    this.addChild(this.textx);
    // And now the empty/filled "key" icon.
    this.keyEmpty = this.game.add.sprite(0, 0, 'keyplate_outline');
    this.addChild(this.keyEmpty);
    scale = TierMeter.KEYPLATE_SCALE;
    var anchorx = 1.2;
    this.keyEmpty.anchor.setTo(anchorx, 0.5);
    this.keyEmpty.scale.setTo(scale);
    this.keyFull = this.game.add.sprite(0, 0, 'keyplate');
    this.addChild(this.keyFull);
    this.keyFull.anchor.setTo(anchorx, 0.5);
    this.keyFull.scale.setTo(scale);
    this.keyFull.visible = false;
    // And finally, a small tracker for keys above this tier.
    w = TierMeter.CLOUD_W;
    var pad = TierMeter.CLOUD_PAD;
    var dw = w + pad;
    bitmap = this.game.add.bitmapData(
        TierMeter.CLOUD_MAX * dw - pad, w);
    this.cloud = this.game.add.sprite(0, 0, bitmap);
    this.addChild(this.cloud);
    this.cloud.anchor.setTo(0.5, 4.7);
    this.fillUpCloud(0);

    // Finish our setup, fixing camera position and 
    // listening for tier change events.
    this.alpha = 0;
    this.updateSettings(this.game.settings);
    this.fixedToCamera = true;
    this.cameraOffset.setTo(TierMeter.CAMERA_X, TierMeter.CAMERA_Y);
    this.level.events.onTierChange.add(this.setTier, this);
    this.setTier(this.level.tier);
};

TierMeter.prototype = Object.create(Phaser.Sprite.prototype);
TierMeter.prototype.constructor = TierMeter;

// Constants.
TierMeter.R1 = 38;
TierMeter.R2 = 50;
TierMeter.ANGLE = 2 * Math.PI / 10.5;
TierMeter.APAD = TierMeter.ANGLE / 5;
TierMeter.APAD_L = TierMeter.R2 * Math.sin(TierMeter.APAD / 2);
TierMeter.PAD = 0;
TierMeter.BORDER_ALPHA = 0.15;
TierMeter.CAMERA_X = 15 + TierMeter.R2;
TierMeter.CAMERA_Y = 15 + TierMeter.R2;
TierMeter.TRIANGLE_SCALE = 0.65;
TierMeter.TRIANGLE_OFFSET = 0.5;
TierMeter.X_STROKE_LENGTH = 14;
TierMeter.X_STROKE_WIDTH = 2.5;
TierMeter.KEYPLATE_SCALE = 0.5;
TierMeter.CLOUD_W = 6;
TierMeter.CLOUD_PAD = 6;
TierMeter.CLOUD_MAX = 3;
TierMeter.FADE_TIME = 300; // ms
TierMeter.FADE_OUT_DELAY = 2000; // ms
TierMeter.TRIANGLE_TRAVEL_TIME = 500; // ms


// Change the current tier.
TierMeter.prototype.setTier = function(tier) {
    var actualIndex = parseInt(tier.name.substring(1));
    var index = actualIndex - this.lowest;

    var apad = TierMeter.APAD;
    var arc = TierMeter.ANGLE * this.numTiers + apad * (this.numTiers - 1);
    var a0 = (arc - Math.PI - TierMeter.ANGLE) / 2;
    var da = index * (TierMeter.ANGLE + apad);
    var t = this.game.add.tween(this.triangle);
    t.to({ rotation: a0 - da }, TierMeter.FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);

    var t0 = this.level.tierMap['t' + (actualIndex - 1)];
    if (t0) {
        this.text.style.fill = tier.palette.c1.s;
        this.text.dirty = true;
        var keys = this.keys[tier.name] ? this.keys[tier.name] : 0;
        this.text.setText(keys);
        this.textx.tint = tier.palette.c1.i;
        this.keyEmpty.tint = tier.palette.c1.i;
        this.keyFull.tint = tier.palette.c1.i;
        this.text.visible = true;
        this.textx.visible = true;
        this.keyEmpty.visible = keys == 0;
        this.keyFull.visible = keys > 0;
    } else {
        this.text.visible = false;
        this.textx.visible = false;
        this.keyEmpty.visible = false;
        this.keyFull.visible = false;
    }
    var t2 = this.level.tierMap['t' + (actualIndex + 1)];
    if (t2) {
        this.cloud.tint = t2.palette.c1.i;
        var keys = this.keys[t2.name];
        this.fillUpCloud(keys ? keys : 0);
        this.cloud.visible = true;
    } else {
        this.cloud.visible = false;
    }
};

// Update anytime the settings change.
TierMeter.prototype.fillUpCloud = function(keys) {
    keys = Math.min(keys, TierMeter.CLOUD_MAX);
    var w = TierMeter.CLOUD_W;
    var dw = w + TierMeter.CLOUD_PAD;
    var bitmap = this.cloud.key;
    var c = bitmap.context;
    c.clearRect(0, 0, bitmap.width, bitmap.height);
    for (var i = 0; i < TierMeter.CLOUD_MAX; i++) {
        alpha = i < keys ? 1 : TierMeter.BORDER_ALPHA;
        c.fillStyle = this.game.settings.colors.WHITE.rgba(alpha);
        c.fillRect(i * dw, 0, w, w);
    }
    bitmap.dirty = true;
};

// Update anytime the settings change.
TierMeter.prototype.updateSettings = function(settings) {
    var old = this.hud;
    this.hud = settings.hud;
    if (old == this.hud) {
        return;
    }
    if (this.t && this.hud != Settings.HUD_SOMETIMES) {
        this.t.stop();
    }
    if (this.hud == Settings.HUD_ALWAYS) {
        this.alpha = 1;
    } else if (this.hud == Settings.HUD_NEVER) {
        this.alpha = 0;
    } else {
        this.alpha = this.lit ? 1 : 0;
    }
};

// Fade ourselves in or out.
TierMeter.prototype.fade = function(fadeIn) {
    this.lit = fadeIn;
    if (this.hud != Settings.HUD_SOMETIMES) {
        return;
    }
    var alpha = fadeIn ? 1 : 0;
    var delay = fadeIn ? 0 : TierMeter.FADE_OUT_DELAY;
    if (this.t) {
        this.t.stop();
    }
    this.t = this.game.add.tween(this);
    this.t.to({ alpha: alpha }, TierMeter.TRIANGLE_TRAVEL_TIME,
        Phaser.Easing.Cubic.Out, true, delay);
};

// Add a key for the next tier up.
TierMeter.prototype.addKey = function() {
    var currentIndex = parseInt(this.level.tier.name.substring(1));
    var actualIndex = 1 + currentIndex;
    if (actualIndex == this.numTiers) {
        return;
    }
    var tier = this.level.tierMap['t' + actualIndex];
    var keys = this.keys[tier.name] ? this.keys[tier.name] : 0;
    if (keys == TierMeter.MAX_KEYS) {
        return;
    }
    keys += 1;
    this.keys[tier.name] = keys;
    var index = (this.numTiers - 1) - (actualIndex - this.lowest);
    this.fillUpCloud(keys);
};

// Subtract a key for the current tier.
TierMeter.prototype.useKey = function() {
    var currentIndex = parseInt(this.level.tier.name.substring(1));
    var tier = this.level.tierMap['t' + currentIndex];
    var keys = this.keys[tier.name] ? this.keys[tier.name] : 0;
    if (keys <= 0) {
        return;
    }
    keys -= 1;
    this.keys[tier.name] = keys;
    var index = (this.numTiers - 1) - (currentIndex - this.lowest);
    this.text.setText(keys);
    this.keyEmpty.visible = keys == 0;
    this.keyFull.visible = keys > 0;
};

// Utility for drawing better segments.
TierMeter.prototype.shiftCoordsFor = function(x, y, angle, delta) {
    var apadOver2 = TierMeter.APAD / 2;
    var d = TierMeter.APAD_L;
    var forward = Math.sign(delta) >= 0;
    var theta = angle + (forward ? -apadOver2 : apadOver2) + delta;
    var dx = d * Math.cos(theta);
    var dy = d * Math.sin(theta);
    return {
        x: x + dx,
        y: y + dy,
    };
};
