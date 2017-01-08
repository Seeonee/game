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
    var text = EditLevelIHandler.addArrows('test');
    this.avatar.htext.setText(text);
    this.avatar.htext.animate = true;
    this.avatar.htext.setEmptyText(text);

    // Reset text.
    this.level.textsSeen.clear();
    for (var i = 0; i < this.level.tiers.length; i++) {
        var t = this.level.tiers[i];
        for (var j = 0; j < t.objects.length; j++) {
            t.objects[j].textSeen = undefined;
        }
    }

    this.game.settings.edit = false;

    if (this.avatar.point) {
        this.avatar.point.notifyAttached(this.avatar);
    } else if (this.avatar.path) {
        this.avatar.path.notifyAttached(this.avatar);
    }
};

// Called when we become the inactive state.
TestLevelIState.prototype.deactivated = function(next) {
    this.avatar.htext.animate = false;
    this.avatar.htext.setEmptyText();
    this.avatar.htext.clearHold();
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
