// Set the end gate.
var CustomizeEndPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, EndPoint, 1);
};

CustomizeEndPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeEndPointIState.prototype.constructor = CustomizeEndPointIState;


// Update loop.
CustomizeEndPointIState.prototype.update = function() {
    // Find and nil out the current end gate.
    OUTER: for (var i = 0; i < this.level.tiers.length; i++) {
        var tier = this.level.tiers[i];
        for (var j = 0; j < tier.points.length; j++) {
            var point = tier.points[j];
            if (point instanceof EndPoint) {
                tier.replacePoint(point, new Point());
                break OUTER;
            }
        }
    }
    this.finished(new EndPoint()); // Activates previous.
};
