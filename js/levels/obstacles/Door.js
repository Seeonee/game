// A door that requires a key to pass through.
var DoorSprite = function(game, x, y, palette) {
    this.game = game;
    var d = DoorSprite.D;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.fillRect(0, 0, d, d);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5);
    this.rotation = Math.PI / 4;

    // More decals.
    var d = DoorSprite.D2;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.fillRect(0, 0, d, d);
    this.inner = this.addChild(this.game.add.sprite(0, 0, bitmap));
    this.inner.anchor.setTo(0.5);

    // And our icon!
    this.icon = this.addChild(this.game.add.sprite(0, 0, 'item_key'));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);
    this.icon.rotation = -Math.PI / 4;

    this.setPalette(palette);
};

DoorSprite.prototype = Object.create(Phaser.Sprite.prototype);
DoorSprite.prototype.constructor = DoorSprite;

// Constants.
DoorSprite.D = 30;
DoorSprite.D2 = 24;
DoorSprite.UNLOCK_TIME = 500; // ms
DoorSprite.UNLOCK_SCALE = 2;


// Update colors.
DoorSprite.prototype.setPalette = function(palette) {
    this.tint = palette.c2.i;
    this.inner.tint = palette.c1.i;
};

// Call to destruct!
DoorSprite.prototype.unlock = function() {
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, DoorSprite.UNLOCK_TIME, Phaser.Easing.Cubic.Out,
        true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: DoorSprite.UNLOCK_SCALE, y: DoorSprite.UNLOCK_SCALE },
        DoorSprite.UNLOCK_TIME, Phaser.Easing.Cubic.Out, true);
    t2.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
};







// Door object.
var Door = function(game, name, x, y, type) {
    Obstacle.call(this, game, name, x, y, type);
};

Door.TYPE = 'door';
Door.prototype = Object.create(Obstacle.prototype);
Door.prototype.constructor = Door;

// Set up our factory.
Obstacle.load.factory[Door.TYPE] = Door;


// Draw loop.
Door.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y, Door.D);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.door = new DoorSprite(this.game, ap.x, ap.y, tier.palette);
        tier.image.addChild(this.door);
    } else {
        this.door.setPalette(tier.palette);
    }
};

// Debug code.
Door.prototype.obstruct = function(avatar) {
    // Cheat and look for keys for the next tier up.
    // I.e. keys we've picked up on this tier.
    if (avatar.held && avatar.held.subtype == 'key') {
        avatar.held.useUp();
        this.hitbox.removeCollision();
        this.hitbox = undefined;
        this.door.unlock();
        return false;
    }
    return true;
};

// Delete ourself.
Door.prototype.delete = function() {
    if (this.door) {
        Utils.destroy(this.door);
        this.door = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
};

// Write our JSON conversion.
Door.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    return result;
};

// Load our JSON representation.
Door.load = function(game, name, json) {
    return new Door(game, name, json.x, json.y,
        json.type);
};
