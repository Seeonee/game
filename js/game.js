var FPS_DISPLAY = true;
// var AVATAR_GRAPHICS = AvatarGraphicsKey;
var AVATAR_GRAPHICS = AvatarGraphicsBall;

var GameState = function(game) {};

// Load images and sounds
GameState.prototype.preload = function() {
    AVATAR_GRAPHICS.preload(game);
    this.game.load.json('level', 'assets/levels/level2.json');
};


// Setup the example
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = 0x272822;
    this.createPaths();

    this.game.time.advancedTiming = true; // For FPS tracking.
    // this.game.world.setBounds(0, 0, 1920, 1920);
    this.game.camera.follow(this.paths.avatar);
};


// Create a player sprite.
GameState.prototype.createPaths = function() {
    var json = this.game.cache.getJSON('level');
    this.paths = PathsLoader.load(this.game, json);

    var gfx = new AVATAR_GRAPHICS();
    // var avatar = new Avatar(this.game, gfx);
    var avatar = new EditorAvatar(this.game, gfx, this.paths);
    this.paths.addAvatar(avatar);

    var joystick = new Joystick(this.game, 650, 450);
    this.game.add.existing(joystick);
    this.paths.joystick = joystick;
};

// Create a player sprite.
GameState.prototype.render = function() {
    if (FPS_DISPLAY) {
        this.game.debug.text(this.game.time.fps, 2, 14, "#D92C57"); // FPS tracking.
    };
};

// Create a player sprite.
GameState.prototype.update = function() {
    this.paths.update();
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
