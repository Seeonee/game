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
