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
    var result = false;
    if (this.slash.lockedOut) {
        result = true;
    } else if (this.slash.coolingDown) {
        // Noop.
    } else if (this.gpad.justPressed(this.buttonMap.POWER)) {
        this.gpad.consumeButtonEvent();
        this.pressed = true;
        this.avatar.stopMovement();
        this.avatar.setBobble(true);
        this.avatar.setPressed(true);

        this.avatar.tierMeter.setPowerPressed(true);
        this.slash.arm(this.gpad.getAngleAndTilt());
        result = true;
    } else if (this.pressed) {
        this.slash.turnTo(this.gpad.getAngleAndTilt());
        if (this.gpad.justReleased(this.buttonMap.POWER)) {
            this.gpad.consumeButtonEvent();
            this.pressed = false;
            this.slashing = true;
            this.avatar.tierMeter.usePower();
            this.avatar.tierMeter.setPowerPressed(false);
            this.avatar.setBobble(false);
            this.avatar.setPressed(false);

            this.slash.slash();
        }
        result = true;
    }
    if (result) {
        this.avatar.checkCollision();
    }
    return result;
};

// Cancel everything that's underway.
SlashIState.prototype.release = function() {
    this.slash.nevermind();
};
