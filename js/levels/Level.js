// A Level object, which contains ordered Tiers.
var Level = function(game, name) {
    this.game = game;
    this.name = name;
    this.avatar = undefined;
    this.tier = undefined;
    this.tiers = [];
    this.tierMap = {};
    this.start = undefined; // Name.
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
        t2.setVisible(t2 === tier);
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
    var result = {
        name: this.name,
        start: this.start,
        tiers: {}
    };
    for (var i = 0; i < this.tiers.length; i++) {
        var tier = this.tiers[i];
        result.tiers[tier.name] = tier;
    }
    return result;
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
