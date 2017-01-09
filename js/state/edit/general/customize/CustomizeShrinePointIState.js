// Set up a checkpoint.
var CustomizeShrinePointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, ShrinePoint, 1);
    this.showArrows = false;
};

CustomizeShrinePointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeShrinePointIState.prototype.constructor = CustomizeShrinePointIState;


// Update loop.
CustomizeShrinePointIState.prototype.update = function() {
    this.finished(new ShrinePoint());
};
