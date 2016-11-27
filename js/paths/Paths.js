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
    this.created = false;
    // Set up our starting points.
    this.points = [];
    if (points) {
        for (var i = 0; i < points.length; i++) {
            this.points.push(points[i]);
        }
    }
    // Set up our bitmap.
    this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
    this.game.add.image(0, 0, this.bitmap);
    // We support a joystick for input.
    this.joystick = undefined;
};

// Create a new point from an (optional) existing one.
// Track it, then return it.
Paths.prototype.point = function(x, y, point) {
    var point2 = new Point(x, y);
    if (point != undefined) {
        point.connectTo(point2);
    }
    this.points.push(point2);
    return point2;
};

// Call this once you're done adding points.
Paths.prototype.create = function() {
    if (this.created) {
        return;
    }
    this.created = true;
    // Perform the first draw.
    this.drawPaths();
};

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

    var point = this.points[0];
    var pointsVisited = {};
    this.bitmap.context.beginPath();
    this.bitmap.context.moveTo(point.x, point.y);
    this.drawPaths_walk(point, undefined,
        this.bitmap, pointsVisited);
    this.bitmap.dirty = true;
};

// Walk to a point during our recursive draw strategy.
// This will trace out along all paths leading away from this node,
// then trace back to the node it came from as it returns.
Paths.prototype.drawPaths_walk = function(
    point, from, bitmap, pointsVisited) {
    var key = point.asKey();
    if (!(key in pointsVisited)) {
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
    // Mark as visited.
    pointsVisited[key] = true;
    // Draw a path back to where we came from.
    if (from) {
        bitmap.context.lineTo(from.x, from.y);
        bitmap.context.stroke();
    }
};

// Tick the avatar towards the joystick.
// Also (optionally) highlight debug info.
Paths.prototype.update = function() {
    // Make sure we've finished initializing.
    if (!this.created) {
        this.create();
    }
    // Can't update the avatar without input.
    if (!this.joystick) return;

    // Debug draw mode.
    if (this.HIGHLIGHT_AVATAR_PATHS) {
        this.drawPaths();
    }

    // Move that avatar!
    this.avatar.move(this.joystick.angle, this.joystick.tilt);
};
