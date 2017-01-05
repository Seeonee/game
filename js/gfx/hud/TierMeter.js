// Tracker for which tier we're currently on.
var TierMeter = function(game, level) {
    this.game = game;
    this.level = level;
    this.avatar = this.level.avatar;
    this.lowest = this.level.tiers[0].index;
    this.numTiers = this.level.tiers.length;
    this.shards = {};
    this.hud = undefined;
    this.lit = false;
    this.ckbPool = new SpritePool(this.game, CloudShardBurst);
    this.ksbPool = new SpritePool(this.game, ShardSpendBurst);

    var d = 2 * TierMeter.R2 + TierMeter.PAD;
    this.bitmap = this.game.add.bitmapData(d, d);
    Phaser.Sprite.call(this, game, 0, 0, this.bitmap);
    this.createSelf();
    this.level.z.fg.add(this);

    // Finish our setup, fixing camera position and 
    // listening for tier change events.
    this.alpha = 0;
    this.updateSettings(this.game.settings);
    this.fixedToCamera = true;
    this.cameraOffset.setTo(TierMeter.CAMERA_X, TierMeter.CAMERA_Y);
    this.level.events.onTierChange.add(this.setTier, this);
    this.pressed = false;
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
TierMeter.CLOUD_MAX = 3;
TierMeter.BURST_Y = -13;
TierMeter.FADE_TIME = 300; // ms
TierMeter.FADE_OUT_DELAY = 3000; // ms
TierMeter.TRIANGLE_TRAVEL_TIME = 500; // ms
TierMeter.BURST_R = 35;
TierMeter.POWER_X = 2;
TierMeter.POWER_Y = 2;
TierMeter.PCIRCLE_RADIUS = 15;
TierMeter.PCIRCLE_THICKNESS = 4;


// Draw all of our stuff!
TierMeter.prototype.createSelf = function() {
    var r1 = TierMeter.R1;
    var r2 = TierMeter.R2;
    var x = r2 + TierMeter.PAD;
    var y = x;
    var w = 2 * x;
    var h = 2 * y;
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

    // Triangular indicator for which tier we're on.
    this.triangle = this.game.make.sprite(0, 0, 'smoke');
    var scale = TierMeter.TRIANGLE_SCALE;
    this.triangle.anchor.setTo(0.5, TierMeter.TRIANGLE_OFFSET -
        TierMeter.R2 / (scale * this.triangle.height));
    this.anchor.setTo(0.5);
    this.triangle.scale.setTo(scale);
    this.addChild(this.triangle);

    // Shard trackers.
    this.squarebase = this.addChild(this.game.add.sprite(0, 0));
    this.squarebase.anchor.setTo(0.5);
    this.csquares = {};
    var max = TierMeter.CLOUD_MAX;
    var n = this.numTiers - 1;
    for (var i = 0; i < n; i++) {
        var name = 't' + (this.lowest + i + 1);
        var palette = this.level.tierMap[name].palette;
        this.csquares[name] = [];
        for (var j = 0; j < max; j++) {
            var idx = i * max + j;
            var square = this.game.add.sprite(0, 0, 'meter_shard');
            square.anchor.setTo(0.5);
            square.tint = palette.c1.i;
            square.rotation = (-Math.PI / 6) + idx * (Math.PI / 6);
            square.alpha = TierMeter.BORDER_ALPHA;
            this.csquares[name].push(square);
            this.squarebase.addChild(square);
        }
    }
    this.nowsquares = [];
    this.cloudsquares = [];

    // This is for our active power.
    this.powers = {};
    if (TierMeter.CACHED_BITMAP == undefined) {
        var r = TierMeter.PCIRCLE_RADIUS;
        var lw = TierMeter.PCIRCLE_THICKNESS;
        var d = 2 * (r + lw);
        var bitmap = this.game.add.bitmapData(d, d);
        var c = bitmap.context;
        c.strokeStyle = '#ffffff';
        c.lineWidth = lw;
        c.arc(d / 2, d / 2, r, 0, 2 * Math.PI, false);
        c.stroke();
        TierMeter.CACHED_BITMAP = bitmap;
    }
    this.pcircle = this.game.add.sprite(
        TierMeter.POWER_X, TierMeter.POWER_Y,
        TierMeter.CACHED_BITMAP);
    this.addChild(this.pcircle);
    this.pcircle.anchor.setTo(0.5);
    this.pcircle.alpha = 2 * TierMeter.BORDER_ALPHA;
};

// Clear and redraw ourself.
TierMeter.prototype.recreate = function() {
    this.lowest = this.level.tiers[0].index;
    this.numTiers = this.level.tiers.length;
    this.bitmap.context.clearRect(0, 0,
        this.bitmap.width, this.bitmap.height);
    this.bitmap.dirty = true;
    this.triangle.kill();
    for (var i = 0; i < this.csquares.length; i++) {
        this.csquares[i].kill();
    }
    while (this.children.length) {
        this.removeChild(this.children[0]);
    }
    this.createSelf();
};

// Change the current tier.
TierMeter.prototype.setTier = function(tier, old) {
    this.palette = tier.palette;
    var actualIndex = tier.index;
    var index = actualIndex - this.lowest;

    var apad = TierMeter.APAD;
    var arc = TierMeter.ANGLE * this.numTiers + apad * (this.numTiers - 1);
    var a0 = (arc - Math.PI - TierMeter.ANGLE) / 2;
    var da = index * (TierMeter.ANGLE + apad);
    var t = this.game.add.tween(this.triangle);
    t.to({ rotation: a0 - da }, TierMeter.FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);

    this.spinning = true;
    var rotation = -index * Math.PI / 2;
    var t = this.game.add.tween(this.squarebase);
    t.to({ rotation: rotation }, TierMeter.TRIANGLE_TRAVEL_TIME,
        Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.spinning = false;
    }, this);

    var t0 = this.level.tierMap['t' + (actualIndex - 1)];
    if (t0) {
        var shards = this.shards[tier.name];
        for (var i = 0; i < this.nowsquares.length; i++) {
            this.nowsquares[i].visible = true;
            this.nowsquares[i].tint = tier.palette.c1.i;
        }
        // this.fillUpNow(shards ? shards : 0);
    } else {
        for (var i = 0; i < this.nowsquares.length; i++) {
            this.nowsquares[i].visible = false;
        }
    }
    var t2 = this.level.tierMap['t' + (actualIndex + 1)];
    if (t2) {
        var shards = this.shards[t2.name];
        for (var i = 0; i < this.cloudsquares.length; i++) {
            this.cloudsquares[i].visible = true;
            this.cloudsquares[i].tint = t2.palette.c1.i;
        }
        // this.fillUpCloud(shards ? shards : 0);
    } else {
        for (var i = 0; i < this.cloudsquares.length; i++) {
            this.cloudsquares[i].visible = false;
        }
    }
    var keys = Object.keys(this.powers);
    for (var i = 0; i < keys.length; i++) {
        this.powers[keys[i]].tint = tier.palette.c1.i;
    }
    this.pcircle.tint = tier.palette.c1.i;

    this.showBriefly();
};

