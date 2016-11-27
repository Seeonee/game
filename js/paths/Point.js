// A point is a juncture among one or more paths.
var Point = function(x, y) {
    // Constants, for now.
    this.ANGLE_CATCH = Math.PI / 2.1;

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
Point.prototype.connectTo = function(point) {
    var path = new Path(this, point);
    this.paths.push(path);
    point.paths.push(path);
    return point;
};

// Convenience method for creating a connected point.
Point.prototype.add = function(x, y) {
    var point = new Point(x, y);
    return this.connectTo(point);
};

// Figure out which path is the best option 
// for a particular input angle.
// For now, we'll just pick the path closest to 
// the angle, up to a cutoff.
// If we don't find one, return undefined.
Point.prototype.getPath = function(angle) {
    var min = this.ANGLE_CATCH; // Biggest angle we want to consider.
    var choice = undefined;
    for (var i = 0; i < this.paths.length; i++) {
        var path = this.paths[i];
        var point = path.getCounterpoint(this);
        var a2 = angleBetweenPoints(this.x, this.y, point.x, point.y);
        var difference = getBoundedAngleDifference(angle, a2);
        if (difference < min) {
            min = difference;
            choice = path;
        }
    }
    return choice;
};
