// "Edit off" state that simulates actual play.
// Basically lets all input fall through.
var TestLevelIState = function(handler, level) {
    IState.call(this, TestLevelIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

TestLevelIState.NAME = 'test level';
TestLevelIState.prototype = Object.create(IState.prototype);
TestLevelIState.prototype.constructor = TestLevelIState;


// Called when we become the active state.
TestLevelIState.prototype.activated = function(prev) {
    this.avatar.help.setText(EditLevelIHandler.addArrows('test'));
    this.game.settings.edit = false;
    if (this.avatar.point) {
        this.avatar.point.notifyAttached(this.avatar);
    }
};

// Called when we become the active state.
TestLevelIState.prototype.deactivated = function(next) {
    if (this.avatar.point) {
        this.avatar.point.notifyDetached(this.avatar);
    }
    this.game.settings.edit = true;
};

// Called on update.
TestLevelIState.prototype.update = function() {
    if (this.handler.cycle()) {
        return this.handler.state.update();
    }
    return false;
};
