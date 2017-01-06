// Small blip for when we gain a shard in the cloud.
// Note: the "cloud" is the little area in the tier meter
// which displays the shards you've got for the *next* tier up
// from your current tier. It's called the cloud because it 
// floats *above* the primary shard display (which tracks shards 
// for your current tier). Make sense?
var CloudShardBurst = function(game) {
    Phaser.Sprite.call(this, game, 0, 0, 'smoke');
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

CloudShardBurst.prototype = Object.create(Phaser.Sprite.prototype);
CloudShardBurst.prototype.constructor = CloudShardBurst;

// Constants.
CloudShardBurst.DURATION = 400; // ms
CloudShardBurst.Y_HOP = 7;
CloudShardBurst.Y_HOPSCALE = 1.4;
CloudShardBurst.SCALE1 = 1.5;
CloudShardBurst.SCALE2 = 0.2;


// Shard-added flash.
CloudShardBurst.prototype.burst = function(x, y, parent, tint) {
    parent.addChild(this);
    this.x = x;
    this.y = y + CloudShardBurst.Y_HOP;
    this.tint = tint;
    this.visible = true;
    this.scale.setTo(CloudShardBurst.SCALE1);
    var scaled = CloudShardBurst.Y_HOP / CloudShardBurst.Y_HOPSCALE;

    var time = CloudShardBurst.DURATION;
    var t = this.game.add.tween(this);
    t.to({ y: y - scaled },
        time / 2, Phaser.Easing.Quartic.Out, true);
    var t2 = this.game.add.tween(this);
    t2.to({ y: y + scaled },
        time / 2, Phaser.Easing.Quartic.In);
    t.chain(t2);
    var t3 = this.game.add.tween(this.scale);
    t3.to({ x: CloudShardBurst.SCALE2, y: CloudShardBurst.SCALE2 },
        time, Phaser.Easing.Quadratic.In, true);
    t3.onComplete.add(function() {
        this.kill();
    }, this);
};







// Small burst to indicate that we spent a shard.
var ShardSpendBurst = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        ShardSpendBurst.painter);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

ShardSpendBurst.prototype = Object.create(Phaser.Sprite.prototype);
ShardSpendBurst.prototype.constructor = ShardSpendBurst;

// Constants.
ShardSpendBurst.RADIUS = 50;
ShardSpendBurst.PATH_WIDTH = 12;
ShardSpendBurst.DURATION = 400; // ms
ShardSpendBurst.SCALE1 = 0.1;
ShardSpendBurst.SCALE2 = 1.25;


// Paint our bitmap.
ShardSpendBurst.painter = function(bitmap) {
    var r = ShardSpendBurst.RADIUS;
    Utils.resizeBitmap(bitmap, 3 * r, 3 * r);
    var c = bitmap.context;
    c.strokeStyle = bitmap.game.settings.colors.WHITE.s;
    c.lineWidth = ShardSpendBurst.PATH_WIDTH;
    c.beginPath();
    c.arc(r * 1.5, r * 1.5, r, 0, 2 * Math.PI, false);
    c.stroke();
};

// Shard-spent flash.
ShardSpendBurst.prototype.burst = function(x, y, parent) {
    parent.addChild(this);
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.visible = true;

    this.scale.setTo(ShardSpendBurst.SCALE1);

    var time = ShardSpendBurst.DURATION;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 },
        time, Phaser.Easing.Cubic.In, true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: ShardSpendBurst.SCALE2, y: ShardSpendBurst.SCALE2 },
        time, Phaser.Easing.Sinusoidal.Out, true);
    t2.onComplete.add(function() {
        this.kill();
    }, this);
};
