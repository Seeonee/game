// A path is just two Point objects, connected.
var Path = function(p1, p2) {
    // Constants, for now.
    this.ANGLE_CATCH = Math.PI / 2.1;

    this.p1 = p1;
    this.p2 = p2;
    // Store our angles.
    this.angleForward = angleBetweenPoints(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
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
// of a particular angle, as judged from an (x, y) 
// along our length.
// If we're near an endpoint, we also increasingly 
// weigh the other paths we might be pointing towards 
// besides ourself.
// Note that we actually return an object with two 
// key'd values:
// .point: the point to head towards
// .angle: the delta between our tilt angle and the angle towards our fake point
// .fakePoint: the fake point that's allowing the input to be valid
// .fakeAngle: the angle towards our fake point
Path.prototype.getPoint = function(angle, x, y) {
    var targets = [];
    var df = getBoundedAngleDifference(angle, this.angleForward);
    var db = getBoundedAngleDifference(angle, this.angleBackward);
    targets.push({ angle: df, point: this.p2, fake: this.p2 });
    targets.push({ angle: db, point: this.p1, fake: this.p1 });

    var points = [this.p1, this.p2];
    for (var i = 0; i < points.length; i++) {
        var endpoint = points[i];
        var ratio = 1 - (distanceBetweenPoints(x, y, endpoint.x, endpoint.y) / this.length);
        for (var j = 0; j < endpoint.paths.length; j++) {
            var path = endpoint.paths[j];
            if (path === this) {
                continue;
            }
            var a = (path.p1 === endpoint) ? path.angleForward : path.angleBackward;
            var d = ratio * path.length;
            var x2 = endpoint.x + d * Math.sin(a);
            var y2 = endpoint.y + d * Math.cos(a);
            var a2 = angleBetweenPoints(x, y, x2, y2);
            var a3 = getBoundedAngleDifference(angle, a2);
            targets.push({
                point: endpoint,
                angle: a3,
                fakePoint: { x: x2, y: y2 },
                fakeAngle: a2
            });
        }
    }
    targets.sort(function(a, b) {
        return a.angle - b.angle;
    });
    var closest = targets[0];
    if (closest.angle <= this.ANGLE_CATCH) {
        return closest;
    }
    return undefined;
};

// Delete this path from each of its endpoints.
// Returns nothing.
Path.prototype.delete = function() {
    this.p1.deletePath(this);
    this.p2.deletePath(this);
};

// Add a new point partway along our length.
// Returns the newly added point.
Path.prototype.addPointAtRatio = function(ratio) {
    var dx = ratio * (this.p2.x - this.p1.x);
    var dy = ratio * (this.p2.y - this.p1.y);
    return this.addPoint(this.p1.x + dx, this.p1.y + dy);
};

// Add a new point at coordinates that *should* lie along our path.
// Returns the newly added point.
Path.prototype.addPointAtCoords = function(x, y) {
    var point = new Point(x, y);
    var p2 = this.p2;
    point.paths.push(this);
    p2.deletePath(this);
    this.p2 = point;
    point.connectTo(p2);
    return point;
};
