// Clear a point.
var CustomizeNormalPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, Point, 1);
    this.showArrows = false;
};

CustomizeNormalPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeNormalPointIState.prototype.constructor = CustomizeNormalPointIState;


// Update loop.
CustomizeNormalPointIState.prototype.update = function() {
    this.finished(new Point()); // Activates previous.
};
