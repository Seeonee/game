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
        onTierChange: new Phaser.Signal()
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
        'level',
        'mg',
        'player',
        'fg',
    ]);
    this.z.createSubgroup('menu', false);
    game.state.getCurrentState().z = this.z;
};

// Add a tier, and register for its events.
Level.prototype.addTier = function(name, tier) {
    this.tiers.push(tier);
    this.tierMap[name] = tier;
    this.tiers.sort(function(a, b) {
        return a.index - b.index;
    });
    tier.events.onFadingIn.add(this.setVisibleForTier, this);
    tier.events.onFadedOut.add(this.setInvisibleForTier, this);
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
        var t2 = this.tiers[i];
        if (t2 === tier) {
            t2.fadeIn(increasing);
        } else if (t2 === old) {
            t2.fadeOut(!increasing);
        } else {
            t2.setInactive(false);
        }
    }
    this.tier.updateWorldBounds();
    if (this.avatar) {
        this.updateAvatarForNewTier(pointName);
        this.flash(increasing);
    }
    this.game.stage.backgroundColor = this.tier.palette.c3.i;
    this.events.onTierChange.dispatch(this.tier, old);
};

// Shows a tier.
Level.prototype.setVisibleForTier = function(tier) {
    for (var j = 0; j < this.z.layers.length; j++) {
        this.z.layers[j].setVisibleFor(tier, true);
    }
};

// Hides a tier.
Level.prototype.setInvisibleForTier = function(tier) {
    for (var j = 0; j < this.z.layers.length; j++) {
        this.z.layers[j].setVisibleFor(tier, false);
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
    this.tier.update();
};

// Render our current tier.
Level.prototype.render = function() {
    this.tier.render();
};

// Push out a JSON version of our tiers.
Level.prototype.toJSON = function() {
    return {
        tiers: this.tierMap
    };
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
        tier.level = this;
        level.addTier(key, tier);
    }
    OUTER: for (var i = 0; i < level.tiers.length; i++) {
        var tier = level.tiers[i];
        for (var j = 0; j < tier.points.length; j++) {
            var point = tier.points[j];
            if (point instanceof StartPoint) {
                level.start = tier.name + '-' + point.name;
                level.setTier(tier);
                break OUTER;
            }
        }
    }
    return level;
};
