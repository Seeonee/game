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
    this.pressed = false;
    this.avatar.setBobble(true);

    this.point = this.avatar.point;
    this.switch = this.avatar.point.switch;
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
    this.avatar.setBobble(false);
    this.avatar.setPressed(false);
    if (!this.done && this.contact) {
        this.point.flip();
    }
};

// Handle an update.
SwitchIState.prototype.update = function() {
    var time = this.game.time.now;
    if (this.done || this.contact || time < this.reactivateTime) {
        return false;
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setBobble(false);
        this.avatar.setPressed(true);
        this.pressed = true;
        this.switch.setPressed(true);
    } else if (this.pressed &&
        this.gpad.released(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setBobble(true);
        this.avatar.setPressed(false);
        this.pressed = false;
        this.point.setPressed(false);
        this.point.flip();
        this.reactivateTime = time + SwitchIState.REACTIVATE_DELAY;
    } else {
        return false;
    }
};
