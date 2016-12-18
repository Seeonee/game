// A point is a juncture among one or more paths.
var Point = function(name, x, y, enabled) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.paths = [];
    this.z = Point.Z;
    this.renderNeeded = true;
    // The name of the default istate for handling 
    // input while we're attached.
    this.istateName = undefined;
    this.attached = false;
    this.avatar = undefined;
    this.enabled = enabled == undefined ? true : enabled;

    this.radius = Tier.PATH_WIDTH;
};

// Constants.
Point.ANGLE_CATCH = Math.PI / 2.1;
Point.MIN_ANGLE_RATIO = 2;
Point.Z = 7; // Rendering depth.

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

// Returns true or false based on whether we are 
// connected solely to broken paths.
Point.prototype.isBroken = function() {
    for (var i = 0; i < this.paths.length; i++) {
        if (!(this.paths[i].broken)) {
            return false;
        }
    }
    return true;
};

// Called during the draw walk by our Paths object.
// This gives us a chance to render ourself to the bitmap.
Point.prototype.draw = function(tier) {
    this.renderNeeded = false;
    var colors = tier.game.settings.colors;
    tier.bitmap.context.fillStyle = this.isBroken() ?
        colors.GREY.s : tier.palette.c1.s;
    tier.bitmap.context.beginPath();
    tier.bitmap.context.arc(this.x, this.y,
        Math.floor(this.radius / 2), 0, 2 * Math.PI, false);
    tier.bitmap.context.fill();
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

// Should the avatar "stick" briefly when passing this point?
Point.prototype.shouldHold = function() {
    return this.enabled && this.istateName;
};

// Called upon avatar attachment.
// Also takes the previous path the avatar was attached to.
Point.prototype.notifyAttached = function(avatar, prev) {
    console.log('attach ' + this.name, this.x, this.y);
    this.attached = true;
    this.avatar = avatar;
    this.enableIState();
};

// Called upon avatar detachment.
// Also takes the path the avatar is leaving us for.
Point.prototype.notifyDetached = function(avatar, next) {
    this.attached = false;
    this.avatar = undefined;
    this.disableIState();
};

// Are we enabled?
Point.prototype.isEnabled = function() {
    return this.enabled;
};

// Set our enabled state.
// This mainly affects whether our custom istate 
// can become enabled.
Point.prototype.setEnabled = function(enabled) {
    if (this.enabled == enabled) {
        return;
    }
    this.enabled = enabled;
    if (this.attached) {
        if (this.enabled) {
            this.enableIState();
        } else {
            this.disableIState();
        }
    }
};

// Turn on our custom istate, if we have one.
Point.prototype.enableIState = function() {
    if (this.istateName) {
        var ihandler = game.state.getCurrentState().pointhandler;
        ihandler.activate(this.istateName);
    }
};

// Turn off our custom istate, if we have one.
Point.prototype.disableIState = function() {
    if (this.istateName) {
        var ihandler = game.state.getCurrentState().pointhandler;
        if (ihandler.isActive(this.istateName)) {
            ihandler.activate(); // Clear istate.
        }
    }
};

// Shift our (x, y) coordinates.
Point.prototype.shift = function(tier, dx, dy) {
    this.x += dx;
    this.y += dy;
};

// Called when we're being deleted.
// Primarily for subclasses to do cleanup.
Point.prototype.delete = function() {};

// Called when the tier updates.
Point.prototype.update = function() {};

// JSON conversion of a point.
Point.prototype.toJSON = function() {
    return { x: this.x, y: this.y };
};

// Load a JSON representation of a point.
Point.load = function(game, name, json) {
    var type = json.type;
    if (type && Point.load.factory[type]) {
        return Point.load.factory[type].load(game, name, json);
    }
    return new Point(name, json.x, json.y);
};

// This is a map of type values to Point subclasses.
Point.load.factory = {};
