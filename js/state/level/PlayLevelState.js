// This state encapsulates all the logic 
// needed to play a loaded level.
var PlayLevelState = function(game) {};

// A few constants, for now at least.
PlayLevelState.FPS_DISPLAY = false;
PlayLevelState.DEADZONE_EDGE_X = 300;
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
    this.obstacles = new Obstacles(this.game);
    this.flicker = this.createFlickerManager();
    this.level = this.createLevel();
    this.gpad.consumeButtonEvent();

    // Set up the camera first.
    this.game.camera.follow(this.level.avatar);
    this.game.scale.onFullScreenChange.add(this.updateDeadzone, this);
    this.game.scale.onSizeChange.add(this.updateDeadzone, this);
    this.updateDeadzone();
    this.game.camera.focusOnXY(
        this.level.avatar.x + this.game.width / 4,
        this.level.avatar.y + this.game.height / 6);

    // And now the ihandlers (some use the camera).
    this.createIHandlers();

    if (PlayLevelState.FPS_DISPLAY) {
        this.game.time.advancedTiming = true; // For FPS tracking.
    }

    if (!this.params.restart) {
        this.createStartBanner(this.name);
    }

    Utils.prepFullscreen(this.game);
};

// Create the level.
PlayLevelState.prototype.createLevel = function() {
    var json = game.cache.getJSON(this.catalogLevel.getFullName());
    var level = Level.load(this.game, this.name, json);
    if (this.params.textsSeen) {
        level.textsSeen = this.params.textsSeen;
    }
    return level;
};

// Create input handlers.
PlayLevelState.prototype.createIHandlers = function() {
    this.ihandler = this.createLevelHandler();
    this.powerhandler = this.createPowerHandler(this.ihandler);
    this.pointhandler = this.createPointHandler(this.powerhandler);
    this.camerahandler = this.createCameraHandler(this.pointhandler);
    this.menuhandler = this.createMenuHandler(this.camerahandler);
};

// Create the base level handler.
PlayLevelState.prototype.createLevelHandler = function() {
    return new PlayLevelIHandler(this.game, this.gpad, this.level);
};

// Create the power handler, wrapping an earlier handler.
PlayLevelState.prototype.createPowerHandler = function(ihandler) {
    return new PowerIHandler(this.game, this.gpad, this.level, ihandler);
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

// Create the a flicker manager.
PlayLevelState.prototype.createFlickerManager = function() {
    return new FlickerManager(this.game);
};

// Create the splash text when a level first starts.
PlayLevelState.prototype.createStartBanner = function(text) {
    new TextBanner(this.game).splash(text, this.z.fg);
};

// Update camera deadzone.
PlayLevelState.prototype.updateDeadzone = function() {
    var x = PlayLevelState.DEADZONE_EDGE_X;
    var y = PlayLevelState.DEADZONE_EDGE_Y;
    var w = this.game.camera.width;
    var h = this.game.camera.height;
    x = Math.min(x, w / 2 - 1);
    y = Math.min(y, h / 2 - 1);
    this.game.camera.deadzone = new Phaser.Rectangle(
        x, y, w - 2 * x, h - 2 * y);
};

// Restart the level.
PlayLevelState.prototype.restartLevel = function() {
    this.params.restart = true;
    this.params.textsSeen = this.level.textsSeen;
    this.game.state.start(this.key, true, false, this.params);
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
