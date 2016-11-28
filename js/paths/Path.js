// A path is just two Point objects, connected.
var Path = function(p1, p2) {
    // Constants, for now.
    this.ANGLE_CATCH = Math.PI / 2.1;

    this.p1 = p1;
    this.p2 = p2;

    // Store our angles.
    var dx = this.p2.x - this.p1.x;
    var dy = this.p2.y - this.p1.y;
    this.angleForward = Math.atan2(dx, dy);
    this.angleBackward = (this.angleForward + Math.PI) % (2 * Math.PI);

    // Store our length.
    this.length = distanceBetweenPoints(
        this.p1.x, this.p1.y,
        this.p2.x, this.p2.y);
};

// Convenient string representation.
Path.prototype.asKey = function() {
    return 'x' + this.p1.x + 'y' + this.p1.y + 'x' + this.p2.x + 'y' + this.p2.y;
};

// Given one of our endpoints, return the other.
Path.prototype.getCounterpoint = function(point) {
    return (this.p1.x == point.x && this.p1.y == point.y) ? this.p2 : this.p1;
};

// Figure out which endpoint is in the direction 
// of a particular angle, as judged from the midpoint.
Path.prototype.getPoint = function(angle) {
    var df = getBoundedAngleDifference(angle, this.angleForward);
    var db = getBoundedAngleDifference(angle, this.angleBackward);
    if (Math.min(df, db) < this.ANGLE_CATCH) {
        return (df < db) ? this.p2 : this.p1;
    }
    return undefined;
};

// Delete this path from each of its endpoints.
Path.prototype.delete = function() {
    this.p1.deletePath(this);
    this.p2.deletePath(this);
};
