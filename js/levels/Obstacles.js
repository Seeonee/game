// Primary obstacles manager.
var Obstacles = function(game) {
    this.game = game;
    this.obstacles = [];
};

// Register an obstacle.
Obstacles.prototype.add = function(obstacle) {
    this.obstacles.push(obstacle);
};

// Unregister an obstacle.
Obstacles.prototype.remove = function(obstacle) {
    var i = this.obstacles.indexOf(obstacle);
    this.obstacles.slice(i, 1);
};

// Perform a hit test between us and the avatar.
// This will call the shouldAvatarPass() method 
// of any obstacles that the avatar overlaps with.
Obstacles.prototype.overlap = function(avatar) {
    return this.game.physics.arcade.overlap(avatar,
        this.obstacles, null, this._overlap, this);
};

// Test avatar's overlap with an obstacle.
// This mainly checks to see if we're headed towards it.
// If we are, the obstacle's canAvatarPass() is called; 
// put your custom code there.
// If we're not, we abort and let avatar movement continue.
Obstacles.prototype._overlap = function(avatar, obstacle) {
    if (!avatar.destination) {
        return false;
    }
    var a1 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        obstacle.x, obstacle.y);
    var a2 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        avatar.destination.x, avatar.destination.y);
    var difference = Utils.getBoundedAngleDifference(a1, a2);
    if (difference < 0.25 && obstacle.obstruct) {
        return obstacle.obstruct(avatar);
    } else {
        return false;
    }
};









// Obstacle sprite parent class.
var ObstacleSprite = function(game, x, y, arg) {
    Phaser.Sprite.call(this, game, x, y, arg);
    this.obstacles = this.game.state.getCurrentState().obstacles;
    this.obstacles.add(this);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
};

ObstacleSprite.prototype = Object.create(Phaser.Sprite.prototype);
ObstacleSprite.prototype.constructor = ObstacleSprite;


// Make us un-collidable.
ObstacleSprite.prototype.removeCollision = function() {
    this.obstacles.remove(this);
    this.body.enable = false;
    this.body = null;
};







// Obstacle "wrapper" base class.
// This should almost certainly make use of 
// ObstacleSprites for in-game physics.
var Obstacle = function(game, type) {
    this.type = type;
    this.renderNeeded = true;
};

// Draw loop. Gives us a chance to render.
Obstacle.prototype.draw = function(tier) {
    this.renderNeeded = false; // Extend me!
}

// JSON conversion of an obstacle.
Obstacle.prototype.toJSON = function() {
    return { type: this.type }; // Extend me!
};

// Load a JSON representation of a obstacle.
Obstacle.load = function(game, name, json) {
    var type = json.type;
    if (!type || !Obstacle.load.factory[type]) {
        console.error('Failed to load obstacle class ' + type);
        return undefined;
    }
    return Obstacle.load.factory[type].load(game, name, json);
};

// This is a map of type values to Obstacle subclasses.
Obstacle.load.factory = {};
