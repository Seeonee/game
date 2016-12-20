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
        this.activate(GeneralEditIState.NAME);
        return;
    }
    var p = Utils.findClosestPointToAvatar(
        t, this.level.avatar);
    this.level.advanceTierUp(p);
    this.activate(GeneralEditIState.NAME);
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
        this.activate(GeneralEditIState.NAME);
        return;
    }
    var p = Utils.findClosestPointToAvatar(
        t, this.level.avatar);
    this.level.advanceTierDown(p);
    this.activate(GeneralEditIState.NAME);
    this.avatar.tierMeter.showBriefly();
};
