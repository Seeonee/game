// Handle tier advances.
// Steps to the next tier up, wrapping at the top.
var PortalIState = function(handler, level) {
    IState.call(this, PortalIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.reactivateTime = -1;
};

PortalIState.NAME = 'portal';
PortalIState.prototype = Object.create(IState.prototype);
PortalIState.prototype.constructor = PortalIState;

// Constants.
PortalIState.REACTIVATE_DELAY = 100; // ms

// Handle an update.
PortalIState.prototype.update = function() {
    var time = this.game.time.now;
    if (time < this.reactivateTime) {
        return;
    }
    if (this.avatar.point.isEnabled() &&
        this.gpad.justReleased(this.buttonMap.PORTAL)) {
        this.reactivateTime = time + PortalIState.REACTIVATE_DELAY;
        this.gpad.consumeButtonEvent();
        var direction = 1;
        var pointName = 'p0';
        if (this.avatar.point instanceof PortalPoint) {
            pointName = this.avatar.point.to;
            direction = this.avatar.point.direction;
        }
        this.level.advanceTierUp(pointName, direction);
    } else {
        return false;
    }
};
