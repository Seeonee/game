// A path is just two Point objects, connected.
var Path = function(name, p1, p2, textKeys) {
    this.name = name;
    this.p1 = p1;
    this.p2 = p2;
    // Store our angles.
    this.angleForward = Utils.angleBetweenPoints(
        this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    this.angleBackward = (this.angleForward +
        Math.PI) % (2 * Math.PI);
    // Store our length.
    this.length = Utils.distanceBetweenPoints(
        this.p1.x, this.p1.y,
        this.p2.x, this.p2.y);
    this.z = Path.Z;
    this.broken = false;
    this.renderNeeded = true;
    // this.setBroken(Math.random() > 0.75);
    this.textKeys = textKeys;
};

// Constants.
Path.ANGLE_CATCH = Math.PI / 2.1;
Path.Z = 3; // Rendering depth.
Path.Z_BROKEN = 2;

// Convenient string representation.
Path.prototype.asKey = function() {
    return 'x' + this.p1.x + 'y' + this.p1.y + 'x' + this.p2.x + 'y' + this.p2.y;
};

// Returns a list of string representations of our game coords.
// These are taken every *half* unit along our length, 
// excluding our ends.
Path.prototype.coords = function() {
    return Path.coords(
        this.p1.gx, this.p1.gy,
        this.p2.gx, this.p2.gy);
};

// Returns a list of string representations of our game coords.
// These are taken every *half* unit along our length, 
// excluding our ends.
Path.coords = function(x1, y1, x2, y2) {
    var coords = [];
    var xlen = x2 - x1;
    var ylen = y2 - y1;
    var dx = Math.sign(xlen) * (50 / 2);
    var dy = Math.sign(ylen) * (50 / 2);
    var x = x1 + dx;
    var y = y1 + dy;
    while (x != x2 || y != y2) {
        coords.push(Point.coords(x, y));
        x += dx;
        y += dy;
    }
    return coords;
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

    // Recompute our coordinates.
    var ratio = 0.5;
    this.gx = this.p1.gx;
    this.gy = this.p1.gy;
    this.gx += ratio * (this.p2.gx - this.p1.gx);
    this.gy += ratio * (this.p2.gy - this.p1.gy);
    this.x = this.gx;
    this.y = this.gy;
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
    // console.log('attach ' + this.name);
    if (this.textKeys && !this.textFired) {
        this.textFired = true;
        for (var i = 0; i < this.textKeys.length; i++) {
            avatar.showText(this.textKeys[i]);
        }
    }
};

// Called upon avatar detachment.
// Also takes the point the avatar is leaving us for.
Path.prototype.notifyDetached = function(avatar, next) {};

// Handle various fade events.
Path.prototype.fadingIn = function(tier) {};
Path.prototype.fadedIn = function(tier) {};
Path.prototype.fadingOut = function(tier) {};
Path.prototype.fadedOut = function(tier) {};

// Shift our (x, y) coordinates.
Path.prototype.shift = function(tier, dx, dy) {};

// Called when we're being deleted.
// Primarily for subclasses to do cleanup.
Path.prototype.delete = function() {};

// Called when the tier updates.
Path.prototype.update = function() {};

// String version of our details, displayed during editing.
Path.prototype.getDetails = function() {
    return undefined;
};

// JSON conversion of a path.
Path.prototype.toJSON = function() {
    var result = { p1: this.p1.name, p2: this.p2.name };
    if (this.textKeys && this.textKeys.length) {
        result.textKeys = this.textKeys;
    }
    return result;
};

// Load a JSON representation of a path.
Path.load = function(game, name, json, p1, p2) {
    var type = json.type;
    if (type) {
        if (Path.load.factory[type]) {
            return Path.load.factory[type].load(game, name,
                json, p1, p2);
        } else {
            console.error('Failed to load path class ' + type);
        }
    }
    return new Path(name, p1, p2, json.textKeys);
};

// This is a map of type values to Path subclasses.
Path.load.factory = {};
