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

// Update our current tier.
Level.prototype.update = function() {
    this.tier.update();
}

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
    level.tier = level.tierMap[t];
    return level;
};
