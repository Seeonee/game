// A point that has a power-up icon.
var PowerPoint = function(name, x, y, powerType,
    rotation) {
    Point.call(this, name, x, y);
    this.powerType = powerType;
    this.power = undefined;
    this.rotation = rotation;
    this.istateName = PowerIState.NAME;
    this.enabled = false;
};

PowerPoint.TYPE = 'power';
PowerPoint.prototype = Object.create(Point.prototype);
PowerPoint.prototype.constructor = PowerPoint;

// Set up our factory.
Point.load.factory[PowerPoint.TYPE] = PowerPoint;

// During our first draw, we create the actual power.
PowerPoint.prototype.draw = function(tier) {
    if (!this.power) {
        var game = tier.game;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.power = new PowerSprite(game, ap.x, ap.y,
            this.powerType, tier.palette);
        var rotation = this.rotation;
        if (rotation == undefined) {
            // TODO: Figure out if we overlap with a path.
            // If so, calculate a best alternative angle.
        } else {
            rotation *= Math.PI;
        }
        this.power.setRotation(rotation);
        tier.image.addChild(this.power);
        this.power.setEnabled(this.enabled);
        tier.level.avatar.events.onShardChange.add(
            this.shardsChanged, this);
    } else {
        this.power.updatePalette(tier.palette);
    }
    Point.prototype.draw.call(this, tier);
};

// Set our enabled state.
PowerPoint.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    Point.prototype.setEnabled.call(this, enabled);
    if (!this.purchased && this.power) {
        this.power.setEnabled(this.enabled);
    }
};

// Light up the power.
PowerPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (!this.purchased) {
        this.power.select();
    }
};

// Lights out for the power.
PowerPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    if (!this.purchased) {
        this.power.deselect();
    }
};

// Light up the power.
PowerPoint.prototype.shardsChanged = function(tier, shards) {
    if (tier == this.tier) {
        this.setEnabled(shards > 0);
    }
};

// Light up the power.
PowerPoint.prototype.purchase = function(level) {
    this.purchased = true;
    this.setEnabled(false);
    this.power.purchase();
    level.avatar.setPower(this.powerType);
};

// Delete our power.
PowerPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    Utils.destroy(this.power);
    this.tier.level.avatar.events.onShardChange.remove(
        this.shardsChanged, this);
};

// Editor details.
PowerPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'power (' + this.powerType + ')';
};

// JSON conversion of a portal.
PowerPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    delete result.enabled;
    result.type = PowerPoint.TYPE;
    result.subtype = this.powerType;
    result.direction = this.direction;
    if (this.rotation) {
        result.rotation = this.rotation;
    }
    return result;
};

// Load a JSON representation of a portal.
// If rotation is defined, it should be a coefficient 
// that can be multiplied by Math.PI to produce an angle.
PowerPoint.load = function(game, name, json) {
    return new PowerPoint(name, json.x, json.y,
        json.subtype, json.rotation);
};
