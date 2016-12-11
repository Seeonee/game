// Set up the bare bones.
// Optionally accepts a starting set of points.
// This will not finish creating the object, since 
// you may want to add more points first.
// To finish initializing, create() on it (or wait 
// for the first update()).
var Tier = function(game, name) {
    this.name = name;
    this.game = game;
    this.x = Tier.IMAGE_OFFSET;
    this.y = Tier.IMAGE_OFFSET; // Sufficient?
    this.renderNeeded = false;
    this.visible = false;

    this.points = [];
    this.paths = [];
    this.pointMap = {};
    this.pathMap = {};

    // Bitmap gets set up later.
    this.bitmap = undefined;
    this.image = undefined;
};

// Constants.
Tier.PADDING = 5;
Tier.IMAGE_OFFSET = 125;
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
    this._addPoint(point);
    if (point2 != undefined) {
        this.addPath(this.getNewPathName(), point, point2);
    }
    return point;
};

// Internal use only.
// Adds an already-constructed point.
Tier.prototype._addPoint = function(point) {
    this.points.push(point);
    this.pointMap[point.name] = point;
    return point;
};

// Connect two points.
Tier.prototype.addPath = function(name, point, point2) {
    if (!point.isConnectedTo(point2)) {
        var path = new Path(name, point, point2);
        return this._addPath(path, point, point2);
    }
};

// Internal use only.
// Adds an already-constructed path.
Tier.prototype._addPath = function(path, point, point2) {
    point.paths.push(path);
    point2.paths.push(path);
    this.paths.push(path);
    this.pathMap[path.name] = path;
    return path;
};

// Add a point to a path at coordinates that *should* lie along its length.
// Return the newly created point.
Tier.prototype.addPointToPathAtCoords = function(path, x, y) {
    var point = this.addPoint(this.getNewPointName(), x, y);
    var point2 = path.p2;
    point.paths.push(path);
    var index = point2.paths.indexOf(path);
    point2.paths.splice(index, 1);
    path.p2 = point;
    this.addPath(this.getNewPathName(), point, point2);
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
        point.delete();
        this.points.splice(index, 1);
        delete this.pointMap[point.name];
        this.renderNeeded = true;
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
                    this.addPath(this.getNewPathName(),
                        linked[i], linked[j]);
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
        path.delete();
        this.paths.splice(index, 1);
        delete this.pathMap[path.name];
        this.renderNeeded = true;
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

// Update our visibility.
Tier.prototype.setVisible = function(visible) {
    this.visible = visible;
    if (this.image) {
        this.image.visible = visible;
    }
};

// Update our dimensions.
Tier.prototype.recalculateDimensions = function() {
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
Tier.prototype.recreateImageAsNeeded = function() {
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
Tier.prototype.draw = function() {
    this.renderNeeded = false;
    this.recalculateDimensions();
    this.recreateImageAsNeeded();
    var colors = this.game.settings.colors;
    this.bitmap.context.strokeStyle = colors.PATH_COLOR.s;
    this.bitmap.context.fillStyle = colors.PATH_COLOR.s;
    this.bitmap.context.lineWidth = Tier.PATH_WIDTH;
    this.bitmap.context.lineCap = Tier.LINE_CAP_STYLE;
    this.bitmap.context.lineJoin = Tier.LINE_JOIN_STYLE;
    this.bitmap.context.lineDashOffset = Tier.LINE_DASH_OFFSET;

    var objects = this.paths.concat(this.points);
    objects.sort(function(a, b) {
        var z1 = a.z ? a.z : 10;
        var z2 = b.z ? b.z : 10;
        return z1 - z2;
    });
    for (var i = 0; i < objects.length; i++) {
        objects[i].draw(this);
    }
    this.bitmap.dirty = true;
};

// Update loop processing.
Tier.prototype.update = function() {
    // We don't actually do anything at the moment.
    // Input's all handled by the IHandler states.
};

// Return true if we, or any of our points/paths, 
// need a new render.
Tier.prototype.isRenderNeeded = function() {
    if (this.renderNeeded) {
        return true;
    }
    for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].renderNeeded) {
            return true;
        }
    }
    for (var i = 0; i < this.paths.length; i++) {
        if (this.paths[i].renderNeeded) {
            return true;
        }
    }
    return false;
};

// The rendering loop.
Tier.prototype.render = function() {
    // Figure it if we need to render (again).
    if (this.visible && this.isRenderNeeded()) {
        this.draw();
    }
};

// JSON conversion of our points and paths.
Tier.prototype.toJSON = function() {
    return {
        points: this.pointMap,
        paths: this.pathMap
    };
};

// Load a JSON representation of points and paths.
Tier.load = function(game, name, json) {
    var tier = new Tier(game, name);
    var keys = Object.keys(json.points);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = json.points[key];
        var point = Point.load(game, key, pointObj);
        tier._addPoint(point);
    }
    keys = Object.keys(json.paths);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pathObj = json.paths[key];
        var p1 = tier.pointMap[pathObj.p1];
        var p2 = tier.pointMap[pathObj.p2];
        var path = Path.load(game, key, pathObj, p1, p2);
        tier._addPath(path, p1, p2);
    }
    return tier;
};
