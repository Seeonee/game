var FPS_DISPLAY = true;

// This state encapsulates all the logic 
// needed to play a loaded level.
var PlayLevelState = function(game) {};

// We get passed the level asset to load.
// This will be a .json file within the assets/levels directory.
// It'll also be used as the load key within the cache.
PlayLevelState.prototype.init = function(levelName) {
    this.levelName = levelName;
};

// Load any custom assets that our level requires, 
// but which aren't generic enough to have been 
// loaded already.
// This is probably a great place to load our 
// Paths/Level object.
PlayLevelState.prototype.preload = function() {
    this.game.load.json(this.levelName,
        'assets/levels/' + this.levelName + '.json');
};

// Setup the example
PlayLevelState.prototype.create = function() {
    // Used for rendering z-order.
    this.z = {
        bg: this.game.add.group(), // Background.
        level: this.game.add.group(),
        mg: this.game.add.group(), // Midground?
        player: this.game.add.group(),
        fg: this.game.add.group() // Foreground!
    };

    AVATAR_GRAPHICS.create(game);

    this.level = Level.load(this.game, this.levelName);
    new Avatar(this.game, new AVATAR_GRAPHICS(this.game), this.level);

    this.game.input.gamepad.start();
    var gpad = new GPad(this.game, this.game.input.gamepad.pad1);
    this.ihandler = new PlayLevelIHandler(this.game, gpad, this.level);

    this.game.time.advancedTiming = true; // For FPS tracking.
    // this.game.world.setBounds(0, 0, 1920, 1920);
    this.game.camera.follow(this.level.avatar);
};


// Create a player sprite.
PlayLevelState.prototype.render = function() {
    if (FPS_DISPLAY) {
        this.game.debug.text(this.game.time.fps, 2, 14, "#D92C57"); // FPS tracking.
    };
};

// Create a player sprite.
PlayLevelState.prototype.update = function() {
    this.level.update();
    this.ihandler.update();
};
