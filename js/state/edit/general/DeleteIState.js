// Handle point and path deletion.
var DeleteIState = function(handler, level) {
    IState.call(this, DeleteIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

DeleteIState.NAME = 'delete';
DeleteIState.prototype = Object.create(IState.prototype);
DeleteIState.prototype.constructor = DeleteIState;


// Action for deleting nodes and paths.
DeleteIState.prototype.activated = function(prev) {
    this.prev = prev;
    if (prev instanceof FloatIState) {
        this.point = prev.point;
        this.path = prev.path;
    } else {
        this.point = this.avatar.point;
        this.path = this.avatar.path;
    }
    if (!this.point && !this.path) {
        this.falseStart = true;
        return;
    }

    this.tier = this.level.tier;
    this.deletingTier = false;
    this.deletingPoint = false;
    this.deletingPath = false;
    this.timeToCharge = undefined;

    if (this.point) {
        if (this.tier.points.length != 1) {
            this.deletingPoint = true;
            this.timeToCharge = EditCharge.TIME / 2;
            this.deleteCharged = false;
            this.avatar.htext.setText('delete ' + this.point.name + '?');
        } else {
            this.deletingTier = true;
            this.timeToCharge = EditCharge.TIME;
            this.avatar.htext.setText('delete tier ' + this.tier.name +
                '?\nhold to confirm');
        }
    } else if (this.path) {
        this.deletingPath = true;
        this.timeToCharge = EditCharge.TIME / 2;
        this.avatar.htext.setText('delete ' + this.path.name + '?');
    }
    this.eventTime = this.game.time.now + this.timeToCharge;

    this.image = new EditCharge(this.game,
        this.avatar.x, this.avatar.y, this.tier.palette,
        true, this.timeToCharge);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
};

// Clean up.
DeleteIState.prototype.deactivated = function(next) {
    this.image.destroy();
    if (this.image2) {
        this.image2.destroy();
    }
};

// Back to where we came from.
DeleteIState.prototype.cancel = function() {
    this.activate(this.prev.name);
};

// After a successful delete, proceed to floating.
DeleteIState.prototype.proceed = function() {
    this.activate(FloatIState.NAME);
};

// Handle an update while holding the button.
DeleteIState.prototype.update = function() {
    if (this.falseStart) {
        this.activate(this.prev.name);
        return;
    }
    this.charged = this.game.time.now > this.eventTime;
    if (this.deletingPoint) {
        return this.updateForPoint();
    } else if (this.deletingPath) {
        return this.updateForPath();
    } else {
        return this.updateForTier();
    }
};

// Handle an update while holding the button.
DeleteIState.prototype.updateForPoint = function() {
    if (this.charged) {
        if (!this.deleteCharged) {
            this.deleteCharged = true;
            this.timeToCharge = EditCharge.TIME * 2;
            this.charged = false;
            this.avatar.htext.setText('delete ' + this.point.name +
                '\nhold to also merge paths');

            this.image.tint = this.game.settings.colors.GREY.i;
            this.image2 = new EditCharge(this.game,
                this.avatar.x, this.avatar.y, this.tier.palette,
                true, this.timeToCharge);
            this.game.state.getCurrentState().z.mg.tier().add(this.image2);
        } else {
            this.avatar.htext.setText('delete ' + this.point.name +
                '\nmerge paths');
        }
    }
    if (this.gpad.released(this.buttonMap.EDIT_DELETE)) {
        this.gpad.consumeButtonEvent();
        if (!this.charged && !this.deleteCharged) {
            this.cancel();
            return;
        }
        var readyToMerge = this.charged;
        if (!this.deletePoint(this.point, readyToMerge)) {
            this.avatar.htext.setText('delete failed', true);
        }
        this.proceed();
    }
};





// Handle an update while holding the button.
DeleteIState.prototype.updateForPath = function() {
    if (this.charged) {
        this.avatar.htext.setText('delete ' + this.path.name);
    }
    if (this.gpad.released(this.buttonMap.EDIT_DELETE)) {
        this.gpad.consumeButtonEvent();
        if (!this.charged) {
            this.cancel();
            return;
        }
        this.tier.deletePath(this.path);
        this.avatar.path = undefined;
        this.proceed();
    }
};





// Handle an update while prompting about the tier.
DeleteIState.prototype.updateForTier = function() {
    if (this.deleting && !this.doneDeleting) {
        return;
    }
    if (this.charged) {
        this.avatar.htext.setText('delete tier ' +
            this.tier.name + '?\nok');
    }
    if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.gpad.consumeButtonEvent();
        if (!this.charged) {
            this.cancel();
            return;
        }
        this.deleteTier();
        this.proceed();
    }
};





// Attempt to delete a point. Returns success/fail.
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
    // this.cleanUpPoint(point);
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
        this.avatar.htext.setText('delete failed', true);
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
    this.avatar.htext.setText('tier: ' + fallback.name, true, true);
    this.deleting = true;
    this.level.setTier(fallback, p);
};


// Called once the old tier has fully faded.
DeleteIState.prototype.finishDeletingTier = function(tier) {
    var i = tier.index;
    var shards = this.avatar.tierMeter.shards;
    if (i > this.level.tiers[0].index) {
        while (this.level.tierMap['t' + (i + 1)]) {
            var t = this.level.tierMap['t' + (i + 1)];
            t.index -= 1;
            if (shards[t.name]) {
                shards['t' + t.index] = shards[t.name];
                delete shards[t.name];
            }
            t.name = 't' + t.index;
            t.palette = this.game.settings.colors[t.name];
            this.level.tierMap[t.name] = t;
            this.updateTierZ(t);
            i += 1;
            t.renderNeeded = true;
        }
    }
    this.deleteTierZ('t' + i);
    delete this.level.tierMap['t' + i];
    var index = this.level.tiers.indexOf(tier);
    this.level.tiers.splice(index, 1);
    tier.delete();

    var above = this.level.tier.getAbove();
    if (above) {
        above.unhide();
    }

    this.avatar.tierMeter.recreate();
    this.avatar.tierMeter.setTier(this.level.tier);
    this.level.events.onTierChange.add(
        this.avatar.tierMeter.setTier, this.avatar.tierMeter);
    this.avatar.tierMeter.showBriefly();
    this.doneDeleting = true;
};

// Copy all z-group items down a tier.
DeleteIState.prototype.updateTierZ = function(t) {
    for (var i = 0; i < this.level.z.layers.length; i++) {
        var layer = this.level.z.layers[i];
        var name1 = t.name;
        var name2 = 't' + (t.index + 1);
        if (layer._tierSubs[name2]) {
            var sub1 = layer._tierSubs[name1];
            var sub2 = layer._tierSubs[name2];
            while (sub1.children.length) {
                sub1.removeChildAt(0);
            }
            while (sub2.children.length) {
                sub1.addChild(sub2.children[0]);
            }
        }
    }
};

// Delete the (now empty) top tier's z-group.
DeleteIState.prototype.deleteTierZ = function(tname) {
    for (var j = 0; j < this.level.z.layers.length; j++) {
        var layer = this.level.z.layers[j];
        layer.removeChild(layer._tierSubs[tname]);
        delete layer._tierSubs[tname];
    }
};
