// Class that handles writing paths out to JSON.
var PathsWriter = function(paths) {
    this.paths = paths;
    this.pointsVisited = {};
    this.pointMap = {};
    this.index = 0;
};

// Convenience method that handles instantiating the writer.
PathsWriter.json = function(paths) {
    return new PathsWriter(paths)._json();
};

// Push out a JSON version of our points and paths.
// We translate all our points so that 
// p1 is at (0, 0).
PathsWriter.prototype._json = function() {
    var minx = this.paths.points[0].x;
    var miny = this.paths.points[0].y;
    var result = '';
    var points = {};
    for (var i = 0; i < this.paths.points.length; i++) {
        var point = this.paths.points[i];
        points[point.asKey()] = 'p' + i;
    }
    for (var i = 0; i < this.paths.points.length; i++) {
        var point = this.paths.points[i];
        result += '\n"p' + i + '": {\n';
        result += '"x": ' + (point.x - minx) + ',\n';
        result += '"y": ' + (point.y - miny) + ',\n';
        result += '"pathsTo": [\n';
        for (var j = 0; j < point.paths.length; j++) {
            var path = point.paths[j];
            var other = path.getCounterpoint(point);
            result += '"' + points[other.asKey()] + '"';
            if (j < point.paths.length - 1) {
                result += ',\n';
            }
        }
        result += ']\n}';
        if (i < this.paths.points.length - 1) {
            result += ',\n';
        }
    }
    return '{' + result + '\n}';
};



// Class that handles loading JSON data as paths.
var PathsLoader = function(game, json) {
    this.game = game;
    this.json = json;
};

PathsLoader.OFFSET = 100;

// Convenience method that handles instantiating the loader.
PathsLoader.load = function(game, json) {
    return new PathsLoader(game, json)._load();
};

// Load a JSON representation of points and paths.
// We also translate all loaded points so that 
// all points have sufficiently positive x and y.
PathsLoader.prototype._load = function() {
    var minx = Number.POSITIVE_INFINITY;
    var miny = Number.POSITIVE_INFINITY;
    this.paths = new Paths(this.game);
    var points = {};
    var keys = Object.keys(this.json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = this.json[key];
        var point = this.paths.addPoint(pointObj.x, pointObj.y);
        minx = (point.x < minx) ? point.x : minx;
        miny = (point.y < miny) ? point.y : miny;
        points[key] = point;
    }
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = this.json[key];
        for (var j = 0; j < pointObj.pathsTo.length; j++) {
            var otherKey = pointObj.pathsTo[j];
            if (this._indexOf(key) < this._indexOf(otherKey)) {
                points[key].connectTo(points[otherKey]);
            }
        }
    }
    for (var i = 0; i < this.paths.points.length; i++) {
        var point = this.paths.points[i];
        point.x += (PathsLoader.OFFSET - minx);
        point.y += (PathsLoader.OFFSET - miny);
    }
    return this.paths;
};

// Given a JSON name for a point ("p1"), return its index (1).
PathsLoader.prototype._indexOf = function(key) {
    return parseInt(key.substring(1));
}
