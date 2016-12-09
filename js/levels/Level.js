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

// Class that handles writing a level out to JSON.
var LevelWriter = function(level) {
    this.level = level;
};

// Convenience method that handles instantiating the writer.
LevelWriter.json = function(level) {
    return new LevelWriter(level)._json();
};

// Push out a JSON version of our tiers.
LevelWriter.prototype._json = function() {
    var result = ''
    result += '"name": "' + this.level.name + '",'
    result += '\n"start": "' + this.level.start + '",'
    result += '\n"tiers": {'
    for (var i = 0; i < this.level.tiers.length; i++) {
        var tier = this.level.tiers[i];
        result += '\n"' + tier.name + '": ' + Tier.Writer.json(tier);
        if (i < this.level.tiers.length - 1) {
            result += ',';
        }
    }
    result += '}'
    return '{' + result + '\n}';
};

// Class that handles loading a level from JSON.
// The name value should correspond to an already-loaded 
// asset's key within the game cache.
var LevelLoader = function(game, name) {
    this.game = game;
    this.name = name;
    this.json = this.game.cache.getJSON(this.name);
};

// Convenience method that handles instantiating the loader.
LevelLoader.load = function(game, name, json) {
    return new LevelLoader(game, name, json)._load();
};

// Load a JSON representation of a level.
LevelLoader.prototype._load = function() {
    var level = new Level(this.game, this.name);
    level.start = this.json.start;
    var tiers = this.json.tiers;
    var keys = Object.keys(tiers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tierObj = tiers[key];
        var tier = Tier.Loader.load(this.game, key, tierObj);
        level.tiers.push(tier);
        level.tierMap[key] = tier;
    }
    // TODO: Figure out the current tier!
    var t = level.start.split('-')[0]
    level.tier = level.tierMap[t];
    return level;
};
