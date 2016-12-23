// Handle various types of switch.
var SwitchIState = function(handler, level) {
    IState.call(this, SwitchIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.reactivateTime = -1;
};

SwitchIState.NAME = 'switch';
SwitchIState.prototype = Object.create(IState.prototype);
SwitchIState.prototype.constructor = SwitchIState;

// Constants.
SwitchIState.REACTIVATE_DELAY = 100; // ms


// Called on activate.
SwitchIState.prototype.activated = function(prev) {
    this.point = this.avatar.point;
    this.switch = this.avatar.point.switch;
    this.closed = this.point.closed;
    this.once = this.point.once;
    this.contact = this.point.contact;
    this.done = this.point.done;

    if (!this.done && this.contact) {
        this.point.flip();
    }
};

// Called on deactivate.
SwitchIState.prototype.deactivated = function(prev) {
    this.point.setPressed(false);
    if (!this.done && this.contact) {
        this.point.flip();
    }
};

// Handle an update.
SwitchIState.prototype.update = function() {
    var time = this.game.time.now;
    if (this.done || this.contact || time < this.reactivateTime ||
        !this.point.isEnabled()) {
        return false;
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.switch.setPressed(true);
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.point.setPressed(false);
        this.point.flip();
        this.reactivateTime = time + SwitchIState.REACTIVATE_DELAY;
    } else {
        return false;
    }
};
