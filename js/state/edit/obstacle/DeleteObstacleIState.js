// Handle object deletion.
var DeleteObstacleIState = function(handler, level) {
    IState.call(this, DeleteObstacleIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

DeleteObstacleIState.NAME = 'delete object';
DeleteObstacleIState.prototype = Object.create(IState.prototype);
DeleteObstacleIState.prototype.constructor = DeleteObstacleIState;


// Activated.
DeleteObstacleIState.prototype.activated = function(prev) {
    this.tier = this.level.tier;
    this.obstacle = prev.obstacle;
    this.timeToCharge = EditCharge.TIME;
    this.avatar.htext.setText('delete ' + this.obstacle.name + '?');
    this.eventTime = this.game.time.now + this.timeToCharge;

    this.image = new EditCharge(this.game,
        this.obstacle.x, this.obstacle.y, this.tier.palette,
        true, this.timeToCharge);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
};

// Clean up.
DeleteObstacleIState.prototype.deactivated = function(next) {
    this.image.destroy();
};

// Back to where we came from.
DeleteObstacleIState.prototype.cancel = function() {
    this.activate(ObstacleEditorIState.NAME);
};

// After a successful delete, proceed to floating.
DeleteObstacleIState.prototype.proceed = function() {
    this.activate(ObstacleEditorIState.NAME);
};

// Handle an update while holding the button.
DeleteObstacleIState.prototype.update = function() {
    this.charged = this.game.time.now > this.eventTime;
    if (this.charged) {
        this.avatar.htext.setText('delete ' + this.obstacle.name);
    }
    if (this.gpad.released(this.buttonMap.EDIT_DELETE)) {
        this.gpad.consumeButtonEvent();
        if (!this.charged) {
            this.cancel();
            return;
        }
        this.tier.deleteObstacle(this.obstacle);
        this.proceed();
    }
};
