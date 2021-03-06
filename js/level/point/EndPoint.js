// "End of the level" point.
var EndPoint = function(name, x, y, enabled, textKeys) {
    Point.call(this, name, x, y, enabled, textKeys);
    this.z = Point.Z + 1;
    this.rings = { inner: [], outer: [] };
    this.stabilized = false;
    this.istateName = EndIState.NAME;
};

EndPoint.TYPE = 'end';
EndPoint.prototype = Object.create(Point.prototype);
EndPoint.prototype.constructor = EndPoint;

// Set up our factory.
Point.load.factory[EndPoint.TYPE] = EndPoint;

// Constants.
EndPoint.INNER_RINGS = 9;
EndPoint.OUTER_RINGS = 10;
EndPoint.RING_RADIUS = Tier.PATH_WIDTH;
EndPoint.AVATAR_DROP_DISTANCE = 30;
EndPoint.AVATAR_DROP_TIME = 250; // ms
EndPoint.DROP_FLASH_DELAY = 195; // ms
EndPoint.CALLBACK_DELAY = 300; // ms


// During our first draw, we create the rings.
EndPoint.prototype.draw = function(tier) {
    this.tier = tier;
    this.game = tier.game;
    this.renderNeeded = false;
    if (!this.drawn) {
        this.drawn = true;
        // Add a nub.
        var ap = this.tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.nub = this.tier.image.addChild(new PNub(this.game,
            ap.x, ap.y, this.tier.palette.c1.i));

        // Now we add the actual gfx rings.
        for (var i = 0; i < EndPoint.INNER_RINGS; i++) {
            var ring = new ERing(this.game, ap.x, ap.y,
                true, tier.palette, i)
            ring.setStable(!this.enabled && this.attached);
            ring.setEnabled(this.enabled);
            this.rings.inner.push(ring);
        }
        for (var i = 0; i < EndPoint.OUTER_RINGS; i++) {
            var ring = new ERing(this.game, ap.x, ap.y,
                false, tier.palette, i);
            ring.setStable(!this.enabled || this.attached);
            ring.setEnabled(this.enabled);
            this.rings.outer.push(ring);
        }
        this.rings.all = this.rings.inner.concat(this.rings.outer);
        for (var i = 0; i < this.rings.all.length; i++) {
            tier.image.addBackgroundChild(this.rings.all[i]);
        }
        var ring0 = this.rings.all[0];

        // Forward events regarding stability (which 
        // occurs in sync for all rings).
        this.events.onStabilize = ring0.events.onStabilize;
        this.events.onDestabilize = ring0.events.onDestabilize;
        ring0.events.onStabilize.add(function() {
            this.stabilized = true;
        }, this);
        ring0.events.onDestabilize.add(function() {
            this.stabilized = false;
        }, this);
    } else {
        for (var i = 0; i < this.rings.all.length; i++) {
            this.rings.all[i].updatePalette(tier.palette);
        }
        this.nub.updatePalette(tier.palette);
    }
};

// Fade the rings back in.
EndPoint.prototype.fadingIn = function() {
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].fade(true);
    }
};

// Fade the rings out.
EndPoint.prototype.fadingOut = function() {
    if (this.rings.all) {
        for (var i = 0; i < this.rings.all.length; i++) {
            this.rings.all[i].fade(false);
        }
    }
};

// Set our enabled state.
EndPoint.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    Point.prototype.setEnabled.call(this, enabled);
    for (var i = 0; i < this.rings.all.length; i++) {
        var ring = this.rings.all[i];
        ring.setStable(!this.enabled || this.attached);
        ring.setEnabled(this.enabled);
    }
};

// Sping the rings into place.
EndPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.enabled) {
        for (var i = 0; i < this.rings.all.length; i++) {
            this.rings.all[i].setStable(true);
        }
    }
};

// Let the rings orbit again.
EndPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    if (this.enabled) {
        for (var i = 0; i < this.rings.all.length; i++) {
            this.rings.all[i].setStable(false);
        }
    }
};

// Charge up the final gfx.
// This will automatically delay until any in-progress 
// stabilization has completed.
EndPoint.prototype.chargeUp = function(callback, context) {
    if (this.stabilized) {
        this._chargeUp(callback, context);
    } else {
        this.events.onStabilize.add(function() {
            this._chargeUp(callback, context);
        }, this);
    }
};

// Charge up the final gfx.
EndPoint.prototype._chargeUp = function(callback, context) {
    for (var i = 0; i < this.rings.all.length; i++) {
        var ring = this.rings.all[i];
        ring.blaze();
    }
    var gp = this.tier.translateInternalPointToGamePoint(
        this.x, this.y);
    var traveller = new ETraveller(this.game, gp.x, gp.y,
        this.tier.palette);
    traveller.events.onPortalOpen.add(function() {
        this.dropAvatar();
    }, this);
    if (callback) {
        traveller.events.onPortalClosed.add(function() {
            this.game.time.events.add(EndPoint.CALLBACK_DELAY,
                callback, context);
        }, this);
    }
};

// Lower the player avatar into the portal.
EndPoint.prototype.dropAvatar = function() {
    this.tier.level.hideAllTiers();
    var a = this.avatar;
    var y = a.y + EndPoint.AVATAR_DROP_DISTANCE;
    var t = this.game.add.tween(a);
    t.to({ y: y }, EndPoint.AVATAR_DROP_TIME,
        Phaser.Easing.Back.In, true);
    var t2 = this.game.add.tween(a);
    t2.to({ alpha: 0 }, EndPoint.AVATAR_DROP_TIME,
        Phaser.Easing.Quadratic.In, true);
    this.game.time.events.add(EndPoint.DROP_FLASH_DELAY,
        this.portalFlash, this);
};

// Spawn the gfx as our avatar drops through the portal.
EndPoint.prototype.portalFlash = function() {
    var gp = this.tier.translateInternalPointToGamePoint(
        this.x, this.y);
    var zgroup = this.game.state.getCurrentState().z.fg;
    // Standard portal flash.
    new PortalFlash(this.game).flash(zgroup, gp.x, gp.y);
    // Fancy *spinning* line flash!
    var hflash = new HFlash(this.game)
    hflash.flash(zgroup, gp.x, gp.y);
    var t = this.game.add.tween(hflash);
    t.to({ rotation: -Math.PI / 2 }, HFlash.FLASH_TOTAL,
        Phaser.Easing.Cubic.InOut, true);
};


// Delete our rings.
EndPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    Utils.destroy(this.nub);
    for (var i = 0; i < this.rings.all.length; i++) {
        Utils.destroy(this.rings.all[i]);
    }
};

// Editor details.
EndPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'end gate';
};

// JSON conversion of an end point.
EndPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    return result;
};

// Load a JSON representation of an end point.
EndPoint.load = function(game, name, json) {
    return new EndPoint(name, json.x, json.y,
        json.enabled, json.textKeys);
};
