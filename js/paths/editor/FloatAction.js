// Action for detaching movement from the paths.
var FloatAction = function(editor) {
    this.editor = editor;
    this.points = this.editor.paths.points;
    this.cacheAllPaths();
    this.x = this.editor.x;
    this.y = this.editor.y;
}

// Pre-walk the list of available paths.
FloatAction.prototype.cacheAllPaths = function() {
    var visited = {};
    this.paths = [];
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        for (var j = 0; j < point.paths.length; j++) {
            var path = point.paths[j];
            var key = path.asKey();
            if (!(key in visited)) {
                visited[key] = 1;
                this.paths.push(path);
            }
        }
    }
};

// Move freely.
FloatAction.prototype.move = function(angle, ratio) {
    var speed = ratio * EditorAvatar.FLOAT_MAX_SPEED;
    this.editor.body.velocity.x = speed * Math.sin(angle);
    this.editor.body.velocity.y = speed * Math.cos(angle);
};

// Handle an update while holding the button.
FloatAction.prototype.update = function() {
    Avatar.prototype.update.call(this.editor);

    var point = this.findNearbyPoint();
    var path = undefined;
    if (!point) {
        path = this.findNearbyPath();
    }

    if (point) {
        this.editor.scale.setTo(EditorAvatar.FLOAT_POINT_ICON_SCALE);
    } else if (path) {
        this.editor.scale.setTo(EditorAvatar.FLOAT_PATH_ICON_SCALE);
    } else {
        this.editor.scale.setTo(EditorAvatar.FLOAT_ICON_SCALE);
    }

    if (this.editor.justReleased(EditorAvatar.FLOAT_BUTTON)) {
        if (point) {
            this.snapToPoint(point);
        } else if (path) {
            this.snapToPath(path);
        } else {
            this.snapToStartingValues();
        }
        this.editor.scale.setTo(1);
        this.editor.action = undefined;
    }
};

// Return a nearby point, or undefined if none are found.
FloatAction.prototype.findNearbyPoint = function() {
    var min = EditorAvatar.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var d = distanceBetweenPoints(this.editor.x, this.editor.y, point.x, point.y);
        if (d <= min) {
            found = point;
            min = d;
        }
    }
    return found;
};

// Return a nearby path, or undefined if none are found.
FloatAction.prototype.findNearbyPath = function() {
    var min = EditorAvatar.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.paths.length; i++) {
        var path = this.paths[i];
        var d = distanceBetweenPoints(path.p1.x, path.p1.y, this.editor.x, this.editor.y);
        var a1 = angleBetweenPoints(path.p1.x, path.p1.y, this.editor.x, this.editor.y);
        var a2 = path.angleForward;
        var a3 = Math.abs(a2 - a1); // getBoundedAngleDifference(a1, a2);
        var offset = d * Math.sin(a3);
        var length = d * Math.cos(a3);
        if (length < -EditorAvatar.FLOAT_SNAP_DISTANCE ||
            length > path.length + EditorAvatar.FLOAT_SNAP_DISTANCE) {
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
FloatAction.prototype.snapToPoint = function(point) {
    this.editor.x = point.x;
    this.editor.y = point.y;
    this.editor.body.velocity.x = 0;
    this.editor.body.velocity.y = 0;
    this.editor.point = point;
    this.editor.path = undefined;
};

// Snap onto a path.
FloatAction.prototype.snapToPath = function(path) {
    var d = distanceBetweenPoints(path.p1.x, path.p1.y, this.editor.x, this.editor.y);
    var dx = d * Math.sin(path.angleForward);
    var dy = d * Math.cos(path.angleForward);
    var x = path.p1.x + dx;
    var y = path.p1.y + dy;
    this.editor.x = x;
    this.editor.y = y;
    this.editor.body.velocity.x = 0;
    this.editor.body.velocity.y = 0;
    this.editor.path = path;
    this.editor.point = undefined;
};

// Snap back to our starting values.
FloatAction.prototype.snapToStartingValues = function() {
    this.editor.x = this.x;
    this.editor.y = this.y;
    this.editor.body.velocity.x = 0;
    this.editor.body.velocity.y = 0;
};
