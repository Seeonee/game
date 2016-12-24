// Set the end gate.
var CustomizeEndPointIState = function(handler, level) {
    var optionName = 'start enabled';
    var options = [{ value: true }, { value: false }];
    OptionSetGathererIState.call(this, handler, level, EndPoint, 1,
        optionName, options);
    new CustomizeEndPoint2IState(handler, level);
};

CustomizeEndPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeEndPointIState.prototype.constructor = CustomizeEndPointIState;








// Set the end gate.
var CustomizeEndPoint2IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, EndPoint, 2);
    this.showArrows = false;
};

CustomizeEndPoint2IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeEndPoint2IState.prototype.constructor = CustomizeEndPoint2IState;


// Update loop.
CustomizeEndPoint2IState.prototype.update = function() {
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
    var options = this.prev.gatherOptions();
    var point = new EndPoint();
    point.enabled = options['start enabled'];
    this.finished(point); // Activates previous.
};
