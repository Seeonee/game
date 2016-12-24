// Clear a point.
var CustomizeNormalPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Point, 1);
    this.showArrows = false;
};

CustomizeNormalPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeNormalPointIState.prototype.constructor = CustomizeNormalPointIState;


// Update loop.
CustomizeNormalPointIState.prototype.update = function() {
    if (this.point instanceof PortalPoint) {
        // Clear the other side, too.
        var to = this.point.to;
        if (this.point.direction > 0) {
            var tier = this.level.getNextTierUp();
        } else {
            var tier = this.level.getNextTierDown();
        }
        var other = tier.pointMap[to];
        tier.replacePoint(other, new Point());
    } else if (this.point instanceof SwitchPoint) {
        // TODO: Break all wires?
    }
    this.finished(new Point()); // Activates previous.
};
