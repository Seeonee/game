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

    this.point = this.avatar.point;
    this.switch = this.avatar.point.switch;
    this.contact = this.point.contact;

    if (!this.point.done && this.contact) {
        if (this.avatar.held && this.avatar.held.subtype == 'lightning') {
            this.avatar.held.useUp();
            this.point.once = true;
        }
        this.point.flip();
    }
};

// Called on deactivate.
SwitchIState.prototype.deactivated = function(prev) {
    this.point.setPressed(false);
    this.avatar.setBobble(false);
    this.avatar.setPressed(false);
    if (!this.point.done && this.contact) {
        this.point.flip();
    }
};

// Handle an update.
SwitchIState.prototype.update = function() {
    var time = this.game.time.now;
    if (this.point.done || this.contact || time < this.reactivateTime) {
        this.avatar.setBobble(false);
        this.pressed = false;
        return false;
    }
    this.avatar.setBobble(true);
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
