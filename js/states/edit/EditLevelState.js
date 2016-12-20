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
                p0: { x: 5, y: 5, type: 'start' },
                p1: { x: 105, y: 5 }
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
    if (this.params.json) {
        var json = this.params.json;
    } else if (this.catalogLevel) {
        var json = game.cache.getJSON(this.catalogLevel.getFullName());
    } else {
        var json = EditLevelState.DEFAULT_STARTING_LEVEL;
    }
    return Level.load(this.game, this.name, json);
};

// Hook up the avatar's help text.
EditLevelState.prototype.createAvatar = function() {
    PlayLevelState.prototype.createAvatar.call(this);
    new EditHelp(this.game, this.level);
};

// Create the menu handler, wrapping an earlier handler.
// We also wrap on an inner edit action handler.
EditLevelState.prototype.createMenuHandler = function(ihandler) {
    this.edithandler = this.createEditHandler(ihandler);
    return PlayLevelState.prototype.createMenuHandler.call(
        this, this.edithandler);
};

// Create the menu handler, wrapping an earlier handler.
// We also wrap on an inner edit action handler.
EditLevelState.prototype.createEditHandler = function(ihandler) {
    return new EditLevelIHandler(this.game, this.gpad, this.level, ihandler);
};

// Called on shutdown. Turns editing back off.
EditLevelState.prototype.shutdown = function() {
    this.game.settings.edit = false;
};
