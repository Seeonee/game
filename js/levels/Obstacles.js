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

// Test avatar's overlap with an obstacle's hitbox.
// This mainly checks to see if we're headed towards it.
// If we are, the obstacle's canAvatarPass() is called; 
// put your custom code there.
// If we're not, we abort and let avatar movement continue.
Obstacles.prototype._overlap = function(avatar, hitbox) {
    if (!avatar.destination) {
        return false;
    }
    var a1 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        hitbox.x, hitbox.y);
    var a2 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        avatar.destination.x, avatar.destination.y);
    var difference = Utils.getBoundedAngleDifference(a1, a2);
    if (difference < 0.25) {
        return hitbox.obstacle.obstruct(avatar);
    } else {
        return false;
    }
};









// Hitbox sprite. Used by obstacles to detect avatar collision.
var Hitbox = function(game, obstacle, x, y, side) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.obstacle = obstacle;
    this.obstacles = this.game.state.getCurrentState().obstacles;
    this.obstacles.add(this);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    side = side != undefined ? side : Hitbox.D;
    var w = this.body.width;
    var h = this.body.height;
    this.body.setSize(side, side, w / 2 - side / 2, h / 2 - side / 2);
};

Hitbox.prototype = Object.create(Phaser.Sprite.prototype);
Hitbox.prototype.constructor = Hitbox;

// A few constants.
Hitbox.D = 32;


// Update loop.
Hitbox.prototype.update = function() {
    // this.game.debug.body(this);
    // this.game.debug.spriteCoords(this);
};

// Make us un-collidable. Also, annihilates us.
Hitbox.prototype.removeCollision = function() {
    this.obstacles.remove(this);
    this.body.enable = false;
    this.body = null;
    Utils.destroy(this);
};

// Called on avatar overlap.
Hitbox.prototype.obstruct = function(avatar) {
    return this.obstacle.obstruct(avatar);
};







// Obstacle "wrapper" base class.
// This should almost certainly make use of 
// Hitboxs for in-game physics.
var Obstacle = function(game, name, x, y, type) {
    this.game = game;
    this.name = name;
    this.x = x;
    this.y = y;
    this.type = type;
    this.renderNeeded = true;
};

// Draw loop. Gives us a chance to render.
Obstacle.prototype.draw = function(tier) {
    this.renderNeeded = false; // Extend me!
}

// Update loop. Override if you need it.
Obstacle.prototype.update = function() {
    // Noop.
}

// Called on avatar overlap.
// Returns true if we should block the avatar.
Hitbox.prototype.obstruct = function(avatar) {
    // Override me!
    return true;
};

// Handle various fade events.
Obstacle.prototype.fadingIn = function(tier) {};
Obstacle.prototype.fadedIn = function(tier) {};
Obstacle.prototype.fadingOut = function(tier) {};
Obstacle.prototype.fadedOut = function(tier) {};

// JSON conversion of an obstacle.
Obstacle.prototype.toJSON = function() {
    return {
        x: this.x,
        y: this.y,
        type: this.type
    };
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
