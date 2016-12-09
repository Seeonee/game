// A Level object, which contains ordered Tiers.
var Level = function(game) {
    this.game = game;
    this.avatar = undefined;
    this.tier = undefined;
    this.tiers = [];
    this.tierMap = {};
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
    for (var i = 0; i < this.level.tiers.length; i++) {
        if (result) {
            result += ',\n';
        }
        var tier = this.level.tiers[i];
        result += '"t' + i + '": ' + TierWriter.json(tier);
    }
    return '{' + result + '\n}';
};

// Class that handles loading a level from JSON.
var LevelLoader = function(game, json) {
    this.game = game;
    this.json = json;
};

// Convenience method that handles instantiating the loader.
LevelLoader.load = function(game, json) {
    return new LevelLoader(game, json)._load();
};

// Load a JSON representation of a level.
LevelLoader.prototype._load = function() {
    var level = new Level(this.game);
    var keys = Object.keys(this.json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tierObj = this.json[key];
        var tier = TierLoader.load(this.game, tierObj);
        level.tiers.push(tier);
    }
    // TODO: Figure out the current tier!
    level.tier = level.tiers[0];
    return level;
};
