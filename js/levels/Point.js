// A point is a juncture among one or more paths.
var Point = function(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.paths = [];
};

// Constants.
Point.ANGLE_CATCH = Math.PI / 2.1;
Point.MIN_ANGLE_RATIO = 2;

// Convenient string representation.
Point.prototype.asKey = function() {
    return 'x' + this.x + 'y' + this.y;
};

// Check if we're directly connected to another point.
Point.prototype.isConnectedTo = function(point) {
    for (var i = 0; i < this.paths.length; i++) {
        if (this.paths[i].getCounterpoint(this) === point) {
            return true; // Already connected.
        }
    }
    return false;
};

// Called during the draw walk by our Paths object.
// This gives us a chance to render ourself to the bitmap.
Point.prototype.draw = function(tier) {
    tier.bitmap.context.beginPath();
    tier.bitmap.context.fillStyle = Tier.PATH_COLOR;
    tier.bitmap.context.arc(this.x, this.y,
        Math.floor(Tier.PATH_WIDTH / 2), 0, 2 * Math.PI, false);
    tier.bitmap.context.fill();
}

// Figure out which path is the best option 
// for a particular input angle.
// For now, we'll just pick the path closest to 
// the angle, up to a cutoff.
// Also, if we're reasonably close to two or more paths, 
// choose none of them.
// If we don't find one, return undefined.
Point.prototype.getPath = function(angle) {
    var pathAngles = [{ path: undefined, angle: Number.POSITIVE_INFINITY }];
    for (var i = 0; i < this.paths.length; i++) {
        var path = this.paths[i];
        var point = path.getCounterpoint(this);
        var a2 = Utils.angleBetweenPoints(this.x, this.y, point.x, point.y);
        var difference = Utils.getBoundedAngleDifference(angle, a2);
        if (difference < Point.ANGLE_CATCH) {
            pathAngles.push({ path: path, angle: difference });
        }
    }
    if (pathAngles.length == 1) {
        return pathAngles[0].path;
    }
    pathAngles.sort(function(a, b) {
        return a.angle - b.angle;
    });
    var closest = pathAngles[0];
    var next = pathAngles[1];
    if (Point.MIN_ANGLE_RATIO * closest.angle >= next.angle) {
        return undefined;
    }
    return closest.path;
};

// JSON conversion of a point.
Point.prototype.toJSON = function() {
    return { x: this.x, y: this.y };
};

// Load a JSON representation of a point.
Point.load = function(game, name, json) {
    var type = json.type;
    if (type && Point.load.factory[type]) {
        Point.load.factory[type].load(game, name, json);
    }
    return new Point(name, json.x, json.y);
};

// This is a map of type values to Point subclasses.
Point.load.factory = {};
