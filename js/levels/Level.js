// A Level object, which contains ordered Tiers.
var Level = function(game, name) {
    this.game = game;
    this.name = name;
    this.avatar = undefined;
    this.tier = undefined;
    this.tiers = [];
    this.tierMap = {};
    this.start = undefined; // Name.

    // We're responsible for setting up our 
    // parent state's group hierarchy for 
    // rendering z-order
    // Each possible z group has a "base" layer, 
    // as well as one layer for each tier.
    // Tier-specific layers are only visible 
    // while a tier is currently active.
    this.z = {
        bg: this.createZGroup(), // Background.
        level: this.createZGroup(),
        mg: this.createZGroup(), // Midground?
        player: this.createZGroup(),
        fg: this.createZGroup() // Foreground!
    };
    game.state.getCurrentState().z = this.z;
};

// Create a group for z-order rendering.
// It also contains a tier() method which 
// will return (and if necessary instantiate)
// a subgroup for the currently selected tier.
Level.prototype.createZGroup = function() {
    var group = this.game.add.group();
    group.level = this;
    group.tierSubs = {};
    group.tier = function() {
        var sub = this;
        if (this.level.tier) {
            var t = this.level.tier.name;
            sub = this.tierSubs[t];
            if (!sub) {
                sub = this.game.add.group(this);
                this.tierSubs[t] = sub;
            }
        }
        return sub;
    };
    group.setVisibleFor = function(tier, visible) {
        var sub = this.tierSubs[tier.name];
        if (sub) {
            sub.visible = visible;
        }
    };
    return group;
};

// Slide up one layer among our tiers.
// Optionally allows you to specify how many 
// layers to slide upwards.
Level.prototype.advanceTierUp = function(howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (parseInt(this.tier.name.substring(1)) + howMany);
    return this.advanceToTier(name);
};

// Slide down one layer among our tiers.
// Optionally allows you to specify how many 
// layers to slide downwards.
Level.prototype.advanceTierDown = function(howMany) {
    howMany = (howMany == undefined) ? 1 : howMany;
    var name = 't' + (parseInt(this.tier.name.substring(1)) - howMany);
    return this.advanceToTier(name);
};

// Advance to a named tier, if it exists.
// Returns the tier if found, or undefined if not.
Level.prototype.advanceToTier = function(name) {
    var tier = this.tierMap[name];
    if (tier) {
        this.setTier(tier);
    }
    return tier;
};

// Set the currently active tier, and hide previous tiers.
Level.prototype.setTier = function(tier) {
    this.tier = tier;
    for (var i = 0; i < this.tiers.length; i++) {
        var t2 = this.tiers[i];
        var visible = t2 === tier;
        var keys = Object.keys(this.z);
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            this.z[key].setVisibleFor(t2, visible);
        }
    }
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
        level.tiers.push(tier);
        level.tierMap[key] = tier;
    }
    var t = level.start.split('-')[0]
    level.setTier(level.tierMap[t]);
    return level;
};
