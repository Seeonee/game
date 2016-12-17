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
var CloudKeyBurst = function(game) {
    var w = CloudKeyBurst.W;
    var h = w;
    var bitmap = game.add.bitmapData(w, h);
    var c = bitmap.context;
    c.fillStyle = game.settings.colors.WHITE.s;
    c.fillRect(0, 0, w, h);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
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
