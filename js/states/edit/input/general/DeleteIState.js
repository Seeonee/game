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
    this.prev = prev;

    if (prev instanceof FloatIState) {
        this.point = prev.point;
        this.path = prev.path;
    } else {
        this.point = avatar.point;
        this.path = avatar.path;
    }

    this.actingOnTier = false;
    this.falseStart = false;
    this.deleting = false;
    this.doneDeleting = false;
    this.chargedTime = this.game.time.now + DeleteIState.THRESHOLD;
    this.tier = this.level.tier;
    if (this.point) {
        this.actingOnTier = this.tier.points.length == 1;
        if (this.actingOnTier) {
            this.avatar.help.setText('delete tier ' + this.tier.name);
        } else {
            this.avatar.help.setText('delete ' + this.point.name);
        }
    } else if (this.avatar) {
        this.avatar.help.setText('delete ' + this.avatar.name);
    } else {
        this.falseStart = true;
        return;
    }

    this.image = new EditCharge(this.game,
        this.avatar.x, this.avatar.y, this.tier.palette,
        this.point != undefined);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    if (this.image.tween && !this.actingOnTier) {
        this.image.tween.onComplete.add(function() {
            this.avatar.help.setText('delete ' +
                this.point.name + ' /\nmerge paths');
        }, this);
    }
};

// Clean up.
DeleteIState.prototype.deactivated = function(next) {
    this.image.destroy();
};

// Handle an update while holding the button.
DeleteIState.prototype.update = function() {
    this.charged = this.game.time.now > this.chargedTime;
    if (this.falseStart) {
        this.activate(this.prev.name);
    } else if (this.actingOnTier) {
        return this.updateForTier();
    } else {
        return this.updateForPointsAndPaths();
    }
};

// Handle an update while holding the button.
DeleteIState.prototype.updateForPointsAndPaths = function() {
    if (this.gpad.justReleased(this.buttonMap.EDIT_DELETE)) {
        this.gpad.consumeButtonEvent();
        if (this.point) {
            if (!this.deletePoint(this.point, this.charged)) {
                this.avatar.help.setText('delete failed', true);
            }
        } else if (this.path) {
            this.tier.deletePath(this.path);
            this.avatar.path = undefined;
        }
        this.activate(FloatIState.NAME);
    }
};

// Handle an update while prompting about the tier.
DeleteIState.prototype.updateForTier = function() {
    if (this.deleting && !this.doneDeleting) {
        return;
    }
    if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        if (this.charged) {
            this.gpad.consumeButtonEvent();
            this.deleteTier();
            this.activate(this.prev.name);
        } else {
            this.activate(this.prev.name);
        }
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
    if (merge) {
        // Delete the point, merge its paths.
        this.tier.deletePointAndMerge(point);
    } else {
        // Delete the point and its paths.
        this.tier.deletePoint(point);
    }
    this.cleanUpPoint(point);
    this.avatar.point = undefined;
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
    if (this.level.tiers.length == 1) {
        this.avatar.help.setText('delete failed', true);
        return;
    }
    this.cleanUpPoint(this.point);
    var tier = this.level.tier;
    var fallback = this.level.getNextTierDown();
    if (!fallback) {
        fallback = this.level.getNextTierUp();
    }
    var p = Utils.findClosestPointToAvatar(
        fallback, this.level.avatar);

    this.level.events.onTierChange.remove(
        this.avatar.tierMeter.setTier, this.avatar.tierMeter);

    tier.events.onFadedOut.add(this.finishDeletingTier,
        this, tier);
    this.avatar.help.setText('tier: ' + fallback.name, true, true);
    this.deleting = true;
    this.level.setTier(fallback, p);
};


// Called once the old tier has fully faded.
DeleteIState.prototype.finishDeletingTier = function(tier) {
    var i = tier.index;
    if (i > this.level.tiers[0].index) {
        while (this.level.tierMap['t' + (i + 1)]) {
            var t = this.level.tierMap['t' + (i + 1)];
            t.index -= 1;
            t.name = 't' + t.index;
            t.palette = this.game.settings.colors[t.name];
            this.level.tierMap[t.name] = t;
            i += 1;
        }
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
