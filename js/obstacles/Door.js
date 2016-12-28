// A door that requires a key to pass through.
var Door = function(game, x, y, palette) {
    this.game = game;
    var d = Door.D;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = palette.c2.s;
    c.fillRect(0, 0, d, d);
    Obstacle.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5);
    this.rotation = Math.PI / 4;

    // More decals.
    var d = Door.D2;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = palette.c1.s;
    c.fillRect(0, 0, d, d);
    this.inner = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.inner.anchor.setTo(0.5);

    // And our icon!
    this.icon = this.addChild(this.game.add.sprite(0, 0, 'key_icon'));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);
    this.icon.rotation = -Math.PI / 4;
};

Door.prototype = Object.create(Obstacle.prototype);
Door.prototype.constructor = Door;

// Constants.
Door.D = 30;
Door.D2 = 24;
Door.UNLOCK_TIME = 500; // ms
Door.UNLOCK_SCALE = 2;


// Call to destruct!
Door.prototype.unlock = function() {
    this.removeCollision();
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, Door.UNLOCK_TIME, Phaser.Easing.Cubic.Out,
        true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: Door.UNLOCK_SCALE, y: Door.UNLOCK_SCALE },
        Door.UNLOCK_TIME, Phaser.Easing.Cubic.Out, true);
    t2.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
};

// Update loop.
Door.prototype.update = function() {
    this.game.debug.body(this);
    this.game.debug.spriteCoords(this);
};

// Debug code.
Door.prototype.obstruct = function(avatar) {
    // Cheat and look for keys for the next tier up.
    // I.e. keys we've picked up on this tier.
    if (avatar.held == DoorKey.TYPE) {
        avatar.held == undefined;
        this.unlock();
        return false;
    }
    return true;
};







// Key for passing through a door.
var DoorKey = function(game, x, y, palette) {
    Obstacle.call(this, game, x, y);
    this.anchor.setTo(0.5);
    // And our icon!
    this.icon = this.addChild(this.game.add.sprite(0, 0, 'key_icon'));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);
    this.icon.tint = palette.c2.i;
    this.icon.y -= DoorKey.HEIGHT;
};

DoorKey.TYPE = 'key';
DoorKey.prototype = Object.create(Obstacle.prototype);
DoorKey.prototype.constructor = DoorKey;

// Constants.
DoorKey.HEIGHT = 30;
DoorKey.PICKUP_TIME = 500; // ms


// Call to destruct!
DoorKey.prototype.pickUp = function() {
    this.removeCollision();
    var t = this.game.add.tween(this.scale);
    t.to({ x: 0, y: 0 },
        DoorKey.UNLOCK_TIME, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
};

// Update loop.
DoorKey.prototype.update = function() {
    this.game.debug.body(this);
    this.game.debug.spriteCoords(this);
};

// Debug code.
DoorKey.prototype.obstruct = function(avatar) {
    if (!avatar.held) {
        avatar.held = DoorKey.TYPE;
        this.pickUp();
    }
    return false;
};
