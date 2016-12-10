// Set up the bare bones.
// Optionally accepts a starting set of points.
// This will not finish creating the object, since 
// you may want to add more points first.
// To finish initializing, create() on it (or wait 
// for the first update()).
var Tier = function(game, name, points) {
    this.name = name;
    this.game = game;
    this.x = Tier.IMAGE_OFFSET;
    this.y = Tier.IMAGE_OFFSET; // Sufficient?
    this.dirty = false;

    this.points = [];
    this.paths = [];
    this.pointMap = {};
    this.pathMap = {};
    // Set up our starting points.
    if (points) {
        for (var i = 0; i < points.length; i++) {
            this.points.push(points[i]);
        }
        this.dirty = true;
    }

    // Bitmap gets set up later.
    this.bitmap = undefined;
    this.image = undefined;
};

// Constants.
Tier.PADDING = 5;
Tier.IMAGE_OFFSET = 125;
Tier.HIGHLIGHT_AVATAR_PATHS = false;
Tier.PATH_WIDTH = 7;
Tier.LINE_CAP_STYLE = 'butt';
Tier.LINE_JOIN_STYLE = 'round';
Tier.LINE_DASH = [18, 7];
Tier.LINE_DASH_OFFSET = 11;

// Return a string that can be used to name a new point.
Tier.prototype.getNewPointName = function() {
    var i = 0;
    while (this.pointMap['p' + i]) {
        i += 1;
    }
    return 'p' + i;
};

// Return a string that can be used to name a new path.
Tier.prototype.getNewPathName = function() {
    var i = 0;
    while (this.pathMap['a' + i]) {
        i += 1;
    }
    return 'a' + i;
};

// Create a new point, optionally connected to an existing one.
// Returns the newly created point.
Tier.prototype.addPoint = function(name, x, y, point2) {
    var point = new Point(name, x, y);
    this.points.push(point);
    this.pointMap[name] = point;
    this.dirty = true;
    if (point2 != undefined) {
        this.connectPoints(point, point2);
    }
    return point;
};

// Connect two points.
Tier.prototype.connectPoints = function(point, point2) {
    if (!point.isConnectedTo(point2)) {
        var path = new Path(point, point2);
        point.paths.push(path);
        point2.paths.push(path);
        this.paths.push(path);
        this.pathMap[path.name] = path;
        this.dirty = true;
    }
};

// Add a point to a path at coordinates that *should* lie along its length.
// Return the newly created point.
Tier.prototype.addPointToPathAtCoords = function(path, x, y) {
    var point = this.addPoint(this.getNewPointName(), x, y);
    var point2 = path.p2;
    point.paths.push(path);
    point2.deletePath(path);
    path.p2 = point;
    this.connectPoints(point, point2);
    this.dirty = true;
    return point;
}

// Delete an existing point.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePoint = function(point) {
    var index = this.points.indexOf(point);
    if (index >= 0) {
        while (point.paths.length) {
            this.deletePath(point.paths[0]);
        }
        this.points.splice(index, 1);
        delete this.pointMap[point.name];
        this.dirty = true;
        return point;
    }
    return undefined;
}

// Delete an existing point, merging each of its
// connected points to the others.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePointAndMerge = function(point) {
    var index = this.points.indexOf(point);
    if (index >= 0) {
        var linked = [];
        for (var i = 0; i < point.paths.length; i++) {
            linked.push(point.paths[i].getCounterpoint(point));
        }
        for (var i = 0; i < linked.length; i++) {
            for (var j = 0; j < linked.length; j++) {
                if (i != j) {
                    this.connectPoints(linked[i], linked[j]);
                }
            }
        }
        return this.deletePoint(point);
    }
    return undefined;
}

// Delete an existing path between two points.
// Return the deleted path, or undefined if it wasn't deleted.
Tier.prototype.deletePath = function(path) {
    var index = this.paths.indexOf(path);
    if (index >= 0) {
        var points = [path.p1, path.p2];
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var index2 = point.paths.indexOf(path);
            point.paths.splice(index2, 1);
        }
        this.paths.splice(index, 1);
        delete this.pathMap[path.name];
        this.dirty = true;
        return path;
    }
    return undefined;
}

// Takes x and y values relative to this Tier object's 
// internal points, and returns an {x, y} object whose 
// coordinates have been adjusted to work with the 
// game.
Tier.prototype.translateInternalPointToGamePoint = function(x, y) {
    return { x: x + this.x, y: y + this.y };
};

// Takes x and y values relative to the game, 
// and returns an {x, y} object whose coordinates 
// have been adjusted to work with this Tier 
// object's internal points.
Tier.prototype.translateGamePointToInternalPoint = function(x, y) {
    return { x: x - this.x, y: y - this.y };
};

// Update our cache maps of points and paths.
Tier.prototype.updateCaches = function() {
    var x = Tier.PADDING;
    var y = Tier.PADDING;
    this.width = Tier.PADDING;
    this.height = Tier.PADDING;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        x = (point.x < x) ? point.x : x;
        y = (point.y < y) ? point.y : y;
        this.width = (point.x > this.width) ? point.x : this.width;
        this.height = (point.y > this.height) ? point.y : this.height;
    }
    var dx = Math.min(0, x - Tier.PADDING);
    var dy = Math.min(0, y - Tier.PADDING);
    if (dx < 0 || dy < 0) {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].x -= dx;
            this.points[i].y -= dy;
        }
        this.x += dx;
        this.y += dy;
        this.width -= dx;
        this.height -= dy;
    }
    this.width += Tier.PADDING;
    this.height += Tier.PADDING;
};

// Make sure our current image is big enough 
// to render our full size.
Tier.prototype.updateImageSize = function() {
    var w = (this.bitmap) ? this.bitmap.width : 0;
    var h = (this.bitmap) ? this.bitmap.height : 0;
    if (this.width > w || this.height > h) {
        if (this.bitmap) {
            this.image.destroy();
            this.bitmap.destroy();
            this.image = undefined;
            this.bitmap = undefined;
        }
    }
    if (this.bitmap) {
        this.bitmap.context.clearRect(0, 0, w, h);
    } else {
        this.bitmap = this.game.add.bitmapData(
            this.width, this.height);
        this.image = this.game.add.image(this.x, this.y,
            this.bitmap);
        this.game.state.getCurrentState().z.level.add(
            this.image);
    }
}

// Draw all paths onto the bitmap.
Tier.prototype.drawTier = function() {
    this.updateImageSize();
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
                tier.connectPoints(points[key], points[otherKey]);
            }
        }
    }
    for (var i = 0; i < tier.points.length; i++) {
        var point = tier.points[i];
        point.x += (Tier.PADDING - minx);
        point.y += (Tier.PADDING - miny);
    }
    tier.updateCaches();
    return tier;
};

// Given a JSON name for a point ("p1"), return its index (1).
Tier._indexOf = function(key) {
    return parseInt(key.substring(1));
}
