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
    this.falseStart = false;
    this.deleting = false;
    this.doneDeleting = false;
    if (this.avatar.point) {
        this.avatar.help.setText('delete ' + this.avatar.point.name);
    } else if (this.avatar.path) {
        this.avatar.help.setText('delete ' + this.avatar.path.name);
    } else {
        this.falseStart = true;
        return;
    }
    this.tier = this.level.tier;
    this.start = this.game.time.now;

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
    if (this.falseStart) {
        this.activate(GeneralEditIState.NAME);
    } else if (!this.actingOnTier) {
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
    if (this.deleting) {
        if (this.doneDeleting) {
            this.gpad.consumeButtonEvent();
            this.activate(GeneralEditIState.NAME);
        }
        return;
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.image.destroy();
        this.deleteTier();
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
        return false;
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
        this.cleanUpPoint(point);
        this.avatar.point = undefined;
    }
    return true;
};

// Some points require extra care.
DeleteIState.prototype.cleanUpPoint = function(point) {
    if (point instanceof PortalPoint) {
        this.cleanUpPortalPoint(point);
    }
};

// If it's a portal, "normalize" the other end.
DeleteIState.prototype.cleanUpPortalPoint = function(point) {
    var tier = point.direction > 0 ?
        this.level.getNextTierUp() : this.level.getNextTierDown()
    var other = tier.pointMap[point.to];
    tier.replacePoint(other, new Point());
};

// Delete this entire tier, and snap to an adjacent 
// (ideally lower) one.
DeleteIState.prototype.deleteTier = function() {
    this.cleanUpPoint(this.avatar.point);
    var tier = this.level.tier;
    var fallback = this.level.getNextTierDown();
    if (!fallback) {
        fallback = this.level.getNextTierUp();
    }
    var p = Utils.findClosestPointToAvatar(
        fallback, this.level.avatar);

    this.level.events.onTierChange.remove(
        this.avatar.tierMeter.setTier, this.avatar.tierMeter);

    this.level.setTier(fallback, p);
    this.avatar.help.setText('tier: ' + fallback.name, true, true);
    this.deleting = true;
    tier.events.onFadedOut.add(this.finishDeletingTier,
        this, tier);
};


// Called once the old tier has fully faded.
DeleteIState.prototype.finishDeletingTier = function(tier) {
    var i = tier.index;
    var t1 = tier;
    while (this.level.tierMap['t' + (i + 1)]) {
        var t2 = this.level.tierMap['t' + (i + 1)];
        t1.name = t2.name;
        t1.index = t2.index;
        t1.palette = t2.palette;
        this.level.tierMap[t1.name] = t2;
        t1 = t2;
        i += 1;
    }
    delete this.level.tierMap['t' + i];
    var index = this.level.tiers.indexOf(tier);
    this.level.tiers.splice(index, 1);
    tier.delete();
    this.avatar.tierMeter.recreate();
    this.avatar.tierMeter.setTier(this.level.tier);
    this.level.events.onTierChange.add(
        this.avatar.tierMeter.setTier, this.avatar.tierMeter);
    this.avatar.tierMeter.showBriefly();
    this.doneDeleting = true;
};
