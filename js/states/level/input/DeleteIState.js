// Handle point and path deletion.
var DeleteIState = function(handler, level) {
    IState.call(this, DeleteIState.NAME, handler);
    this.tier = level.tier;
    this.avatar = level.avatar;
};

DeleteIState.NAME = 'delete';
DeleteIState.prototype = Object.create(IState.prototype);
DeleteIState.prototype.constructor = DeleteIState;

// Some constants.
DeleteIState.THRESHOLD = 700; // ms
DeleteIState.STARTING_RADIUS = 25;
DeleteIState.ENDING_RADIUS = 5;
DeleteIState.PATH_WIDTH = 4;

// Action for deleting nodes and paths.
DeleteIState.prototype.activated = function(prev) {
    this.start = this.game.time.now;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    // Initialize bitmap for rendering.
    this.bitmap = this.game.add.bitmapData(
        DeleteIState.STARTING_RADIUS * 4,
        DeleteIState.STARTING_RADIUS * 4);
    this.bitmap.context.strokeStyle = this.game.settings.colors.RED.s;
    this.bitmap.context.fillStyle = this.game.settings.colors.RED.s;
    this.bitmap.context.lineWidth = DeleteIState.PATH_WIDTH;
    this.image = this.game.add.image(
        this.avatar.x - (this.bitmap.width / 2),
        this.avatar.y - (this.bitmap.height / 2),
        this.bitmap);
    this.game.state.getCurrentState().z.mg.add(this.image);
    this.renderNeeded = true;
}

// Render the deletion progress indicator.
DeleteIState.prototype.render = function() {
    if (!this.renderNeeded) {
        return;
    }
    var elapsed = Math.min(this.game.time.now - this.start,
        DeleteIState.THRESHOLD);
    var ratio = 1 - (elapsed / DeleteIState.THRESHOLD);
    ratio = (this.avatar.point) ? Math.sqrt(ratio) : 0.2;

    this.bitmap.context.clearRect(0, 0,
        this.bitmap.width, this.bitmap.height);
    this.bitmap.context.beginPath();
    var radius = DeleteIState.ENDING_RADIUS +
        (ratio * (DeleteIState.STARTING_RADIUS -
            DeleteIState.ENDING_RADIUS));
    this.bitmap.context.arc(
        DeleteIState.STARTING_RADIUS * 2,
        DeleteIState.STARTING_RADIUS * 2,
        radius, 0, 2 * Math.PI, false);
    this.bitmap.context.stroke();
    if (ratio == 0) {
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
    if (ratio == 0 || this.avatar.path) {
        this.renderNeeded = false;
    }
};

// Handle an update while holding the button.
DeleteIState.prototype.update = function() {
    var elapsed = Math.min(this.game.time.now - this.start,
        DeleteIState.THRESHOLD);
    var ratio = elapsed / DeleteIState.THRESHOLD;
    if (this.gpad.justReleased(this.buttonMap.DELETE_BUTTON)) {
        if (this.avatar.point) {
            if (ratio < 1) {
                // Delete the point and its paths.
                this.tier.deletePoint(this.avatar.point);
            } else {
                // Delete the point, merge its paths.
                this.tier.deletePointAndMerge(this.avatar.point);
            }
            this.avatar.point = undefined;
        } else if (this.avatar.path) {
            this.tier.deletePath(this.avatar.path);
            this.avatar.path = undefined;
        }
        this.image.destroy();
        this.activate(DefaultLevelIState.NAME);
    }
};
