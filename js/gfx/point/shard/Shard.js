// A floating shard.
var Shard = function(game, x, y, palette) {
    var dy = Shard.HOVER_HEIGHT;
    Phaser.Sprite.call(this, game, x, y - dy);
    this.anchor.setTo(0.5);

    // Our (x,y) get shifted when the tier redraws.
    // But we're tweening our y, which means the tween gets off base.
    // Instead, create a child whose local offset from us is 
    // (0,0), and then tween its height, so that the gfx 
    // sprites attached to it move correctly.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);

    if (Shard.CACHED_BITMAP == undefined) {
        var r = Shard.RADIUS;
        r *= Shard.FIX;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.fillStyle = game.settings.colors.WHITE.s;
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        Shard.CACHED_BITMAP = bitmap;
    }
    this.glow = this.gobetween.addChild(
        this.game.add.sprite(0, 0, Shard.CACHED_BITMAP));
    this.glow.scale.setTo(1 / Shard.FIX);
    this.glow.anchor.setTo(0.5);

    this.shard = this.gobetween.addChild(
        this.game.add.sprite(0, 0, 'keyplate'));
    this.shard.anchor.setTo(0.5);
    this.shard.tint = palette.c1.i;
    this.shard.scale.setTo(Shard.SCALE);

    this.tweens = [];
    var t = this.game.add.tween(this.gobetween);
    t.to({ y: Shard.HOVER_DRIFT }, Shard.HOVER_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
    var scale = Shard.GLOW_SCALE / Shard.FIX;
    t = this.game.add.tween(this.glow.scale);
    t.to({ x: scale, y: scale }, Shard.GLOW_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);

    this.pickedUp = false;
};

Shard.prototype = Object.create(Phaser.Sprite.prototype);
Shard.prototype.constructor = Shard;

// Constants.
Shard.RADIUS = 14;
Shard.SCALE = 0.3;
Shard.HOVER_TIME = 2000; // ms
Shard.HOVER_HEIGHT = 50;
Shard.HOVER_DRIFT = 15;
Shard.GLOW_SCALE = 1.25;
Shard.GLOW_TIME = 873; // ms
Shard.BURST_SCALE = 8;
// Upscale by FIX to start,  so that
// we're less blurry when burst-scaled.
Shard.FIX = 2;
Shard.BURST_DURATION = 500;


// Set our colors.
Shard.prototype.updatePalette = function(palette) {
    this.shard.tint = palette.c1.i;
};

// Pause or unpause the shard's hovering.
Shard.prototype.setPaused = function(paused) {
    if (this.pickedUp) {
        return;
    }
    for (var i = 0; i < this.tweens; i++) {
        var tween = this.tweens[i];
        paused ? tween.pause() : tween.resume();
    }
};

// Called when the shard is picked up.
Shard.prototype.pickUp = function() {
    if (this.pickedUp) {
        return;
    }
    this.pickedUp = true;
    var t = this.game.add.tween(this.shard);
    t.to({ alpha: 0 },
        Shard.BURST_DURATION, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this.glow.scale);
    var scale = Shard.BURST_SCALE / Shard.FIX;
    t2.to({ x: scale, y: scale },
        Shard.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    var t3 = this.game.add.tween(this.glow);
    t3.to({ alpha: 0 },
        Shard.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    t3.onComplete.add(function() {
        this.kill();
        for (var i = 0; i < this.tweens; i++) {
            this.tweens[i].stop();
        }
    }, this);
};
