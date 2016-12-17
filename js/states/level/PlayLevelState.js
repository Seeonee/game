// This state encapsulates all the logic 
// needed to play a loaded level.
var PlayLevelState = function(game) {};

// A few constants, for now at least.
PlayLevelState.FPS_DISPLAY = false;
PlayLevelState.DEADZONE_EDGE_X = 200;
PlayLevelState.DEADZONE_EDGE_Y = 200;

// We get passed the level asset to load.
// This will be a .json file within the assets/levels directory.
// It'll also be used as the load key within the cache.
PlayLevelState.prototype.init = function(levelName, gpad) {
    this.levelName = levelName;
    this.gpad = gpad;
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
    this.level = Level.load(this.game, this.levelName);
    new Avatar(this.game, new AvatarGraphicsKey(this.game), this.level);
    new TierMeter(this.game, this.level);

    this.ihandler = new PlayLevelIHandler(
        this.game, this.gpad, this.level);
    this.pointhandler = new PointIHandler(
        this.game, this.gpad, this.level, this.ihandler);
    this.menuhandler = new PlayLevelMenuIHandler(
        this.game, this.gpad, this.level, this.pointhandler);

    this.game.time.advancedTiming = true; // For FPS tracking.
    this.game.camera.follow(this.level.avatar);
    this.game.camera.deadzone = new Phaser.Rectangle(
        PlayLevelState.DEADZONE_EDGE_X, PlayLevelState.DEADZONE_EDGE_Y,
        this.game.width - (2 * PlayLevelState.DEADZONE_EDGE_X),
        this.game.height - (2 * PlayLevelState.DEADZONE_EDGE_Y));
};

// Render loop.
PlayLevelState.prototype.render = function() {
    if (PlayLevelState.FPS_DISPLAY) {
        this.game.debug.text(this.game.time.fps,
            2, 14, this.game.settings.colors.RED.s);
    };
    this.level.render();
    this.menuhandler.render();
};

// Update loop.
PlayLevelState.prototype.update = function() {
    this.level.update();
    this.menuhandler.update();
};

// Update loop while paused.
PlayLevelState.prototype.pauseUpdate = function() {
    this.menuhandler.pauseUpdate();
};
