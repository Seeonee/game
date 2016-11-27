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
PathsWriter.prototype._json = function() {
    return '{' + this._walk(this.paths.points[0]) + '\n}';
};

// Write a node out as JSON, then recurse along all its paths.
PathsWriter.prototype._walk = function(point) {
    var key = point.asKey();
    if (key in this.pointsVisited) {
        return;
    }
    this.pointsVisited[key] = true;
    var index = this._index(key);
    var result = '\n"p' + index + '": {\n';
    result += '"x": ' + point.x + ',\n';
    result += '"y": ' + point.y + ',\n';
    result += '"pathsTo": [\n';
    var len = point.paths.length;
    for (var i = 0; i < len; i++) {
        var other = this._connection(point, i);
        result += '"p' + this._index(other.asKey()) + '"';
        if (i < len - 1) {
            result += ',\n'
        }
    }
    result += ']\n}';
    for (var i = 0; i < len; i++) {
        var other = this._connection(point, i);
        var more = this._walk(other);
        if (more) {
            result += ',' + more;
        }
    }
    return result;
};


// Figure out the index for a node.
PathsWriter.prototype._index = function(key) {
    if (key in this.pointMap) {
        return this.pointMap[key];
    } else {
        var index = this.index++;
        this.pointMap[key] = index;
        return index;
    }
};

// Return a point's Nth connected point.
PathsWriter.prototype._connection = function(point, i) {
    var path = point.paths[i];
    var other = path.getCounterpoint(point);
    return other;
};



// Class that handles loading JSON data as paths.
var PathsLoader = function(game, json) {
    this.game = game;
    this.json = json;
};

// Convenience method that handles instantiating the loader.
PathsLoader.load = function(game, json) {
    return new PathsLoader(game, json)._load();
};

// Load a JSON representation of points and paths.
PathsLoader.prototype._load = function() {
    this.paths = new Paths(this.game);
    var points = {};
    var keys = Object.keys(this.json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = this.json[key];
        var point = this.paths.point(pointObj.x, pointObj.y);
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
    return this.paths;
};

// Given a JSON name for a point ("p1"), return its index (1).
PathsLoader.prototype._indexOf = function(key) {
    return parseInt(key.substring(1));
}
