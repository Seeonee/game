// A door that requires a key to pass through.
var Door = function(game, x, y, palette) {
    this.game = game;
    var d = Door.D;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = palette.c2.s;
    c.fillRect(0, 0, d, d);
    ObstacleSprite.call(this, game, x, y, bitmap);
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

Door.Type = 'door';
Door.prototype = Object.create(ObstacleSprite.prototype);
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







// Door wrapper.
var DoorWrapper = function(game, x, y, type) {
    Obstacle.call(this, game, x, y, type);
};

DoorWrapper.prototype = Object.create(Obstacle.prototype);
DoorWrapper.prototype.constructor = DoorWrapper;

// Set up our factory.
Obstacle.load.factory[Door.TYPE] = DoorWrapper;


// Draw loop.
DoorWrapper.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.door = new Door(this.game, ip.x, ip.y, tier.palette);
        tier.image.addChild(this.door);
    }
};

// Delete ourself.
DoorWrapper.prototype.delete = function() {
    if (this.door) {
        this.door.removeCollision();
        Utils.destroy(this.door);
        this.door = undefined;
    }
};

// Write our JSON conversion.
DoorWrapper.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    return result;
};

// Load our JSON representation.
DoorWrapper.load = function(game, name, json) {
    return new DoorWrapper(game, name, json.x, json.y,
        json.type);
};










// Key for passing through a door.
var DoorKey = function(game, x, y, palette) {
    ObstacleSprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    // And our icon!
    this.icon = this.addChild(this.game.add.sprite(0, 0, 'key_icon'));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);
    this.icon.tint = palette.c2.i;
    this.icon.y -= DoorKey.HEIGHT;
};

DoorKey.TYPE = 'key';
DoorKey.prototype = Object.create(ObstacleSprite.prototype);
DoorKey.prototype.constructor = DoorKey;

// Constants.
DoorKey.HEIGHT = 30;
DoorKey.PICKUP_TIME = 500; // ms


// Call to destruct!
DoorKey.prototype.pickUp = function() {
    this.removeCollision();
    var t = this.game.add.tween(this.icon.scale);
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







// Door key wrapper.
var DoorKeyWrapper = function(game, x, y, type) {
    Obstacle.call(this, game, x, y, type);
};

DoorKeyWrapper.prototype = Object.create(Obstacle.prototype);
DoorKeyWrapper.prototype.constructor = DoorKeyWrapper;

// Set up our factory.
Obstacle.load.factory[DoorKey.TYPE] = DoorKeyWrapper;


// Draw loop.
DoorKeyWrapper.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.dkey = new DoorKey(this.game, ip.x, ip.y, tier.palette);
        tier.image.addChild(this.dkey);
    }
};

// Delete ourself.
DoorKeyWrapper.prototype.delete = function() {
    if (this.dkey) {
        this.dkey.removeCollision();
        Utils.destroy(this.dkey);
        this.dkey = undefined;
    }
};

// Write our JSON conversion.
DoorKeyWrapper.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    return result;
};

// Load our JSON representation.
DoorKeyWrapper.load = function(game, name, json) {
    return new DoorKeyWrapper(game, name, json.x, json.y,
        json.type);
};
