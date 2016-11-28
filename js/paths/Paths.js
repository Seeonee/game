// Set up the bare bones.
// Optionally accepts a starting set of points.
// This will not finish creating the object, since 
// you may want to add more points first.
// To finish initializing, create() on it (or wait 
// for the first update()).
var Paths = function(game, points) {
    // Constants, for now.
    this.HIGHLIGHT_AVATAR_PATHS = false;
    this.PATH_COLOR = '#2CABD9';
    this.DEBUG_COLOR = '#D92C57';
    this.PATH_WIDTH = 7;
    this.LINE_CAP_STYLE = 'round';
    this.LINE_JOIN_STYLE = 'round';

    this.game = game;
    this.dirty = false;
    // Set up our starting points.
    this.points = [];
    if (points) {
        for (var i = 0; i < points.length; i++) {
            this.points.push(points[i]);
        }
        this.dirty = true;
    }
    // Set up our bitmap.
    this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
    this.game.add.image(0, 0, this.bitmap);
    // We support a joystick for input.
    this.joystick = undefined;
};

// Create a new point, optionally connected to an existing one.
// Returns the newly created point.
Paths.prototype.addPoint = function(x, y, point) {
    var point2 = new Point(x, y);
    this.points.push(point2);
    this.dirty = true;
    if (point != undefined) {
        this.connectPoints(point, point2);
    }
    return point2;
};

// Connect two points.
Paths.prototype.connectPoints = function(point, point2) {
    point.connectTo(point2);
    this.dirty = true;
};

// Add a point at a distance partially along a path's length.
// Return the newly created point.
Paths.prototype.addPointToPath = function(path, ratio) {
    var point = path.addPoint(ratio);
    this.points.push(point);
    this.dirty = true;
    return point;
}

// Delete an existing point.
// Return the deleted point, or undefined if it wasn't deleted.
Paths.prototype.deletePoint = function(point) {
    var i = this.points.indexOf(point);
    if (i >= 0) {
        point.delete();
        this.points.splice(i, 1);
        this.dirty = true;
        return point;
    }
    return undefined;
}

// Delete path between two points.
Paths.prototype.deletePath = function(path) {
    path.delete();
    this.dirty = true;
}

// Add the player avatar to our starting point.
Paths.prototype.addAvatar = function(avatar) {
    this.avatar = avatar;
    this.avatar.setStartingPoint(this.points[0]);
    this.game.add.existing(this.avatar);
};

// Draw all paths onto the bitmap.
Paths.prototype.drawPaths = function() {
    this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);

    this.bitmap.context.strokeStyle = this.PATH_COLOR;
    this.bitmap.context.lineWidth = this.PATH_WIDTH;
    this.bitmap.context.lineCap = this.LINE_CAP_STYLE;
    this.bitmap.context.lineJoin = this.LINE_JOIN_STYLE;

    var pointsVisited = {};
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var key = point.asKey();
        if (key in pointsVisited) {
            continue;
        }
        this.bitmap.context.beginPath();
        this.bitmap.context.moveTo(point.x, point.y);
        this.drawPaths_walk(point, undefined,
            this.bitmap, pointsVisited);
    }
    this.bitmap.dirty = true;
};

// Walk to a point during our recursive draw strategy.
// This will trace out along all paths leading away from this node,
// then trace back to the node it came from as it returns.
Paths.prototype.drawPaths_walk = function(
    point, from, bitmap, pointsVisited) {
    var key = point.asKey();
    if (!(key in pointsVisited)) {
        // Mark as visited.
        pointsVisited[key] = true;
        // Walk each of our points, except the one we came from.
        for (var i = 0; i < point.paths.length; i++) {
            var path = point.paths[i];
            var to = path.getCounterpoint(point);
            if (to == from) {
                continue;
            }
            bitmap.context.lineTo(to.x, to.y);
            this.drawPaths_walk(to, point, bitmap, pointsVisited);
        }
    }
    // Draw a path back to where we came from.
    if (from) {
        bitmap.context.lineTo(from.x, from.y);
        bitmap.context.stroke();
    }
};

// Tick the avatar towards the joystick.
// Also (optionally) highlight debug info.
Paths.prototype.update = function() {
    // Figure it if we need to render (again).
    if (this.dirty || (this.joystick && this.HIGHLIGHT_AVATAR_PATHS)) {
        this.dirty = false;
        this.drawPaths();
    }
    // Move that avatar!
    if (this.joystick) {
        this.avatar.move(this.joystick.angle, this.joystick.tilt);
    }
};
