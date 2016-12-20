// A floating key.
var TKey = function(game, x, y, palette) {
    var dy = TKey.HOVER_HEIGHT;
    Phaser.Sprite.call(this, game, x, y - dy);
    this.anchor.setTo(0.5);

    // Our (x,y) get shifted when the tier redraws.
    // But we're tweening our y, which means the tween gets off base.
    // Instead, create a child whose local offset from us is 
    // (0,0), and then tween its height, so that the gfx 
    // sprites attached to it move correctly.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);

    if (TKey.CACHED_BITMAP == undefined) {
        var r = TKey.RADIUS;
        r *= TKey.FIX;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.fillStyle = game.settings.colors.WHITE.s;
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        TKey.CACHED_BITMAP = bitmap;
    }
    this.glow = this.gobetween.addChild(
        this.game.add.sprite(0, 0, TKey.CACHED_BITMAP));
    this.glow.scale.setTo(1 / TKey.FIX);
    this.glow.anchor.setTo(0.5);

    this.tkey = this.gobetween.addChild(
        this.game.add.sprite(0, 0, 'keyplate'));
    this.tkey.anchor.setTo(0.5);
    this.tkey.tint = palette.c1.i;
    this.tkey.scale.setTo(TKey.SCALE);

    this.tweens = [];
    var t = this.game.add.tween(this.gobetween);
    t.to({ y: TKey.HOVER_DRIFT }, TKey.HOVER_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
    var scale = TKey.GLOW_SCALE / TKey.FIX;
    t = this.game.add.tween(this.glow.scale);
    t.to({ x: scale, y: scale }, TKey.GLOW_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);

    this.pickedUp = false;
};

TKey.prototype = Object.create(Phaser.Sprite.prototype);
TKey.prototype.constructor = TKey;

// Constants.
TKey.RADIUS = 14;
TKey.SCALE = 0.3;
TKey.HOVER_TIME = 2000; // ms
TKey.HOVER_HEIGHT = 50;
TKey.HOVER_DRIFT = 15;
TKey.GLOW_SCALE = 1.25;
TKey.GLOW_TIME = 873; // ms
TKey.BURST_SCALE = 8;
// Upscale by FIX to start,  so that
// we're less blurry when burst-scaled.
TKey.FIX = 2;
TKey.BURST_DURATION = 500;

// Pause or unpause the key's hovering.
TKey.prototype.setPaused = function(paused) {
    if (this.pickedUp) {
        return;
    }
    for (var i = 0; i < this.tweens; i++) {
        var tween = this.tweens[i];
        paused ? tween.pause() : tween.resume();
    }
};

// Called when the key is picked up.
TKey.prototype.pickUp = function() {
    if (this.pickedUp) {
        return;
    }
    this.pickedUp = true;
    var t = this.game.add.tween(this.tkey);
    t.to({ alpha: 0 },
        TKey.BURST_DURATION, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this.glow.scale);
    var scale = TKey.BURST_SCALE / TKey.FIX;
    t2.to({ x: scale, y: scale },
        TKey.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    var t3 = this.game.add.tween(this.glow);
    t3.to({ alpha: 0 },
        TKey.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    t3.onComplete.add(function() {
        this.kill();
        for (var i = 0; i < this.tweens; i++) {
            this.tweens[i].stop();
        }
    }, this);
};
