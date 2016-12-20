// Handle point and path deletion.
var DeleteIState = function(handler, level) {
    IState.call(this, DeleteIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

DeleteIState.NAME = 'delete';
DeleteIState.prototype = Object.create(IState.prototype);
DeleteIState.prototype.constructor = DeleteIState;

// Some constants.
DeleteIState.THRESHOLD = 700; // ms

// Action for deleting nodes and paths.
DeleteIState.prototype.activated = function(prev) {
    this.actingOnTier = false;
    if (this.avatar.point) {
        this.avatar.help.setText('delete ' + this.avatar.point.name);
    } else {
        this.avatar.help.setText('delete ' + this.avatar.path.name);
    }
    this.tier = this.level.tier;
    this.start = this.game.time.now;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    // Initialize bitmap for rendering.
    this.image = new EditCharge(this.game,
        this.avatar.x, this.avatar.y, this.level.tier.palette,
        this.avatar.point != undefined);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    if (this.image.tween) {
        this.image.tween.onComplete.add(function() {
            this.avatar.help.setText('delete ' +
                this.avatar.point.name + ' /\nmerge paths');
        }, this);
    }
};

// Clean up.
DeleteIState.prototype.deactivated = function(next) {
    this.image.destroy();
};

// Handle an update while holding the button.
DeleteIState.prototype.update = function() {
    if (!this.actingOnTier) {
        return this.updateForPointsAndPaths();
    } else {
        return this.updateForTier();
    }
};

// Handle an update while holding the button.
DeleteIState.prototype.updateForPointsAndPaths = function() {
    var elapsed = Math.min(this.game.time.now - this.start,
        DeleteIState.THRESHOLD);
    var ratio = elapsed / DeleteIState.THRESHOLD;
    if (this.gpad.justReleased(this.buttonMap.EDIT_DELETE)) {
        this.gpad.consumeButtonEvent();
        if (this.avatar.point) {
            if (!this.deletePoint(this.avatar.point, ratio >= 1)) {
                this.avatar.help.setText('delete failed', true);
            }
        } else if (this.avatar.path) {
            this.tier.deletePath(this.avatar.path);
            this.avatar.path = undefined;
        }
        if (!this.actingOnTier) {
            this.image.destroy();
            this.activate(GeneralEditIState.NAME);
        }
    }
};

// Handle an update while prompting about the tier.
DeleteIState.prototype.updateForTier = function() {
    if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.deleteTier();
        this.image.destroy();
        this.activate(GeneralEditIState.NAME);
    } else if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.gpad.consumeButtonEvent();
        this.image.destroy();
        this.activate(GeneralEditIState.NAME);
    }
};

// Attempt to delete a point. Returns success/fail.
// May also set the "we're now looking to delete the tier"
// flag.
DeleteIState.prototype.deletePoint = function(point, merge) {
    if (point instanceof StartPoint ||
        point instanceof EndPoint) {
        if (this.tier.points.length > 1) {
            return false;
        }
    }
    var success = false;
    if (merge) {
        // Delete the point, merge its paths.
        success = this.tier.deletePointAndMerge(point);
    } else {
        // Delete the point and its paths.
        success = this.tier.deletePoint(point);
    }
    if (!success) {
        // This is the last point in the tier.
        // Prompt the user.
        this.actingOnTier = true;
        this.image.finish();
        this.avatar.help.setText('delete tier ' +
            this.level.tier.name + '?');
    } else {
        if (point instanceof PortalPoint) {
            this.cleanUpPortalPoint(point);
        }
        this.avatar.point = undefined;
    }
    return true;
};

// If it's a portal, "normalize" the other end.
DeleteIState.prototype.cleanUpPortalPoint = function(point) {
    // TODO: !!!
    console.log('!!! cleaning other end of portal');
};

// Delete this entire tier, and snap to an adjacent 
// (lower?) one.
DeleteIState.prototype.deleteTier = function(point) {
    // TODO: !!!
    console.log('!!! deleting tier');
};
