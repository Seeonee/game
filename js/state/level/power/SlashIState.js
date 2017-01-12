// Handle the slash power.
var SlashIState = function(handler, level) {
    IState.call(this, SlashIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

SlashIState.NAME = 'sword';
SlashIState.prototype = Object.create(IState.prototype);
SlashIState.prototype.constructor = SlashIState;

// Constants.


// Called when obtained.
SlashIState.prototype.activated = function(prev) {
    this.pressed = false;
    this.slash = this.avatar.power;
};

// Called when lost.
SlashIState.prototype.deactivated = function(next) {
    this.avatar.tierMeter.setPowerPressed(false);
    this.pressed = false;
};

// Handle an update.
SlashIState.prototype.update = function() {
    if (this.slashing) {
        return;
    }
    if (this.gpad.justPressed(this.buttonMap.POWER)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
        this.avatar.stopMovement();

        this.avatar.tierMeter.setPowerPressed(true);
        this.slash.arm(this.gpad.getAngleAndTilt());
    } else if (this.pressed) {
        this.slash.turnTo(this.gpad.getAngleAndTilt());
        if (this.gpad.justReleased(this.buttonMap.POWER)) {
            this.gpad.consumeButtonEvent();
            this.pressed = false;
            this.slashing = true;
            this.avatar.tierMeter.usePower();
            this.avatar.tierMeter.setPowerPressed(false);

            this.slash.slash(function() {
                this.slashing = false;
            }, this);
        }
    } else {
        return false;
    }
};

// Cancel everything that's underway.
SlashIState.prototype.release = function() {
    this.slashing = false;
    this.slash.nevermind();
};
