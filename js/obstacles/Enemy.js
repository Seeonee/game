// Test enemy.
var Enemy = function(game, x, y) {
    this.game = game;
    var d = 30;
    var bitmap = this.game.add.bitmapData(d, d);
    var c = bitmap.context;
    c.fillStyle = '#ff00aa';
    c.fillRect(0, 0, d, d);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.body.allowGravity = false;
    // this.body.setCircle(d / 2);

    this.game.state.getCurrentState().z.mg.tier().add(this);
    this.game.state.getCurrentState().obstacles.add(this);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;


// Update loop.
Enemy.prototype.update = function() {
    // this.game.debug.body(this);
    // this.game.debug.spriteCoords(this);
};

// Debug code.
Enemy.prototype.obstruct = function(avatar) {
    // Cheat and look for keys for the next tier up.
    // I.e. keys we've picked up on this tier.
    var tier = this.game.state.getCurrentState().level.tier;
    var keys = avatar.tierMeter.keys['t' + (tier.index + 1)];
    if (keys > 0) {
        this.destroy();
        return false;
    }
    return true;
}
