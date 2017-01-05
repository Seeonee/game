// A floating shard.
var ShardSprite = function(game, x, y, palette) {
    var dy = ShardSprite.HOVER_HEIGHT;
    Phaser.Sprite.call(this, game, x, y - dy);
    this.anchor.setTo(0.5);

    // Our (x,y) get shifted when the tier redraws.
    // But we're tweening our y, which means the tween gets off base.
    // Instead, create a child whose local offset from us is 
    // (0,0), and then tween its height, so that the gfx 
    // sprites attached to it move correctly.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);

    var bitmap = this.game.bitmapCache.get(
        ShardSprite.prototype.painter, this);
    this.glow = this.gobetween.addChild(
        this.game.add.sprite(0, 0, bitmap));
    this.glow.scale.setTo(1 / ShardSprite.FIX);
    this.glow.anchor.setTo(0.5);

    this.shard = this.gobetween.addChild(
        this.game.add.sprite(0, 0, 'keyplate'));
    this.shard.anchor.setTo(0.5);
    this.shard.tint = palette.c1.i;
    this.shard.scale.setTo(ShardSprite.SCALE);

    this.tweens = [];
    var t = this.game.add.tween(this.gobetween);
    t.to({ y: ShardSprite.HOVER_DRIFT }, ShardSprite.HOVER_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
    var scale = ShardSprite.GLOW_SCALE / ShardSprite.FIX;
    t = this.game.add.tween(this.glow.scale);
    t.to({ x: scale, y: scale }, ShardSprite.GLOW_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);

    this.pickedUp = false;
};

ShardSprite.prototype = Object.create(Phaser.Sprite.prototype);
ShardSprite.prototype.constructor = ShardSprite;

// Constants.
ShardSprite.RADIUS = 14;
ShardSprite.SCALE = 0.3;
ShardSprite.HOVER_TIME = 2000; // ms
ShardSprite.HOVER_HEIGHT = 50;
ShardSprite.HOVER_DRIFT = 15;
ShardSprite.GLOW_SCALE = 1.25;
ShardSprite.GLOW_TIME = 873; // ms
ShardSprite.BURST_SCALE = 8;
// Upscale by FIX to start,  so that
// we're less blurry when burst-scaled.
ShardSprite.FIX = 2;
ShardSprite.BURST_DURATION = 500;


// Paint our bitmap.
ShardSprite.prototype.painter = function(bitmap) {
    var r = ShardSprite.RADIUS;
    r *= ShardSprite.FIX;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = game.settings.colors.WHITE.s;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Set our colors.
ShardSprite.prototype.updatePalette = function(palette) {
    this.shard.tint = palette.c1.i;
};

// Pause or unpause the shard's hovering.
ShardSprite.prototype.setPaused = function(paused) {
    if (this.pickedUp) {
        return;
    }
    for (var i = 0; i < this.tweens; i++) {
        var tween = this.tweens[i];
        paused ? tween.pause() : tween.resume();
    }
};

// Called when the shard is picked up.
ShardSprite.prototype.pickUp = function() {
    if (this.pickedUp) {
        return;
    }
    this.pickedUp = true;
    var t = this.game.add.tween(this.shard);
    t.to({ alpha: 0 },
        ShardSprite.BURST_DURATION, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this.glow.scale);
    var scale = ShardSprite.BURST_SCALE / ShardSprite.FIX;
    t2.to({ x: scale, y: scale },
        ShardSprite.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    var t3 = this.game.add.tween(this.glow);
    t3.to({ alpha: 0 },
        ShardSprite.BURST_DURATION, Phaser.Easing.Cubic.Out, true);
    t3.onComplete.add(function() {
        this.kill();
        for (var i = 0; i < this.tweens; i++) {
            this.tweens[i].stop();
        }
    }, this);
};
