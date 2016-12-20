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
    console.log('now testing!');
    this.game.settings.edit = false;
};

// Called when we become the active state.
TestLevelIState.prototype.deactivated = function(next) {
    this.game.settings.edit = true;
    console.log('back to editing!');
};

// Called on update.
TestLevelIState.prototype.update = function() {
    if (this.handler.cycle()) {
        return this.handler.state.update();
    }
    return false;
}
