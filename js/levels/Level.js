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

// Slide up one layer among our tiers.
// Latches on to a specified point name.
// Optionally allows you to specify how many 
// layers to slide upwards.
Level.prototype.advanceTierUp = function(pointName, howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (parseInt(this.tier.name.substring(1)) + howMany);
    return this.advanceToTier(name, pointName);
};

// Slide down one layer among our tiers.
// Latches on to a specified point name.
// Optionally allows you to specify how many 
// layers to slide downwards.
Level.prototype.advanceTierDown = function(pointName, howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (parseInt(this.tier.name.substring(1)) - howMany);
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
    if (old && this.tier) {
        var increasing = parseInt(old.name.substring(1)) <
            parseInt(this.tier.name.substring(1));
    } else {
        increasing = false;
    }
    for (var i = 0; i < this.tiers.length; i++) {
        var t2 = this.tiers[i];
        var visible = t2 === tier;
        if (visible) {
            // New tier gets faded in.
            this.fade(t2, true, increasing);
        }
        if (t2 === old) {
            // Old tier gets faded out.
            this.fade(t2, false, !increasing);
            // TODO: Still need to set everything else in its
            // group to be invisible.
        } else {
            for (var j = 0; j < this.z.layers.length; j++) {
                this.z.layers[j].setVisibleFor(t2, visible);
            }
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

// Transition a tier via fade + scaling.
Level.prototype.fade = function(tier, fadeIn, increasing) {
    tier.render();
    tier.image.alpha = fadeIn ? 0 : 1;
    var t = this.game.add.tween(tier.image);
    t.to({ alpha: fadeIn ? 1 : 0 }, 300,
        Phaser.Easing.Cubic.Out, true);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var scale = increasing ? 3 : 0.3;
    tier.image.scale.setTo(fadeIn ? scale : 1);
    var t = this.game.add.tween(tier.image.scale);
    t.to({ x: fadeIn ? 1 : scale, y: fadeIn ? 1 : scale },
        300, Phaser.Easing.Quartic.Out, true);
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
        name: this.name,
        start: this.start,
        tiers: this.tierMap
    };
};

// Load a JSON representation of a level.
// The name value should correspond to an already-loaded 
// asset's key within the game cache.
Level.load = function(game, name) {
    var json = game.cache.getJSON(name);
    var level = new Level(game, name);
    level.start = json.start;
    var tiers = json.tiers;
    var keys = Object.keys(tiers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tierObj = tiers[key];
        var tier = Tier.load(game, key, tierObj);
        tier.level = this;
        level.tiers.push(tier);
        level.tierMap[key] = tier;
    }
    var t = level.start.split('-')[0]
    level.setTier(level.tierMap[t]);
    return level;
};
