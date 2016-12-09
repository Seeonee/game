// A point is a juncture among one or more paths.
var Point = function(name, x, y) {
    // Constants, for now.
    this.ANGLE_CATCH = Math.PI / 2.1;
    this.MIN_ANGLE_RATIO = 2;

    this.name = name;
    this.x = x;
    this.y = y;
    this.paths = [];
};

// Convenient string representation.
Point.prototype.asKey = function() {
    return 'x' + this.x + 'y' + this.y;
};

// Connect ourself to another point, 
// instantiating a path object to do so.
// If already connected, does nothing.
// Either way, ultimately returns the point.
Point.prototype.connectTo = function(point) {
    if (!this.isConnectedTo(point)) {
        var path = new Path(this, point);
        this.paths.push(path);
        point.paths.push(path);
    }
    return point;
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
Point.prototype.draw = function(paths) {
    paths.bitmap.context.beginPath();
    paths.bitmap.context.fillStyle = paths.PATH_COLOR;
    paths.bitmap.context.arc(this.x, this.y,
        Math.floor(paths.PATH_WIDTH / 2), 0, 2 * Math.PI, false);
    paths.bitmap.context.fill();
}

// Convenience method for creating a connected point.
Point.prototype.add = function(x, y) {
    var point = new Point(x, y);
    return this.connectTo(point);
};

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
        if (difference < this.ANGLE_CATCH) {
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
    if (this.MIN_ANGLE_RATIO * closest.angle >= next.angle) {
        return undefined;
    }
    return closest.path;
};

// Delete ourself and all paths leading away from us.
// Returns the deleted point (i.e. ourself).
Point.prototype.delete = function() {
    while (this.paths.length) {
        this.paths[0].delete();
    }
    return this;
};

// Delete ourself and all paths leading away from us.
// Create new paths between all our connected points.
// Returns the deleted point (i.e. ourself).
Point.prototype.deleteAndMerge = function() {
    var linked = [];
    for (var i = 0; i < this.paths.length; i++) {
        linked.push(this.paths[i].getCounterpoint(this));
    }
    for (var i = 0; i < linked.length; i++) {
        for (var j = 0; j < linked.length; j++) {
            linked[i].connectTo(linked[j]);
        }
    }
    return this.delete();
};

// Delete one of our paths.
Point.prototype.deletePath = function(path) {
    var i = this.paths.indexOf(path);
    if (i >= 0) {
        this.paths.splice(i, 1);
    }
};
