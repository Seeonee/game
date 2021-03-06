// A point is a juncture among one or more paths.
var Point = function(name, x, y, enabled, textKeys) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.gx = x;
    this.gy = y;
    this.paths = [];
    this.z = Point.Z;
    this.renderNeeded = true;
    // The name of the default istate for handling 
    // input while we're attached.
    this.type = this.constructor.TYPE;
    this.istateName = undefined;
    this.disableIStateWhileDisabled = true;
    this.attached = false;
    this.avatar = undefined;
    this.enabled = enabled == undefined ? true : enabled;
    this.startEnabled = this.enabled;

    this.radius = Tier.PATH_WIDTH;
    this.useOffsets = true;
    this.attachmentRadius = 0;
    this.attachmentOffsetX = 0;
    this.attachmentOffsetY = 0;

    this.events = {};
    this.events.onEnabled = new Phaser.Signal();
    this.events.onDisabled = new Phaser.Signal();

    this.wires = [];
    this.textKeys = textKeys;
};

Point.TYPE = 'point';

// Constants.
Point.ANGLE_CATCH = Math.PI / 2.1;
Point.MIN_ANGLE_RATIO = 2;
Point.Z = 7; // Rendering depth.

// Convenient string representation.
Point.prototype.asKey = function() {
    return 'x' + this.x + 'y' + this.y;
};

// Convenient string representation of our *game* coords.
Point.prototype.coords = function() {
    return Point.coords(this.gx, this.gy)
};

// Static method for obtaining coords.
Point.coords = function(x, y) {
    return x + ':' + y;
}

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
    return this.paths.length > 0;
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
    // console.log('attach ' + this.name, this.x, this.y);
    this.attached = true;
    this.avatar = avatar;
    if (this.enabled || !this.disableIStateWhileDisabled) {
        this.enableIState();
    }
    if (this.textKeys && !this.textSeen) {
        this.textSeen = true;
        for (var i = 0; i < this.textKeys.length; i++) {
            avatar.showText(this.textKeys[i]);
        }
    }
};

// Called upon avatar detachment.
// Also takes the path the avatar is leaving us for.
Point.prototype.notifyDetached = function(avatar, next) {
    this.attached = false;
    this.avatar = undefined;
    this.disableIState();
};

// Handle various fade events.
Point.prototype.fadingIn = function(tier) {};
Point.prototype.fadedIn = function(tier) {};
Point.prototype.fadingOut = function(tier) {};
Point.prototype.fadedOut = function(tier) {};

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
        } else if (this.disableIStateWhileDisabled) {
            this.disableIState();
        }
    }
    if (this.enabled) {
        this.events.onEnabled.dispatch();
    } else {
        this.events.onDisabled.dispatch();
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
Point.prototype.delete = function() {
    while (this.wires.length) {
        this.wires[0].delete();
    }
};

// Called when the tier updates.
Point.prototype.update = function() {};

// String version of our details, displayed during editing.
Point.prototype.getDetails = function() {
    return ' (' + this.gx + ',' + this.gy + ')';
};

// JSON conversion of a point.
Point.prototype.toJSON = function() {
    var result = { x: this.gx, y: this.gy };
    if (this.type && this.type != Point.TYPE) {
        result.type = this.type;
        result.enabled = this.startEnabled;
    }
    if (this.textKeys && this.textKeys.length) {
        result.textKeys = this.textKeys;
    }
    return result;
};

// Load a JSON representation of a point.
Point.load = function(game, name, json) {
    var type = json.type;
    if (type) {
        if (Point.load.factory[type]) {
            return Point.load.factory[type].load(game, name, json);
        } else {
            console.error('Failed to load point class ' + type);
        }
    }
    return new Point(name, json.x, json.y,
        json.enabled, json.textKeys);
};

// This is a map of type values to Point subclasses.
Point.load.factory = {};
