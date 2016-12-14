// A path is just two Point objects, connected.
var Path = function(name, p1, p2) {
    this.name = name;
    this.p1 = p1;
    this.p2 = p2;
    // Store our angles.
    this.angleForward = Utils.angleBetweenPoints(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    this.angleBackward = (this.angleForward + Math.PI) % (2 * Math.PI);
    // Store our length.
    this.length = Utils.distanceBetweenPoints(
        this.p1.x, this.p1.y,
        this.p2.x, this.p2.y);
    this.z = Path.Z;
    this.broken = false;
    this.renderNeeded = true;
    if (Math.random() > 0.75) {
        this.setBroken(true);
    }
};

// Constants.
Path.ANGLE_CATCH = Math.PI / 2.1;
Path.Z = 3; // Rendering depth.
Path.Z_BROKEN = 2;

// Convenient string representation.
Path.prototype.asKey = function() {
    return 'x' + this.p1.x + 'y' + this.p1.y + 'x' + this.p2.x + 'y' + this.p2.y;
};

// Given one of our endpoints, return the other.
Path.prototype.getCounterpoint = function(point) {
    return (this.p1.x == point.x && this.p1.y == point.y) ? this.p2 : this.p1;
};

// Set whether this path is broken (true or false).
Path.prototype.setBroken = function(broken) {
    if (this.broken == broken) {
        return;
    }
    this.broken = broken;
    this.z = this.broken ? Path.Z_BROKEN : Path.Z;
    this.renderNeeded = true;
}


// Called during the draw walk by our Paths object.
// This gives us a chance to render ourself to the bitmap.
Path.prototype.draw = function(tier) {
    this.renderNeeded = false;
    tier.bitmap.context.setLineDash(this.broken ? Tier.LINE_DASH : []);
    var colors = tier.game.settings.colors;
    tier.bitmap.context.strokeStyle = this.broken ?
        colors.GREY.s : tier.palette.c1.s;
    tier.bitmap.context.beginPath();
    tier.bitmap.context.moveTo(this.p1.x, this.p1.y);
    tier.bitmap.context.lineTo(this.p2.x, this.p2.y);
    tier.bitmap.context.stroke();
}

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
    var df = Utils.getBoundedAngleDifference(angle, this.angleForward);
    var db = Utils.getBoundedAngleDifference(angle, this.angleBackward);
    targets.push({ angle: df, point: this.p2, fake: this.p2 });
    targets.push({ angle: db, point: this.p1, fake: this.p1 });

    var points = [this.p1, this.p2];
    for (var i = 0; i < points.length; i++) {
        var endpoint = points[i];
        var ratio = 1 - (Utils.distanceBetweenPoints(x, y, endpoint.x, endpoint.y) / this.length);
        for (var j = 0; j < endpoint.paths.length; j++) {
            var path = endpoint.paths[j];
            if (path === this) {
                continue;
            }
            var a = (path.p1 === endpoint) ? path.angleForward : path.angleBackward;
            var d = ratio * path.length;
            var x2 = endpoint.x + d * Math.sin(a);
            var y2 = endpoint.y + d * Math.cos(a);
            var a2 = Utils.angleBetweenPoints(x, y, x2, y2);
            var a3 = Utils.getBoundedAngleDifference(angle, a2);
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
    if (closest.angle <= Path.ANGLE_CATCH) {
        return closest;
    }
    return undefined;
};

// Called upon avatar attachment.
// Also takes the previous point the avatar was attached to.
Path.prototype.notifyAttached = function(avatar, prev) {
    console.log('attach ' + this.name);
};

// Called upon avatar detachment.
// Also takes the point the avatar is leaving us for.
Path.prototype.notifyDetached = function(avatar, next) {};

// Called when we're being deleted.
// Primarily for subclasses to do cleanup.
Path.prototype.delete = function() {};

// JSON conversion of a path.
Path.prototype.toJSON = function() {
    return { p1: this.p1.name, p2: this.p2.name };
};

// Load a JSON representation of a path.
Path.load = function(game, name, json, p1, p2) {
    var type = json.type;
    if (type && Point.load.factory[type]) {
        Path.load.factory[type].load(game, name, json, p1, p2);
    }
    return new Path(name, p1, p2);
};

// This is a map of type values to Path subclasses.
Path.load.factory = {};