// Update anytime the settings change.
TierMeter.prototype.fillUpNow = function(shards) {
    shards = Math.min(shards, TierMeter.CLOUD_MAX);
    for (var i = 0; i < TierMeter.CLOUD_MAX; i++) {
        var square = this.nowsquares[i];
        square.alpha = i < shards ? 1 : TierMeter.BORDER_ALPHA;
    }
};

// Update anytime the settings change.
TierMeter.prototype.fillUpCloud = function(shards) {
    shards = Math.min(shards, TierMeter.CLOUD_MAX);
    for (var i = 0; i < TierMeter.CLOUD_MAX; i++) {
        var square = this.cloudsquares[i];
        square.alpha = i < shards ? 1 : TierMeter.BORDER_ALPHA;
    }
};

// Update loop.
TierMeter.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    if (this.spinning) {
        this.updateShardAlphas();
    }
};

// Fade the shard indicators based on their rotation.
TierMeter.prototype.updateShardAlphas = function() {
    var keys = Object.keys(this.csquares);
    for (var i = 0; i < keys.length; i++) {
        var squares = this.csquares[keys[i]];
        var shards = this.shards[keys[i]];
        shards = shards ? shards : 0;
        for (var j = 0; j < squares.length; j++) {
            var square = squares[j];
            var rotation = square.rotation +
                square.parent.rotation;
            rotation -= Math.PI / 6;
            var desired = j < shards ? 1 : TierMeter.BORDER_ALPHA;
            var ratio = 0;
            if (0 >= rotation && rotation >= -5 * Math.PI / 6) {
                ratio = 1;
            } else if (rotation >= Math.PI / 6 ||
                rotation <= -Math.PI) {
                ratio = 0;
            } else {
                if (rotation < 0) {
                    rotation = Math.PI + rotation;
                    ratio = rotation / (Math.PI / 6);
                } else {
                    ratio = 1 - rotation / (Math.PI / 6);
                }
            }
            square.alpha = ratio * desired;
        }
    }
};

