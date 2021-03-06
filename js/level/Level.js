// A Level object, which contains ordered Tiers.
var Level = function(game, name) {
    this.game = game;
    this.name = name;
    this.avatar = undefined;
    this.tier = undefined;
    this.tiers = [];
    this.tierMap = {};
    this.start = undefined; // Name.
    this.hfPool = new SpritePool(this.game, HFlash);
    this.pfPool = new SpritePool(this.game, PortalFlash);
    this.events = {
        onTierChange: new Phaser.Signal(),
        onShrineVisit: new Phaser.Signal()
    }

    // We're responsible for setting up our 
    // parent state's group hierarchy for 
    // rendering z-order
    // Each possible z group has a "base" layer, 
    // as well as one layer for each tier.
    // Tier-specific layers are only visible 
    // while a tier is currently active.
    this.z = new LevelZGroup(this, [
        'bg',
        'wire',
        'level',
        'mg',
        'player',
        'fg',
    ]);
    this.z.createSubgroup('menu', false);
    game.state.getCurrentState().z = this.z;
    this.textLocalized = undefined;
    this.textsSeen = new Set();
};

// Constants.
Level.PARALLAX_SCALE = 1 / 10;


// Add a tier, and register for its events.
Level.prototype.addTier = function(name, tier) {
    this.tiers.push(tier);
    this.tierMap[name] = tier;
    this.tiers.sort(function(a, b) {
        return a.index - b.index;
    });
    tier.events.onFadingOut.add(this.setBlurredForTier, this);
    tier.events.onFadingIn.add(this.setUnblurredForTier, this);
    tier.events.onHidden.add(this.setInvisibleForTier, this);
    tier.events.onUnhiding.add(this.setVisibleForTier, this);
};

// Return the tier above a given one (or our current one).
// If we're at the top, returns undefined.
Level.prototype.getNextTierUp = function(tier) {
    tier = tier ? tier : this.tier;
    return this.tierMap['t' + (tier.index + 1)];
};

// Return the tier below a given one (or our current one).
// If we're at the bottom, returns undefined.
Level.prototype.getNextTierDown = function(tier) {
    tier = tier ? tier : this.tier;
    return this.tierMap['t' + (tier.index - 1)];
};

// Slide up one layer among our tiers.
// Latches on to a specified point name.
// Optionally allows you to specify how many 
// layers to slide upwards.
Level.prototype.advanceTierUp = function(pointName, howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (this.tier.index + howMany);
    return this.advanceToTier(name, pointName);
};

// Slide down one layer among our tiers.
// Latches on to a specified point name.
// Optionally allows you to specify how many 
// layers to slide downwards.
Level.prototype.advanceTierDown = function(pointName, howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (this.tier.index - howMany);
    return this.advanceToTier(name, pointName);
};

// Advance to a named tier, if it exists.
// Latches on to a specified point name.
// Returns the tier if found, or undefined if not.
Level.prototype.advanceToTier = function(name, pointName) {
    var tier = this.tierMap[name];
    if (tier) {
        this.setTier(tier, pointName);
    }
    return tier;
};

// Set the currently active tier, and hide previous tiers.
// Latches on to a specified point name.
Level.prototype.setTier = function(tier, pointName) {
    if (this.tier === tier) {
        return;
    }
    var old = this.tier;
    this.tier = tier;
    var increasing = old && tier ? old.index < tier.index : false;
    for (var i = 0; i < this.tiers.length; i++) {
        this.tiers[i].updateBasedOnChangingTiers(this.tier, old);
    }
    this.tier.updateWorldBounds();
    if (this.avatar && old) {
        this.updateAvatarForNewTier(pointName);
        this.flash(increasing);
    }
    this.game.stage.backgroundColor = this.tier.palette.c3.i;
    this.events.onTierChange.dispatch(this.tier, old);
};

// Shows a tier.
Level.prototype.setVisibleForTier = function(tier) {
    for (var i = 0; i < this.z.layers.length; i++) {
        this.z.layers[i].setVisibleFor(tier, true);
    }
};

// Hides a tier.
Level.prototype.setInvisibleForTier = function(tier) {
    for (var i = 0; i < this.z.layers.length; i++) {
        this.z.layers[i].setVisibleFor(tier, false);
    }
};

