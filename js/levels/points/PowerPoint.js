// A point that has a power-up icon.
var PowerPoint = function(name, x, y, powerType) {
    Point.call(this, name, x, y);
    this.powerType = powerType;
    this.power = undefined;
};

PowerPoint.TYPE = 'power';
PowerPoint.prototype = Object.create(Point.prototype);
PowerPoint.prototype.constructor = PowerPoint;

// Set up our factory.
Point.load.factory[PowerPoint.TYPE] = PowerPoint;

// During our first draw, we create the actual power.
PowerPoint.prototype.draw = function(tier) {
    if (!(this.power)) {
        var game = tier.game;
        this.power = new Power(game,
            this.x, this.y, this.powerType);
        game.state.getCurrentState().z.fg.add(this.power);
    }
    Point.prototype.draw.call(this, tier);
};

// JSON conversion of a portal.
PowerPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = PowerPoint.TYPE;
    result.direction = this.direction;
    return result;
};

// Load a JSON representation of a portal.
PowerPoint.load = function(game, name, json) {
    return new PowerPoint(name, json.x, json.y, json.subtype);
};
