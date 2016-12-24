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
PlayLevelState.prototype.init = function(params) {
    this.params = params;
    this.catalogLevel = params.catalogLevel;
    this.gpad = params.gpad;
};

// Load any custom assets that our level requires, 
// but which aren't generic enough to have been 
// loaded already.
// This is probably a great place to load our 
// Paths/Level object.
PlayLevelState.prototype.preload = function() {
    this.name = this.catalogLevel.name;
    var full = this.catalogLevel.getFullName();
    this.game.load.json(full, 'assets/' + full + '.json');
};

// Set up the level.
PlayLevelState.prototype.create = function() {
    this.level = this.createLevel();
    this.createAvatar();
    this.gpad.consumeButtonEvent();

    this.createIHandlers();

    if (PlayLevelState.FPS_DISPLAY) {
        this.game.time.advancedTiming = true; // For FPS tracking.
    }
    this.game.camera.follow(this.level.avatar);
    this.game.camera.deadzone = new Phaser.Rectangle(
        PlayLevelState.DEADZONE_EDGE_X, PlayLevelState.DEADZONE_EDGE_Y,
        this.game.width - (2 * PlayLevelState.DEADZONE_EDGE_X),
        this.game.height - (2 * PlayLevelState.DEADZONE_EDGE_Y));

    if (!this.params.restart) {
        this.createStartBanner(this.name);
    }
};

// Create the level.
PlayLevelState.prototype.createLevel = function() {
    var json = game.cache.getJSON(this.catalogLevel.getFullName());
    return Level.load(this.game, this.name, json);
};

// Create the avatar (it gets stored into level.avatar).
PlayLevelState.prototype.createAvatar = function() {
    new Avatar(this.game, new AvatarGraphicsKey(this.game), this.level);
};

// Create input handlers.
PlayLevelState.prototype.createIHandlers = function() {
    this.ihandler = this.createLevelHandler();
    this.pointhandler = this.createPointHandler(this.ihandler);
    this.camerahandler = this.createCameraHandler(this.pointhandler);
    this.menuhandler = this.createMenuHandler(this.camerahandler);
};

// Create the base level handler.
PlayLevelState.prototype.createLevelHandler = function() {
    return new PlayLevelIHandler(this.game, this.gpad, this.level);
};

// Create the point handler, wrapping an earlier handler.
PlayLevelState.prototype.createPointHandler = function(ihandler) {
    return new PointIHandler(this.game, this.gpad, this.level, ihandler);
};

// Create the camera handler, wrapping an earlier handler.
PlayLevelState.prototype.createCameraHandler = function(ihandler) {
    return new CameraIHandler(this.game, this.gpad, this.level, ihandler);
};

// Create the menu handler, wrapping an earlier handler.
PlayLevelState.prototype.createMenuHandler = function(ihandler) {
    return new PlayLevelMenuIHandler(this.game, this.gpad, this.level, ihandler);
};

// Create the splash text when a level first starts.
PlayLevelState.prototype.createStartBanner = function(text) {
    new TextBanner(this.game).splash(text, this.z.fg);
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