// Fade out every tier.
Level.prototype.hideAllTiers = function() {
    for (var i = 0; i < this.tiers.length; i++) {
        var tier = this.tiers[i];
        if (!tier.hidden) {
            this.game.add.tween(tier.image).to({ alpha: 0 },
                Tier.FADE_TIME, Phaser.Easing.Linear.None, true);
        }
    }
};

// Blurs a tier.
Level.prototype.setBlurredForTier = function(tier) {
    for (var i = 0; i < this.z.layers.length; i++) {
        this.z.layers[i].setBlurFor(tier, true);
    }
};

// Clears a tier.
Level.prototype.setUnblurredForTier = function(tier) {
    for (var i = 0; i < this.z.layers.length; i++) {
        this.z.layers[i].setBlurFor(tier, false);
    }
};

// Some sparkles for your level transition, sir.
Level.prototype.updateAvatarForNewTier = function(pointName) {
    this.avatar.setColor(this.tier.palette);
    var point = this.tier.pointMap[pointName];
    point = point ? point : this.tier.points[0];
    var gp = this.tier.translateInternalPointToGamePoint(
        point.x, point.y);
    this.avatar.tier = this.tier;
    this.avatar.point = point;
    // Keep the relative camera/avatar positioning.
    var dx = this.avatar.x - this.game.camera.x;
    var dy = this.avatar.y - this.game.camera.y;
    this.avatar.x = gp.x;
    this.avatar.y = gp.y;
    this.game.camera.x = gp.x - dx;
    this.game.camera.y = gp.y - dy;
    this.avatar.updateAttachment();
};

// Some sparkles for your level transition, sir.
Level.prototype.flash = function(increasing) {
    this.hfPool.make(this.game).flash(this.z.fg,
        this.avatar.x, this.avatar.y);
    this.pfPool.make(this.game).flash(this.z.fg,
        this.avatar.x, this.avatar.y, increasing);
};

// Propagate any settings changes.
Level.prototype.updateSettings = function(settings) {
    this.avatar.updateSettings(settings);
};

// Update our current tier.
Level.prototype.update = function() {
    if (this.done) {
        return;
    }
    this.updateTierParallax();
    this.tier.update();
};

// Render our current tier.
Level.prototype.render = function() {
    this.tier.render();
};

// Hide everything.
Level.prototype.finish = function() {
    this.z.visible = false;
    this.game.state.getCurrentState().flicker.stop();
    this.update();
    this.done = true;
};

// Adjust tier parallax.
Level.prototype.updateTierParallax = function() {
    var tier = this.tier;
    if (!tier.image) {
        return;
    }
    // Offset of the camera's center from 0,0.
    var xc = this.game.camera.x + (this.game.camera.width / 2);
    var yc = this.game.camera.y + (this.game.camera.height / 2);

    for (var i = 0; i < this.tiers.length; i++) {
        var t = this.tiers[i];
        if (!t.image || t.hidden) {
            continue;
        }
        var x = t.x + t.widthOver2;
        var y = t.y + t.heightOver2;

        var xo = t.widthOver2;
        var yo = t.heightOver2;

        var scale = t._bgimage.scale.x;
        if (scale > 1) {
            scale -= 1;
        } else if (scale < 1) {
            scale = 1 / (-scale / (1 - scale));
        } else {
            scale = 0;
        }
        var dx = scale * xc * Level.PARALLAX_SCALE;
        var dy = scale * yc * Level.PARALLAX_SCALE;
        t._bgimage.x = x + dx;
        t._bgimage.y = y + dy;
    }
};

// Make sure we've created the text map for 
// the current language setting.
Level.prototype.verifyTextCreation = function() {
    if (this.textLocalized == undefined) {
        this.textLocalized = {};
    }
    var l = Settings.languageName(this.game.settings.language);
    if (!this.textLocalized[l]) {
        this.textLocalized[l] = {};
    }
};

// Derive a new unique key name.
Level.prototype.getNewTextKeyName = function(obj) {
    var base = 'text-';
    if (obj) {
        if (obj instanceof Point) {
            base = 'point-text-';
        } else if (obj instanceof Path) {
            base = 'path-text-';
        } else if (obj instanceof Obstacle) {
            base = 'object-text-';
        }
    }
    this.verifyTextCreation();
    var l = Settings.languageName(this.game.settings.language);
    var i = 0;
    while (this.textLocalized[l][base + i]) {
        i += 1;
    }
    return base + i;
};

