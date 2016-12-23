// Set the start point.
var CustomizeStartPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, StartPoint, 1);
};

CustomizeStartPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeStartPointIState.prototype.constructor = CustomizeStartPointIState;


// Update loop.
CustomizeStartPointIState.prototype.update = function() {
    // Find and nil out the current start.
    OUTER: for (var i = 0; i < this.level.tiers.length; i++) {
        var tier = this.level.tiers[i];
        for (var j = 0; j < tier.points.length; j++) {
            var point = tier.points[j];
            if (point instanceof StartPoint) {
                tier.replacePoint(point, new Point());
                break OUTER;
            }
        }
    }
    this.finished(new StartPoint()); // Activates previous.
};
