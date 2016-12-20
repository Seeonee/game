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
    var t = this.level.getNextTierUp();
    if (!t) {
        return;
    }
    var p = StepUpIState.findClosestPointToAvatar(
        t, this.level.avatar);
    if (!p) {
        return;
    }
    this.level.advanceTierUp(p);
    this.activate(EditOverlayIState.NAME);
    this.avatar.tierMeter.showBriefly();
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
    var t = this.level.getNextTierDown();
    if (!t) {
        return;
    }
    var p = StepUpIState.findClosestPointToAvatar(
        t, this.level.avatar);
    if (!p) {
        return;
    }
    this.level.advanceTierDown(p);
    this.activate(EditOverlayIState.NAME);
    this.avatar.tierMeter.showBriefly();
};


// "Utility" method for finding the closest point.
StepUpIState.findClosestPointToAvatar = function(tier, avatar) {
    var min = Number.POSITIVE_INFINITY;
    var name = undefined;
    var ip = tier.translateGamePointToInternalPoint(avatar.x, avatar.y);
    for (var i = 0; i < tier.points.length; i++) {
        var p = tier.points[i];
        var d = Utils.distanceBetweenPoints(ip.x, ip.y, p.x, p.y);
        if (d < min || !name) {
            min = d;
            name = p.name;
        }
    }
    return name;
};
