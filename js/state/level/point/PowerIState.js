// Handle purchasing a power.
var PowerIState = function(handler, level) {
    IState.call(this, PowerIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

PowerIState.NAME = 'power';
PowerIState.prototype = Object.create(IState.prototype);
PowerIState.prototype.constructor = PowerIState;


// Called on activate.
PowerIState.prototype.activated = function(prev) {
    this.pressed = false;
    this.point = this.avatar.point;
    this.avatar.setBobble(this.point.isEnabled());
};

// Called on deactivate.
PowerIState.prototype.deactivated = function(prev) {
    this.avatar.setBobble(false);
    this.avatar.setPressed(false);
};

// Handle an update.
PowerIState.prototype.update = function() {
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setBobble(false);
        this.avatar.setPressed(true);
        this.pressed = true;
    } else if (this.pressed &&
        this.gpad.released(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setPressed(false);
        this.pressed = false;
        this.point.purchase(this.level);
        this.activate(undefined);
    } else {
        this.avatar.setBobble(this.point.isEnabled());
        return false;
    }
};
