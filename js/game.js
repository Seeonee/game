
var RATE = 1;

var GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    game.load.image('keyplate', 'assets/keyplate.png');
    game.load.image('keyhole', 'assets/keyhole.png');
    game.load.audio('finale', 'assets/finale.wav');
    Power.preload(game);
};


// Setup the example
GameState.prototype.create = function() {
    // General constants and setup.
    this.game.stage.backgroundColor = 0xffffff;
    // Initialize objects.
    this.createPaths();
    // this.createPower('sword', 100, 100);
    // this.createPower('crown', 200, 100);
    // this.createPower('hourglass', 300, 100);
    // this.createPower('presence', 400, 100);
    // this.game.add.audio('finale').play();
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

    var p7 = this.paths.point(550, 150, p4);
    var p8 = this.paths.point(700, 150, p7);
    
    var p9 = this.paths.point(500, 250, p6);
    var p10 = this.paths.point(450, 300, p9);
    var p11 = this.paths.point(350, 300, p10);
    var p12 = this.paths.point(200, 300, p11);
    var p13 = this.paths.point(300, 350, p11);
    var p14 = this.paths.point(350, 400, p13);
    var p15 = this.paths.point(450, 400, p14);

    var joystick = new Joystick(this.game, 650, 450);
    this.game.add.existing(joystick);
    this.paths.joystick = joystick;
    this.paths.create();
};

// Create a player sprite.
GameState.prototype.createPlayer = function() {
    this.player = new Player(this.game, this.game.width/2, this.game.height/2);
    this.game.add.existing(this.player);

};

// Create a power sprite.
GameState.prototype.createPower = function(name, x, y) {
    this.game.add.existing(new Power(this.game, x, y, name));
};


// Create a player sprite.
GameState.prototype.render = function() {
    // this.game.debug.body(this.player);
};

// Create a player sprite.
GameState.prototype.update = function() {
    this.paths.update();
};



// Fancy class to represent our player character.
var Player = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y); // Superclass constructor.

    // Initialize our keyplate.
    this.keyplate = this.addChild(game.make.sprite(0, 0, 'keyplate'));
    this.keyplate.anchor.setTo(0.5, 0.5);

    // Initialize our keyhole.
    this.keyhole = this.addChild(game.make.sprite(0, 0, 'keyhole'));
    this.keyhole.y = -this.keyhole.height / 4.5;
    this.keyhole.anchor.setTo(0.5, 0.5);

    // Finish initializing ourself.
    this.texture.frame.width = this.keyplate.width;
    this.texture.frame.height = this.keyplate.height;
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);
    this.body.collideWorldBounds = true;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.create = function() {
    // var delay = 1000;
    // this.game.add.tween(this.keyhole).to(
    //     {rotation: 3*Math.PI/4}, 1000, Phaser.Easing.Back.InOut, true, delay + 0);
    // this.game.add.tween(this.keyplate).to(
    //     {height: 0, width: 0}, 500, Phaser.Easing.Back.In, true, delay + 475);
    // this.game.add.tween(this.scale).to(
    //     {x: 2, y: 2}, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
};

Player.prototype.update = function() {
    // this.keyhole.rotation = Math.PI / 4 + this.game.math.angleBetween(
    //     this.x + this.keyhole.x, this.y + (this.keyhole.y * this.scale.y), 
    //     this.game.input.activePointer.x, this.game.input.activePointer.y);
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);

