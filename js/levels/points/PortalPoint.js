// A point that allows transitioning to other tiers.
var PortalPoint = function(name, x, y, direction) {
    Point.call(this, name, x, y);
    this.direction = direction;
};

PortalPoint.TYPE = 'portal';
PortalPoint.prototype = Object.create(Point.prototype);
PortalPoint.prototype.constructor = PortalPoint;

// Set up our factory.
Point.load.factory[PortalPoint.TYPE] = PortalPoint;

// JSON conversion of a portal.
PortalPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = PortalPoint.TYPE;
    result.direction = this.direction;
    return result;
};

// Load a JSON representation of a portal.
PortalPoint.load = function(game, name, json) {
    return new PortalPoint(name, json.x, json.y, json.direction);
};
