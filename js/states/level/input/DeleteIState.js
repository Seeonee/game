// Handle point and path deletion.
var DeleteIState = function(handler, level) {
    IState.call(this, DeleteIState.NAME, handler);
    this.avatar = level.avatar;
};

DeleteIState.NAME = 'delete';
DeleteIState.prototype = Object.create(IState.prototype);
DeleteIState.prototype.constructor = DeleteIState;

// Some constants.
DeleteIState.threshold = 1000; // ms

// Action for deleting nodes and paths.
DeleteIState.prototype.activated = function(prev) {
    this.start = this.game.time.now;
    this.avatar.children[0].tint = this.game.settings.colors.RED.i;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
}

// Handle an update while holding the button.
DeleteIState.prototype.update = function() {
    var elapsed = Math.min(this.game.time.now - this.start,
        DeleteIState.threshold);
    var ratio = elapsed / DeleteIState.threshold;
    if (ratio == 1) {
        this.avatar.children[0].tint = this.game.settings.colors.GREY.i;
    }
    if (this.gpad.justReleased(this.buttonMap.DELETE_BUTTON)) {
        if (this.avatar.point) {
            if (ratio < 1) {
                // Delete the point and its paths.
                this.avatar.paths.deletePoint(this.avatar.point);
            } else {
                // Delete the point, merge its paths.
                this.avatar.paths.deletePointAndMerge(this.avatar.point);
            }
            this.avatar.point = undefined;
        } else if (this.avatar.path) {
            this.avatar.paths.deletePath(this.avatar.path);
            this.avatar.path = undefined;
        }
        this.avatar.children[0].tint = this.avatar.graphics.COLOR;
        this.activate(DefaultLevelIState.NAME);
    }
};
