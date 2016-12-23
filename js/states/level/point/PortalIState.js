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


// Called when stepped on.
PortalIState.prototype.activated = function(prev) {
    this.pressed = false;
};

// Handle an update.
PortalIState.prototype.update = function() {
    var time = this.game.time.now;
    if (time < this.reactivateTime) {
        return;
    }
    if (!this.avatar.point.isEnabled()) {
        return false;
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
    } else if (this.pressed &&
        this.gpad.released(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.pressed = false;
        this.reactivateTime = time + PortalIState.REACTIVATE_DELAY;
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
