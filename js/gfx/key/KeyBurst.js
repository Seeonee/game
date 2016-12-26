// Triangular burst for when keys swap between 
// the regular tracker and the "cloud" tracker.
var KeyBurst = function(game) {
    Phaser.Sprite.call(this, game, 0, 0, 'smoke');
    this.anchor.setTo(0.5, 1);
    this.visible = false;
};

KeyBurst.prototype = Object.create(Phaser.Sprite.prototype);
KeyBurst.prototype.constructor = KeyBurst;

// Constants.
KeyBurst.DURATION = 400; // ms
KeyBurst.DISTANCE = 40;
KeyBurst.DY_RATIO1 = 0.6;
KeyBurst.DY_RATIO2 = 0.85;
KeyBurst.SCALE1 = 2;
KeyBurst.SCALE2 = 0.25;


// Key transition flash.
KeyBurst.prototype.burst = function(x, y, parent, tint, up) {
    parent.addChild(this);
    this.x = x;
    var dy = up ? -KeyBurst.DISTANCE : KeyBurst.DISTANCE;
    this.y = y - dy * KeyBurst.DY_RATIO1;
    this.rotation = up ? 0 : Math.PI;
    this.tint = tint;
    this.visible = true;
    this.scale.setTo(KeyBurst.SCALE1);

    var time = KeyBurst.DURATION;
    var t = this.game.add.tween(this);
    t.to({ y: this.y + dy * KeyBurst.DY_RATIO2 },
        time, Phaser.Easing.Quadratic.Out, true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: KeyBurst.SCALE2, y: KeyBurst.SCALE2 },
        time, Phaser.Easing.Quadratic.In, true);
    t2.onComplete.add(function() {
        this.kill();
    }, this);
};

// Small blip for when we gain a key in the cloud.
// Note: the "cloud" is the little area in the tier meter
// which displays the keys you've got for the *next* tier up
// from your current tier. It's called the cloud because it 
// floats *above* the primary key display (which tracks keys 
// for your current tier). Make sense?
var CloudKeyBurst = function(game) {
    this.game = game;
    if (CloudKeyBurst.CACHED_BITMAP == undefined) {
        var w = CloudKeyBurst.W;
        var h = w;
        var bitmap = this.game.add.bitmapData(w, h);
        var c = bitmap.context;
        c.fillStyle = game.settings.colors.WHITE.s;
        c.fillRect(0, 0, w, h);
        CloudKeyBurst.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, 0, 0, CloudKeyBurst.CACHED_BITMAP);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

CloudKeyBurst.prototype = Object.create(Phaser.Sprite.prototype);
CloudKeyBurst.prototype.constructor = CloudKeyBurst;

// Constants.
CloudKeyBurst.W = 40;
CloudKeyBurst.DURATION = 400; // ms
CloudKeyBurst.Y_HOP = 16;
CloudKeyBurst.Y_HOPSCALE = 1.4;
CloudKeyBurst.SCALE1 = 1;
CloudKeyBurst.SCALE2 = 0.2;


// Key-added flash.
CloudKeyBurst.prototype.burst = function(x, y, parent, tint) {
    parent.addChild(this);
    this.x = x;
    this.y = y + CloudKeyBurst.Y_HOP / 2;
    this.tint = tint;
    this.visible = true;
    this.scale.setTo(CloudKeyBurst.SCALE1);
    var scaled = CloudKeyBurst.Y_HOP / CloudKeyBurst.Y_HOPSCALE;

    var time = CloudKeyBurst.DURATION;
    var t = this.game.add.tween(this);
    t.to({ y: y - scaled },
        time / 2, Phaser.Easing.Quartic.Out, true);
    var t2 = this.game.add.tween(this);
    t2.to({ y: y + scaled },
        time / 2, Phaser.Easing.Quartic.In);
    t.chain(t2);
    var t3 = this.game.add.tween(this.scale);
    t3.to({ x: CloudKeyBurst.SCALE2, y: CloudKeyBurst.SCALE2 },
        time, Phaser.Easing.Quadratic.In, true);
    t3.onComplete.add(function() {
        this.kill();
    }, this);
};







// Small burst to indicate that we spent a key.
var KeySpendBurst = function(game) {
    this.game = game;
    if (KeySpendBurst.CACHED_BITMAP == undefined) {
        var r = KeySpendBurst.RADIUS;
        var bitmap = this.game.add.bitmapData(3 * r, 3 * r);
        var c = bitmap.context;
        c.strokeStyle = game.settings.colors.WHITE.s;
        c.lineWidth = KeySpendBurst.PATH_WIDTH;
        c.beginPath();
        c.arc(r * 1.5, r * 1.5, r, 0, 2 * Math.PI, false);
        c.stroke();
        KeySpendBurst.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, 0, 0, KeySpendBurst.CACHED_BITMAP);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

KeySpendBurst.prototype = Object.create(Phaser.Sprite.prototype);
KeySpendBurst.prototype.constructor = KeySpendBurst;

// Constants.
KeySpendBurst.RADIUS = 50;
KeySpendBurst.PATH_WIDTH = 12;
KeySpendBurst.DURATION = 400; // ms
KeySpendBurst.SCALE1 = 0.1;
KeySpendBurst.SCALE2 = 1.25;


// Key-spent flash.
KeySpendBurst.prototype.burst = function(x, y, parent) {
    parent.addChild(this);
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.visible = true;

    this.scale.setTo(KeySpendBurst.SCALE1);

    var time = KeySpendBurst.DURATION;
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 },
        time, Phaser.Easing.Cubic.In, true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: KeySpendBurst.SCALE2, y: KeySpendBurst.SCALE2 },
        time, Phaser.Easing.Sinusoidal.Out, true);
    t2.onComplete.add(function() {
        this.kill();
    }, this);
};
