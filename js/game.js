var FPS_DISPLAY = true;
// var AVATAR_GRAPHICS = AvatarGraphicsKey;
var AVATAR_GRAPHICS = AvatarGraphicsBall;

var GameState = function(game) {};

// Load images and sounds
GameState.prototype.preload = function() {
    // game.load.audio('finale', 'assets/finale.wav');
    Power.preload(game);
    AVATAR_GRAPHICS.preload(game);
    game.load.json('version', 'assets/test.json');
};


// Setup the example
GameState.prototype.create = function() {
    // General constants and setup.
    this.game.stage.backgroundColor = 0xffffff;
    // Initialize objects.
    this.createPaths();
    // this.game.add.audio('finale').play();

    game.time.advancedTiming = true; // For FPS tracking.
};


// Create a player sprite.
GameState.prototype.createPaths = function() {
    this.paths = new Paths(this.game);
    var p1 = this.paths.point(100, 150);
    var p2 = this.paths.point(250, 150, p1);
    var p3 = this.paths.point(300, 100, p2);
    var p4 = this.paths.point(500, 100, p3);

    var p5 = this.paths.point(300, 200, p2);
    var p6 = this.paths.point(450, 200, p5);

    var p7 = this.paths.point(500, 150, p4);
    var p8 = this.paths.point(700, 150, p7);

    var p9 = this.paths.point(500, 250, p6);
    var p10 = this.paths.point(450, 300, p9);
    var p11 = this.paths.point(350, 300, p10);
    var p12 = this.paths.point(200, 300, p11);
    var p13 = this.paths.point(300, 350, p11);
    var p14 = this.paths.point(350, 400, p13);
    var p15 = this.paths.point(450, 400, p14);

    var gfx = new AVATAR_GRAPHICS();
    var avatar = new Avatar(this.game, gfx);
    this.paths.addAvatar(avatar);

    var joystick = new Joystick(this.game, 650, 450);
    this.game.add.existing(joystick);
    this.paths.joystick = joystick;
    this.paths.create();
};

// Create a power sprite.
GameState.prototype.createPower = function(name, x, y) {
    this.game.add.existing(new Power(this.game, x, y, name));
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
