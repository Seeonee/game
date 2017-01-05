// Primary obstacles manager.
var Obstacles = function(game) {
    this.game = game;
    // Map of tiers to hitbox lists.
    this.hitboxes = {};
};

// Register an obstacle hitbox.
Obstacles.prototype.add = function(tier, hitbox) {
    if (!this.level) {
        this.level = tier.level;
    }
    var hitboxes = this.hitboxes[tier.name];
    if (hitboxes == undefined) {
        hitboxes = [];
        this.hitboxes[tier.name] = hitboxes;
    }
    hitboxes.push(hitbox);
};

// Unregister an obstacle hitbox.
Obstacles.prototype.remove = function(tier, hitbox) {
    var hitboxes = this.hitboxes[tier.name];
    if (!hitboxes) {
        return;
    }
    var i = hitboxes.indexOf(hitbox);
    if (i < 0) {
        return;
    }
    hitboxes.slice(i, 1);
};

// Perform a hit test between us and the avatar.
// This will call the shouldAvatarPass() method 
// of any obstacles that the avatar overlaps with.
Obstacles.prototype.overlap = function(avatar) {
    if (!this.level) {
        return false;
    }
    var t = this.level.tier.name;
    return this.game.physics.arcade.overlap(avatar,
        this.hitboxes[t], null, this._overlap, this);
};

// Test avatar's overlap with an obstacle's hitbox.
// This mainly checks to see if we're headed towards it.
// If we are, the obstacle's canAvatarPass() is called; 
// put your custom code there.
// If we're not, we abort and let avatar movement continue.
Obstacles.prototype._overlap = function(avatar, hitbox) {
    if (!avatar.destination) {
        return hitbox.obstacle.obstruct(avatar, hitbox);
    }
    var a1 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        hitbox.x, hitbox.y);
    var a2 = Utils.angleBetweenPoints(avatar.x, avatar.y,
        avatar.destination.gx, avatar.destination.gy);
    var difference = Utils.getBoundedAngleDifference(a1, a2);
    var result = hitbox.obstacle.obstruct(avatar, hitbox);
    if (difference < 0.25) {
        return result;
    } else {
        return false;
    }
};









// Hitbox sprite. Used by obstacles to detect avatar collision.
var Hitbox = function(game, tier, obstacle, x, y, side, circle) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.obstacle = obstacle;
    this.obstacles = this.game.state.getCurrentState().obstacles;
    this.tier = tier;
    this.obstacles.add(tier, this);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    side = side != undefined ? side : Hitbox.D;
    side = circle ? 2 * side : side;
    var w = this.body.width;
    var h = this.body.height;
    this.body.setSize(side, side, w / 2 - side / 2, h / 2 - side / 2);
    if (circle) {
        this.body.setCircle(side / 2);
    }
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
    this.obstacles.remove(this.tier, this);
    this.body.enable = false;
    this.body = null;
    Utils.destroy(this);
};

// Update our tier.
Hitbox.prototype.updateTier = function(tier) {
    if (tier === this.tier) {
        return;
    }
    this.obstacles.remove(this.tier, this);
    this.obstacles.add(tier, this);
    this.tier = tier;
};

// Called on avatar overlap.
Hitbox.prototype.obstruct = function(avatar) {
    return this.obstacle.obstruct(avatar);
};







// Obstacle "wrapper" base class.
// This should almost certainly make use of 
// Hitboxs for in-game physics.
var Obstacle = function(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.gx = x;
    this.gy = y;
    this.type = this.constructor.TYPE;
    this.renderNeeded = true;
};


// Convenient string representation of our *game* coords.
Obstacle.prototype.coords = function() {
    return Point.coords(this.gx, this.gy)
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
Hitbox.prototype.obstruct = function(avatar, hitbox) {
    // Override me!
    return true;
};

// Handle various fade events.
Obstacle.prototype.fadingIn = function(tier) {};
Obstacle.prototype.fadedIn = function(tier) {};
Obstacle.prototype.fadingOut = function(tier) {};
Obstacle.prototype.fadedOut = function(tier) {};

// String version of our details, displayed during editing.
Obstacle.prototype.getDetails = function() {
    return ' (' + this.x + ',' + this.y + ')';
};

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