// Update anytime the settings change.
TierMeter.prototype.updateSettings = function(settings) {
    var old = this.hud;
    this.hud = settings.hud;
    if (this.hud == Settings.HUD_SOMETIMES && settings.edit) {
        this.hud = Settings.HUD_ALWAYS;
    }
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

// Briefly display ourselves.
// Only fires if we're displayable and not already showing.
TierMeter.prototype.showBriefly = function() {
    if (!this.lit && this.hud == Settings.HUD_SOMETIMES) {
        this.alpha = 1;
        this.fade(false);
    }
};

// Add a shard for the next tier up.
TierMeter.prototype.addShard = function() {
    this.showBriefly();
    var currentIndex = this.level.tier.index;
    var actualIndex = 1 + currentIndex;
    if (actualIndex == this.numTiers) {
        return;
    }
    var tier = this.level.tierMap['t' + actualIndex];
    var shards = this.shards[tier.name] ? this.shards[tier.name] : 0;
    shards += 1;
    this.shards[tier.name] = shards;
    var index = (this.numTiers - 1) - (actualIndex - this.lowest);

    var i = (shards > TierMeter.CLOUD_MAX ?
        TierMeter.CLOUD_MAX : shards) - 1;
    var r = TierMeter.BURST_R;
    var square = this.csquares[tier.name][i];
    var a = Math.PI - (square.rotation + square.parent.rotation);
    var x = r * Math.sin(a);
    var y = r * Math.cos(a);
    this.ckbPool.make(this.game).burst(
        x, y, this, tier.palette.c1.i);
    if (!this.spinning) {
        square.alpha = 1;
    }
    this.avatar.events.onShardChange.dispatch(
        tier, this.shards[tier.name]);
};

// Subtract a shard for the current tier.
TierMeter.prototype.useShard = function() {
    this.showBriefly();
    var currentIndex = this.level.tier.index;
    var tier = this.level.tierMap['t' + currentIndex];
    var shards = this.shards[tier.name] ? this.shards[tier.name] : 0;
    if (shards <= 0) {
        return;
    }
    var i = (shards > TierMeter.CLOUD_MAX ?
        TierMeter.CLOUD_MAX : shards) - 1;
    var square = this.csquares[tier.name][i];
    if (!this.spinning) {
        square.alpha = TierMeter.BORDER_ALPHA;
    }
    shards -= 1;
    this.shards[tier.name] = shards;
    this.ksbPool.make(this.game).burst(0, 0, this);
    this.avatar.events.onShardChange.dispatch(
        tier, this.shards[tier.name]);
};

// Set our current power.
TierMeter.prototype.setPower = function(power) {
    if (this.powerIcon) {
        this.powerIcon.visible = false;
    }
    if (!power) {
        this.powerIcon = undefined;
        return;
    }
    if (!this.powers[power.type]) {
        this.powerIcon = this.game.add.sprite(
            TierMeter.POWER_X, TierMeter.POWER_Y,
            'power_icon_' + power.type);
        this.powerIcon.anchor.setTo(0.5);
        this.powerIcon.scale.setTo(0.8);
        if (this.palette) {
            this.powerIcon.tint = this.palette.c1.i;
        }
        this.powers[power.type] = this.powerIcon;
        this.addChild(this.powerIcon);
    } else {
        this.powerIcon = this.powers[power.type];
        this.powerIcon.visible = true;
    }
};

// Animate the power icon.
TierMeter.prototype.setPowerPressed = function(pressed) {
    if (this.pressed == pressed) {
        return;
    }
    this.pressed = pressed;
    this.powerIcon.scale.setTo(pressed ? 0.7 : 0.8);
    this.showBriefly();
};

// Animate the power icon.
TierMeter.prototype.usePower = function() {
    this.ksbPool.make(this.game).burst(0, 0, this);
    this.setPowerPressed(false);
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
