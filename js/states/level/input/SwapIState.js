// Handle tier advances.
// Steps to the next tier up, wrapping at the top.
var StepUpIState = function(handler, level) {
    IState.call(this, StepUpIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

StepUpIState.NAME = 'stepUp';
StepUpIState.prototype = Object.create(IState.prototype);
StepUpIState.prototype.constructor = StepUpIState;

// Handle an update.
StepUpIState.prototype.update = function() {
    this.gpad.consumeButtonEvent();
    var tier = this.level.advanceTierUp();
    if (tier) {
        var point = tier.points[0];
        var gp = tier.translateInternalPointToGamePoint(
            point.x, point.y);
        this.avatar.tier = tier;
        this.avatar.point = point;
        this.avatar.x = gp.x;
        this.avatar.y = gp.y;
    }
    this.activate(DefaultLevelIState.NAME);
};

// Handle tier retreats.
// Steps to the next tier up, wrapping at the top.
var StepDownIState = function(handler, level) {
    IState.call(this, StepDownIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

StepDownIState.NAME = 'stepDown';
StepDownIState.prototype = Object.create(IState.prototype);
StepDownIState.prototype.constructor = StepDownIState;

// Handle an update.
StepDownIState.prototype.update = function() {
    this.gpad.consumeButtonEvent();
    var tier = this.level.advanceTierDown();
    if (tier) {
        var point = tier.points[0];
        var gp = tier.translateInternalPointToGamePoint(
            point.x, point.y);
        this.avatar.tier = tier;
        this.avatar.point = point;
        this.avatar.x = gp.x;
        this.avatar.y = gp.y;
    }
    this.activate(DefaultLevelIState.NAME);
};
