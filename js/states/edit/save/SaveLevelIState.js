// A state where you can press X to open the 
// level's JSON in a new window.
var SaveLevelIState = function(handler, level) {
    IState.call(this, SaveLevelIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

SaveLevelIState.NAME = 'save level';
SaveLevelIState.prototype = Object.create(IState.prototype);
SaveLevelIState.prototype.constructor = SaveLevelIState;


// Called when we become the active state.
SaveLevelIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.avatar.help.setText('save');
    this.chargedTime = -1;
};

// Called when we become the active state.
SaveLevelIState.prototype.deactivated = function(next) {
    if (this.image) {
        this.image.destroy();
    }
};

// Called on update.
SaveLevelIState.prototype.update = function() {
    if (this.handler.cycle()) {
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
            Utils.writeJSONToNewTab(this.level);
        }
        this.chargedTime = -1;
    } else {
        return false;
    }
};
