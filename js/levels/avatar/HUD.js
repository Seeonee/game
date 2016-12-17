// Tracker for which tier we're currently on.
var TierMeter = function(game, level) {
    this.game = game;
    this.level = level;
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

    Phaser.Sprite.call(this, game, 0, 0, this.bitmap);
    level.z.fg.add(this);

    this.triangle = this.game.make.sprite(0, 0, 'smoke');
    var scale = TierMeter.TRIANGLE_SCALE;
    this.triangle.anchor.setTo(0.5, TierMeter.TRIANGLE_OFFSET -
        TierMeter.R2 / (scale * this.triangle.height));
    this.anchor.setTo(0.5);
    this.triangle.scale.setTo(scale);
    this.addChild(this.triangle);

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
TierMeter.FADE_TIME = 300; // ms
TierMeter.FADE_OUT_DELAY = 2000; // ms
TierMeter.TRIANGLE_SCALE = 0.65;
TierMeter.TRIANGLE_OFFSET = 0.5;
TierMeter.SPIN_TIME = 500; // ms


// Change the current tier.
TierMeter.prototype.setTier = function(tier) {
    var index =
        (parseInt(tier.name.substring(1)) - this.lowest);

    var apad = TierMeter.APAD;
    var arc = TierMeter.ANGLE * this.numTiers + apad * (this.numTiers - 1);
    var a0 = (arc - Math.PI - TierMeter.ANGLE) / 2;
    var da = index * (TierMeter.ANGLE + apad);
    var t = this.game.add.tween(this.triangle);
    t.to({ rotation: a0 - da }, TierMeter.FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
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
    this.t.to({ alpha: alpha }, TierMeter.SPIN_TIME,
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
    this.keys[tier.name] = keys + 1;
    var index = (this.numTiers - 1) - (actualIndex - this.lowest);

    // TODO: !!!
    console.log('added a key for tier ' + tier.name);
};

// Subtract a key for the current tier.
TierMeter.prototype.useKey = function() {
    var currentIndex = parseInt(this.level.tier.name.substring(1));
    var tier = this.level.tierMap['t' + currentIndex];
    var keys = this.keys[tier.name] ? this.keys[tier.name] : 0;
    if (keys <= 0) {
        return;
    }
    this.keys[tier.name] = keys - 1;
    var index = (this.numTiers - 1) - (currentIndex - this.lowest);

    // TODO: !!!
    console.log('used a key for tier ' + tier.name);
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
