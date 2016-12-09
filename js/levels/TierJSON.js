// Class that handles writing a tier out to JSON.
var TierWriter = function(tier) {
    this.tier = tier;
    this.pointsVisited = {};
    this.pointMap = {};
    this.index = 0;
};

// Convenience method that handles instantiating the writer.
TierWriter.json = function(tier) {
    return new TierWriter(tier)._json();
};

// Push out a JSON version of our points and paths.
// We translate all our points so that 
// p1 is at (0, 0).
TierWriter.prototype._json = function() {
    var minx = this.tier.points[0].x;
    var miny = this.tier.points[0].y;
    var result = '';
    for (var i = 0; i < this.tier.points.length; i++) {
        var point = this.tier.points[i];
        result += '\n"' + point.name + '": {\n';
        result += '"x": ' + (point.x - minx) + ',\n';
        result += '"y": ' + (point.y - miny) + ',\n';
        result += '"pathsTo": [\n';
        for (var j = 0; j < point.paths.length; j++) {
            var path = point.paths[j];
            var other = path.getCounterpoint(point);
            result += '"' + other.name + '"';
            if (j < point.paths.length - 1) {
                result += ',\n';
            }
        }
        result += ']\n}';
        if (i < this.tier.points.length - 1) {
            result += ',\n';
        }
    }
    return '{' + result + '\n}';
};



// Class that handles loading JSON data as a tier.
var TierLoader = function(game, json) {
    this.game = game;
    this.json = json;
};

TierLoader.OFFSET = 5;

// Convenience method that handles instantiating the loader.
TierLoader.load = function(game, json) {
    return new TierLoader(game, json)._load();
};

// Load a JSON representation of points and paths.
// We also translate all loaded points so that 
// all points have sufficiently positive x and y.
TierLoader.prototype._load = function() {
    var minx = Number.POSITIVE_INFINITY;
    var miny = Number.POSITIVE_INFINITY;
    this.tier = new Tier(this.game);
    var points = {};
    var keys = Object.keys(this.json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = this.json[key];
        var point = this.tier.addPoint(key, pointObj.x, pointObj.y);
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
    for (var i = 0; i < this.tier.points.length; i++) {
        var point = this.tier.points[i];
        point.x += (TierLoader.OFFSET - minx);
        point.y += (TierLoader.OFFSET - miny);
    }
    return this.tier;
};

// Given a JSON name for a point ("p1"), return its index (1).
TierLoader.prototype._indexOf = function(key) {
    return parseInt(key.substring(1));
}
