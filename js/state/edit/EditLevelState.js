// This state encapsulates all the logic 
// needed to edit a loaded level.
var EditLevelState = function(game) {
    PlayLevelState.call(this, game);
};

EditLevelState.prototype = Object.create(PlayLevelState.prototype);
EditLevelState.prototype.constructor = EditLevelState;

// Constants, sort of.
EditLevelState.DEFAULT_STARTING_LEVEL = {
    tiers: {
        t3: {
            points: {
                p0: { x: 0, y: 0, type: 'start' },
                p1: { x: 100, y: 0 }
            },
            paths: { a0: { p1: 'p0', p2: 'p1' } }
        }
    }
};

// Override preload; we may not have a catalog level.
EditLevelState.prototype.preload = function() {
    if (this.catalogLevel) {
        PlayLevelState.prototype.preload.call(this);
    }
    this.name = 'my level';
    this.game.settings.edit = true;
};

// Create the level.
EditLevelState.prototype.createLevel = function() {
    // Because we don't call our superclass's createLevel(),
    // the params.textsSeen never gets set. That's good!
    // We want to clear the textsSeen every time in edit mode.
    if (this.params.json) {
        var json = this.params.json;
    } else if (this.catalogLevel) {
        var json = game.cache.getJSON(this.catalogLevel.getFullName());
    } else {
        var json = EditLevelState.DEFAULT_STARTING_LEVEL;
    }
    var level = Level.load(this.game, this.name, json);
    level.avatar.htext.animate = false;
    return level;
};

// Create the menu handler, wrapping an earlier handler.
// We also wrap on an inner edit action handler.
EditLevelState.prototype.createCameraHandler = function(ihandler) {
    this.edithandler = this.createEditHandler(ihandler);
    return PlayLevelState.prototype.createCameraHandler.call(
        this, this.edithandler);
};

// Create the menu handler, wrapping an earlier handler.
// We also wrap on an inner edit action handler.
EditLevelState.prototype.createEditHandler = function(ihandler) {
    return new EditLevelIHandler(this.game, this.gpad, this.level, ihandler);
};

// Restart the level.
EditLevelState.prototype.restartLevel = function() {
    var p = { level: { tier: this.level.tier.name } };
    for (var i = 0; i < this.level.tiers.length; i++) {
        p[this.level.tiers[i].name] = {};
    }
    for (var i = 0; i < this.level.tiers.length; i++) {
        var t = this.level.tiers[i];
        for (var j = 0; j < t.points.length; j++) {
            var point = t.points[j];
            if (point instanceof StartPoint) {
                p.avatar = {
                    x: point.gx,
                    y: point.gy,
                    point: point.name,
                    shards: {},
                    resetMask: true
                };
                break;
            }
        }
    }
    this.level.initialProgress = p;
    this.level.shrineProgress = undefined;
    PlayLevelState.prototype.restartLevel.call(this);
};

// Called on shutdown. Turns editing back off.
EditLevelState.prototype.shutdown = function() {
    this.game.settings.edit = false;
};
