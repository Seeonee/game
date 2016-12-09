// Set up the bare bones.
// Optionally accepts a starting set of points.
// This will not finish creating the object, since 
// you may want to add more points first.
// To finish initializing, create() on it (or wait 
// for the first update()).
var Tier = function(game, name, points) {
    this.name = name;
    this.game = game;

    this.dirty = false;
    this.pointMap = {};
    this.paths = [];
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
    this.image = this.game.add.image(100, 100, this.bitmap);
};

// Constants.
Tier.HIGHLIGHT_AVATAR_PATHS = false;
Tier.PATH_WIDTH = 7;
Tier.LINE_CAP_STYLE = 'butt';
Tier.LINE_JOIN_STYLE = 'round';
Tier.LINE_DASH = [18, 7];
Tier.LINE_DASH_OFFSET = 11;

// Return a string that can be used to name a new point.
Tier.prototype.getNewPointName = function() {
    var i = 0;
    while (!(this.pointMap['p' + i])) {
        i += 1;
    }
    return 'p' + i;
};

// Create a new point, optionally connected to an existing one.
// Returns the newly created point.
Tier.prototype.addPoint = function(name, x, y, point) {
    var point2 = new Point(name, x, y);
    this.points.push(point2);
    this.dirty = true;
    if (point != undefined) {
        this.connectPoints(point, point2);
    }
    return point2;
};

// Connect two points.
Tier.prototype.connectPoints = function(point, point2) {
    point.connectTo(point2);
    this.dirty = true;
};

// Add a point at a distance partially along a path's length.
// Return the newly created point.
Tier.prototype.addPointToPathAtRatio = function(path, ratio) {
    var name = this.getNewPointName();
    var point = path.addPointAtRatio(name, ratio);
    this.points.push(point);
    this.dirty = true;
    return point;
}

// Add a point to a path at coordinates that *should* lie along its length.
// Return the newly created point.
Tier.prototype.addPointToPathAtCoords = function(path, x, y) {
    var name = this.getNewPointName();
    var point = path.addPointAtCoords(name, x, y);
    this.points.push(point);
    this.dirty = true;
    return point;
}

// Delete an existing point.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePoint = function(point) {
    var i = this.points.indexOf(point);
    if (i >= 0) {
        point.delete();
        this.points.splice(i, 1);
        this.dirty = true;
        return point;
    }
    return undefined;
}

// Delete an existing point, merging each of its
// connected points to the others.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePointAndMerge = function(point) {
    var i = this.points.indexOf(point);
    if (i >= 0) {
        point.deleteAndMerge();
        this.points.splice(i, 1);
        this.dirty = true;
        return point;
    }
    return undefined;
}

// Delete path between two points.
Tier.prototype.deletePath = function(path) {
    path.delete();
    this.dirty = true;
}

// Takes x and y values relative to this Tier object's 
// internal points, and returns an {x, y} object whose 
// coordinates have been adjusted to work with the 
// game.
Tier.prototype.translateInternalPointToGamePoint = function(x, y) {
    return { x: x + this.image.x, y: y + this.image.y };
};

// Takes x and y values relative to the game, 
// and returns an {x, y} object whose coordinates 
// have been adjusted to work with this Tier 
// object's internal points.
Tier.prototype.translateGamePointToInternalPoint = function(x, y) {
    return { x: x - this.image.x, y: y - this.image.y };
};

// Update our cache maps of points and paths.
Tier.prototype.updateCaches = function() {
    this.pointMap = {};
    this.paths = [];
    var visited = {};
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        this.pointMap[point.name] = point;
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

// Draw all paths onto the bitmap.
Tier.prototype.drawTier = function() {
    this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);

    var colors = this.game.settings.colors;
    this.bitmap.context.strokeStyle = colors.PATH_COLOR.s;
    this.bitmap.context.fillStyle = colors.PATH_COLOR.s;
    this.bitmap.context.lineWidth = Tier.PATH_WIDTH;
    this.bitmap.context.lineCap = Tier.LINE_CAP_STYLE;
    this.bitmap.context.lineJoin = Tier.LINE_JOIN_STYLE;
    this.bitmap.context.lineDashOffset = Tier.LINE_DASH_OFFSET;

    var pointsVisited = {};
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var key = point.asKey();
        if (key in pointsVisited) {
            continue;
        }
        this.drawTier_walk(point, undefined, pointsVisited);
    }
    this.bitmap.dirty = true;
};

// Walk to a point during our recursive draw strategy.
// This will trace out along all paths leading away from this node,
// then trace back to the node it came from as it returns.
Tier.prototype.drawTier_walk = function(point, from, pointsVisited) {
    var key = point.asKey();
    if (!(key in pointsVisited)) {
        // Mark as visited.
        pointsVisited[key] = true;
        // Walk each of our points, except the one we came from.
        if (point.paths.length) {
            for (var i = 0; i < point.paths.length; i++) {
                var path = point.paths[i];
                var to = path.getCounterpoint(point);
                if (to == from) {
                    continue;
                }
                path.draw(this);
                this.drawTier_walk(to, point, pointsVisited);
            }
        }
        point.draw(this);
    }
};

// Tick the avatar towards the joystick.
// Also (optionally) highlight debug info.
Tier.prototype.update = function() {
    // Figure it if we need to render (again).
    if (this.dirty || (this.gpad && Tier.HIGHLIGHT_AVATAR_PATHS)) {
        this.dirty = false;
        this.updateCaches();
        this.drawTier();
    }
};

// More constants, for loading!
Tier.LOAD_OFFSET = 5;

// JSON conversion of our points and paths.
// We translate all our points so that 
// p1 is at (0, 0).
Tier.prototype.toJSON = function() {
    var minx = this.points[0].x;
    var miny = this.points[0].y;
    var result = {};
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var paths = [];
        for (var j = 0; j < point.paths.length; j++) {
            var other = point.paths[j].getCounterpoint(point);
            paths.push(other.name);
        }
        result[point.name] = {
            x: point.x - minx,
            y: point.y - miny,
            pathsTo: paths
        };
    }
    return result;
};

// Load a JSON representation of points and paths.
// We also translate all loaded points so that 
// all points have sufficiently positive x and y.
Tier.load = function(game, name, json) {
    var minx = Number.POSITIVE_INFINITY;
    var miny = Number.POSITIVE_INFINITY;
    var tier = new Tier(game, name);
    var points = {};
    var keys = Object.keys(json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = json[key];
        var point = tier.addPoint(key, pointObj.x, pointObj.y);
        minx = (point.x < minx) ? point.x : minx;
        miny = (point.y < miny) ? point.y : miny;
        points[key] = point;
    }
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = json[key];
        for (var j = 0; j < pointObj.pathsTo.length; j++) {
            var otherKey = pointObj.pathsTo[j];
            if (Tier._indexOf(key) < Tier._indexOf(otherKey)) {
                points[key].connectTo(points[otherKey]);
            }
        }
    }
    for (var i = 0; i < tier.points.length; i++) {
        var point = tier.points[i];
        point.x += (Tier.LOAD_OFFSET - minx);
        point.y += (Tier.LOAD_OFFSET - miny);
    }
    tier.updateCaches();
    return tier;
};

// Given a JSON name for a point ("p1"), return its index (1).
Tier._indexOf = function(key) {
    return parseInt(key.substring(1));
}
