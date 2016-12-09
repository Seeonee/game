// Default state for handling gamepad input during a level.
var FloatIState = function(handler, level) {
    IState.call(this, FloatIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

FloatIState.NAME = 'float';
FloatIState.prototype = Object.create(IState.prototype);
FloatIState.prototype.constructor = FloatIState;

// Some constants.
FloatIState.FLOAT_MAX_SPEED = 200;
FloatIState.FLOAT_SNAP_DISTANCE = 15;
FloatIState.FLOAT_POINT_ICON_SCALE = 0.9;
FloatIState.FLOAT_PATH_ICON_SCALE = 0.7;
FloatIState.FLOAT_ICON_SCALE = 0.5;

// Called when we become the active state.
FloatIState.prototype.activated = function(prev) {
    this.points = this.level.path.points;
    this.paths = this.cacheAllPaths(); // this.level.path.paths;
    this.x = this.avatar.x;
    this.y = this.avatar.y;
    this.point = undefined;
    this.path = undefined;
};

// TODO: Delete me once the Paths object caches its own paths!!!!
// TODO: Delete me once the Paths object caches its own paths!!!!
// TODO: Delete me once the Paths object caches its own paths!!!!
// Pre-walk the list of available paths.
FloatIState.prototype.cacheAllPaths = function() {
    var visited = {};
    var paths = [];
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        for (var j = 0; j < point.paths.length; j++) {
            var path = point.paths[j];
            var key = path.asKey();
            if (!(key in visited)) {
                visited[key] = 1;
                paths.push(path);
            }
        }
    }
    return paths;
};
// TODO: Delete me once the Paths object caches its own paths!!!!
// TODO: Delete me once the Paths object caches its own paths!!!!
// TODO: Delete me once the Paths object caches its own paths!!!!

// Called on update.
FloatIState.prototype.update = function() {
    // Move freely.
    var joystick = this.gpad.getAngleAndTilt();
    var angle = joystick.angle;
    var tilt = joystick.tilt;
    var speed = tilt * FloatIState.FLOAT_MAX_SPEED;
    this.avatar.body.velocity.x = speed * Math.sin(angle);
    this.avatar.body.velocity.y = speed * Math.cos(angle);
    this.point = this.findNearbyPoint();
    this.path = (this.point) ? undefined : this.findNearbyPath();
    if (this.point) {
        this.avatar.scale.setTo(FloatIState.FLOAT_POINT_ICON_SCALE);
    } else if (this.path) {
        this.avatar.scale.setTo(FloatIState.FLOAT_PATH_ICON_SCALE);
    } else {
        this.avatar.scale.setTo(FloatIState.FLOAT_ICON_SCALE);
    }

    // Has the player released the button?
    if (this.gpad.justReleased(this.buttonMap.FLOAT_BUTTON)) {
        if (this.point) {
            this.snapToPoint(this.point);
        } else if (this.path) {
            this.snapToPath(this.path);
        } else {
            this.snapToStartingValues();
        }
        this.avatar.scale.setTo(1);
        this.activate(DefaultLevelIState.NAME);
        return;
    }
}

// Return a nearby point, or undefined if none are found.
FloatIState.prototype.findNearbyPoint = function() {
    var min = FloatIState.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var d = Utils.distanceBetweenPoints(this.avatar.x, this.avatar.y, point.x, point.y);
        if (d <= min) {
            found = point;
            min = d;
        }
    }
    return found;
};

// Return a nearby path, or undefined if none are found.
FloatIState.prototype.findNearbyPath = function() {
    var min = FloatIState.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.paths.length; i++) {
        var path = this.paths[i];
        var d = Utils.distanceBetweenPoints(path.p1.x, path.p1.y, this.avatar.x, this.avatar.y);
        var a1 = Utils.angleBetweenPoints(path.p1.x, path.p1.y, this.avatar.x, this.avatar.y);
        var a2 = path.angleForward;
        var a3 = Utils.getBoundedAngleDifference(a1, a2);
        var offset = d * Math.sin(a3);
        var length = d * Math.cos(a3);
        if (length < -FloatIState.FLOAT_SNAP_DISTANCE ||
            length > path.length + FloatIState.FLOAT_SNAP_DISTANCE) {
            continue;
        }
        if (offset <= min) {
            found = path;
            min = offset;
        }
    }
    return found;
};

// Snap onto a point.
FloatIState.prototype.snapToPoint = function(point) {
    this.avatar.x = point.x;
    this.avatar.y = point.y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    this.avatar.point = point;
    this.avatar.path = undefined;
};

// Snap onto a path.
FloatIState.prototype.snapToPath = function(path) {
    var d = Utils.distanceBetweenPoints(
        path.p1.x, path.p1.y, this.avatar.x, this.avatar.y);
    var dx = d * Math.sin(path.angleForward);
    var dy = d * Math.cos(path.angleForward);
    var x = path.p1.x + dx;
    var y = path.p1.y + dy;
    this.avatar.x = x;
    this.avatar.y = y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    this.avatar.path = path;
    this.avatar.point = undefined;
};

// Snap back to our starting values.
FloatIState.prototype.snapToStartingValues = function() {
    this.avatar.x = this.x;
    this.avatar.y = this.y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
};
