// An item that can be picked up and carried.
var CarriedItemSprite = function(game, x, y, name, palette) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);

    // Stealing this hack from Shard.js.
    this.gobetween = this.addChild(this.game.add.sprite(0, 0));
    this.gobetween.anchor.setTo(0.5);

    var r = 15;
    var pad = 3;
    var bitmap = this.game.add.bitmapData(2 * (r + pad), 2 * (r + pad));
    var c = bitmap.context;
    c.translate(pad, pad);
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    c.lineWidth = 1.5;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.stroke();
    this.corona = this.gobetween.addChild(this.game.add.sprite(
        0, 0, bitmap));
    this.corona.anchor.setTo(0.5);
    this.corona.y -= CarriedItemSprite.HOVER_HEIGHT;

    this.icon = this.corona.addChild(this.game.add.sprite(
        0, 0, 'item_' + name));
    this.icon.scale.setTo(0.5);
    this.icon.anchor.setTo(0.5);

    this.setPalette(palette);

    this.tweens = [];
    var t = this.game.add.tween(this.gobetween);
    t.to({ y: CarriedItemSprite.HOVER_DRIFT },
        CarriedItemSprite.HOVER_TIME,
        Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true);
    this.tweens.push(t);
};

CarriedItemSprite.prototype = Object.create(Phaser.Sprite.prototype);
CarriedItemSprite.prototype.constructor = CarriedItemSprite;

// Constants.
CarriedItemSprite.HOVER_TIME = 2000; // ms
CarriedItemSprite.HOVER_HEIGHT = 50;
CarriedItemSprite.CARRY_HEIGHT = 80;
CarriedItemSprite.HOVER_DRIFT = 15;
CarriedItemSprite.USE_TIME = 500; // ms
CarriedItemSprite.PICKUP_TIME = 700; // ms


// Update colors.
CarriedItemSprite.prototype.setPalette = function(palette) {
    this.corona.tint = palette.c2.i;
    // this.icon.tint = palette.c2.i;
};

// Call to transfer ownership.
CarriedItemSprite.prototype.pickUp = function(avatar) {
    var x = this.parent.x + this.x;
    var y = this.parent.y + this.y;
    var dx = x - avatar.x;
    var dy = y - avatar.y;
    avatar.addChild(this);
    this.x = dx;
    this.y = dy;

    var t = this.game.add.tween(this);
    t.to({ x: 0, y: -CarriedItemSprite.CARRY_HEIGHT },
        CarriedItemSprite.PICKUP_TIME,
        Phaser.Easing.Back.InOut, true);
};

// Call to consume the item.
CarriedItemSprite.prototype.useUp = function() {
    var t = this.game.add.tween(this.corona.scale);
    t.to({ x: 0, y: 0 }, CarriedItemSprite.USE_TIME,
        Phaser.Easing.Back.In, true);
    t.onComplete.add(function() {
        Utils.destroy(this);
    }, this);
};







// An item that the avatar can pick up.
var CarriedItem = function(game, name, x, y, type, subtype) {
    Obstacle.call(this, game, name, x, y, type);
    this.subtype = subtype;
};

CarriedItem.TYPE = 'item';
CarriedItem.prototype = Object.create(Obstacle.prototype);
CarriedItem.prototype.constructor = CarriedItem;

// Set up our factory.
Obstacle.load.factory[CarriedItem.TYPE] = CarriedItem;


// Draw loop.
CarriedItem.prototype.draw = function(tier) {
    if (this.renderNeeded) {
        this.renderNeeded = false;
        this.hitbox = new Hitbox(this.game, tier, this,
            this.x, this.y);
        this.game.state.getCurrentState().z.mg.add(this.hitbox);

        var ip = tier.translateGamePointToInternalPoint(
            this.x, this.y);
        var ap = tier.translateInternalPointToAnchorPoint(
            ip.x, ip.y);
        this.citem = new CarriedItemSprite(this.game, ap.x, ap.y,
            this.subtype, tier.palette);
        tier.image.addChild(this.citem);
    } else {
        this.citem.setPalette(tier.palette);
    }
};

// Debug code.
CarriedItem.prototype.obstruct = function(avatar) {
    if (!avatar.held) {
        avatar.held = this;
        this.hitbox.removeCollision();
        this.hitbox = undefined;
        this.citem.pickUp(avatar);
    }
    return false;
};

// Drop/use/extinguish the item.
CarriedItem.prototype.useUp = function() {
    if (this.citem) {
        this.citem.useUp();
        this.citem = undefined;
    }
};

// Delete ourself.
CarriedItem.prototype.delete = function() {
    if (this.citem) {
        Utils.destroy(this.citem);
        this.citem = undefined;
    }
    if (this.hitbox) {
        this.hitbox.removeCollision();
        this.hitbox = undefined;
    }
};

// Write our JSON conversion.
CarriedItem.prototype.toJSON = function() {
    var result = Obstacle.prototype.toJSON.call(this);
    result.subtype = this.subtype;
    return result;
};

// Load our JSON representation.
CarriedItem.load = function(game, name, json) {
    return new CarriedItem(game, name, json.x, json.y,
        json.type, json.subtype);
};
