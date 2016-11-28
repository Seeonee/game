var FPS_DISPLAY = true;
var AVATAR_GRAPHICS = AvatarGraphicsKey;
// var AVATAR_GRAPHICS = AvatarGraphicsBall;

var GameState = function(game) {};

// Load images and sounds
GameState.prototype.preload = function() {
    Power.preload(game);
    AVATAR_GRAPHICS.preload(game);
    game.load.json('level1', 'assets/levels/level1.json');
};


// Setup the example
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = 0xffffff;
    this.createPaths();

    game.time.advancedTiming = true; // For FPS tracking.
};


// Create a player sprite.
GameState.prototype.createPaths = function() {
    var json = this.game.cache.getJSON('level1');
    this.paths = PathsLoader.load(this.game, json);

    var gfx = new AVATAR_GRAPHICS();
    var avatar = new Avatar(this.game, gfx);
    this.paths.addAvatar(avatar);

    var joystick = new Joystick(this.game, 650, 450);
    this.game.add.existing(joystick);
    this.paths.joystick = joystick;
    this.paths.refresh();
};

// Create a player sprite.
GameState.prototype.render = function() {
    if (FPS_DISPLAY) {
        game.debug.text(game.time.fps, 2, 14, "#D92C57"); // FPS tracking.
    };
};

// Create a player sprite.
GameState.prototype.update = function() {
    this.paths.update();
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