// Add some text under a localization key.
Level.prototype.addTextKey = function(textKey, text) {
    this.verifyTextCreation();
    var l = Settings.languageName(this.game.settings.language);
    this.textLocalized[l][textKey] = text;
};

// Remove localized text by key.
Level.prototype.removeTextKey = function(textKey) {
    if (!this.textLocalized) {
        return;
    }
    var l = Settings.languageName(this.game.settings.language);
    if (!this.textLocalized[l]) {
        return;
    }
    delete this.textLocalized[l][textKey];
};

// Retrieve localized text by key.
Level.prototype.getTextKey = function(textKey) {
    var result = undefined;
    var l = Settings.languageName(this.game.settings.language);
    if (this.textLocalized) {
        if (this.textLocalized[l]) {
            result = this.textLocalized[l][textKey];
        }
    }
    if (result == undefined) {
        console.log('failed to look up text key ' + textKey +
            ' for language ' + l);
    }
    return result;
};

// Retrieve localized text by key.
// This only returns it if it hasns't been seen.
Level.prototype.getTextKeyForDisplay = function(textKey) {
    if (this.game.settings.text == Settings.NEVER) {
        return undefined;
    }
    if (this.game.settings.text == Settings.SOMETIMES &&
        this.textsSeen.has(textKey)) {
        return undefined;
    }
    this.textsSeen.add(textKey);
    return this.getTextKey(textKey);
};

// Save progress.
Level.prototype.saveProgress = function(p) {
    p = p ? p : {};
    p.level = { 'tier': this.tier.name };
    this.avatar.saveProgress(p);
    for (var i = 0; i < this.tiers.length; i++) {
        this.tiers[i].saveProgress(p);
    }
    return p;
};

// Restore progress.
Level.prototype.restoreProgress = function(p) {
    if (!this.tier || this.tier.name != p.level.tier) {
        var avatar = this.avatar;
        this.avatar = undefined;
        this.setTier(this.tierMap[p.level.tier]);
        this.avatar = avatar;
    }
    this.avatar.restoreProgress(p);
    for (var i = 0; i < this.tiers.length; i++) {
        this.tiers[i].restoreProgress(p);
    }
};

// Checkpoint reached.
Level.prototype.visitShrine = function(shrine) {
    this.events.onShrineVisit.dispatch(shrine);
    this.shrineProgress = this.saveProgress();
};

// Checkpoint returned to.
Level.prototype.resetToShrine = function() {
    var p = this.shrineProgress ?
        this.shrineProgress : this.initialProgress;
    this.restoreProgress(p);
};

// All the way back.
Level.prototype.resetToBeginning = function() {
    this.restoreProgress(this.initialProgress);
};


// Push out a JSON version of our tiers.
Level.prototype.toJSON = function() {
    var result = {
        tiers: this.tierMap
    };
    if (Object.keys(this.properties).length > 0) {
        result.properties = this.properties;
    }
    if (this.textLocalized) {
        result.textLocalized = this.textLocalized;
    }
    return result;
};

// Load a JSON representation of a level.
// The name value should correspond to an already-loaded 
// asset's key within the game cache.
Level.load = function(game, name, json) {
    var level = new Level(game, name);
    var tiers = json.tiers;
    var keys = Object.keys(tiers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tierObj = tiers[key];
        var tier = Tier.load(game, key, tierObj);
        tier.level = level;
        level.addTier(key, tier);
    }
    OUTER: for (var i = 0; i < level.tiers.length; i++) {
        var tier = level.tiers[i];
        for (var j = 0; j < tier.points.length; j++) {
            var point = tier.points[j];
            if (point instanceof StartPoint) {
                level.start = tier.name + '-' + point.name;
                break OUTER;
            }
        }
    }

    level.properties = json.properties ? json.properties : {};
    level.textLocalized = json.textLocalized;

    new Avatar(game, new AvatarGraphicsKey(game), level);

    for (var i = 0; i < level.tiers.length; i++) {
        // Set our tier so that z-subgroups can be made.
        level.tier = level.tiers[i];
        level.tiers[i].initializeBasedOnStartingTier(tier);
    }
    // Unset it so that setTier won't think nothing's changed.
    level.tier = undefined;
    level.setTier(tier);
    level.initialProgress = level.saveProgress();
    return level;
};
