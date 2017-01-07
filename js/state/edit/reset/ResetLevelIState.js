// A state where you can press X to restart 
// the level, using the current JSON.
var ResetLevelIState = function(handler, level) {
    IState.call(this, ResetLevelIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

ResetLevelIState.NAME = 'reset level';
ResetLevelIState.prototype = Object.create(IState.prototype);
ResetLevelIState.prototype.constructor = ResetLevelIState;


// Called when we become the active state.
ResetLevelIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.avatar.htext.setText(EditLevelIHandler.addArrows(
        'restart with changes'));
    this.chargedTime = -1;
};

// Called when we become the inactive state.
ResetLevelIState.prototype.deactivated = function(next) {
    if (this.image) {
        this.image.destroy();
    }
};

// Called on update.
ResetLevelIState.prototype.update = function() {
    if (this.chargedTime < 0 && this.handler.cycle()) {
        return this.handler.state.update();
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.chargedTime = this.game.time.now + EditCharge.TIME;
        this.image = new EditCharge(this.game,
            this.avatar.x, this.avatar.y,
            this.level.tier.palette, true);
        this.game.state.getCurrentState().z.mg.tier().add(this.image);
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.image.destroy();
        if (this.game.time.now > this.chargedTime) {
            this.game.state.getCurrentState().restartLevel();
        }
        this.chargedTime = -1;
    } else {
        return false;
    }
};
