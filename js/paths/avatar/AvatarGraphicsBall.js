// Handles rendering for avatar objects.
var AvatarGraphicsBall = function() {
    // Constants.
    this.COLOR = COLOR.BLUE.i;
    this.RADIUS = 16;
};

// Figure out what we look like. Also enables physics.
AvatarGraphicsBall.prototype.createGraphics = function(avatar) {
    avatar.anchor.setTo(0.5, 0.5);
    // Initialize our graphics.
    // We used to just paint a circle, hence the RADIUS here.
    var bitmap = game.add.bitmapData(2 * this.RADIUS, 2 * this.RADIUS);
    bitmap.context.fillStyle = '#ffffff';
    bitmap.context.arc(this.RADIUS, this.RADIUS, this.RADIUS, 0, 2 * Math.PI, false);
    bitmap.context.fill();
    avatar.ball = avatar.addChild(game.make.sprite(0, 0, bitmap));
    avatar.ball.anchor.setTo(0.5, 0.5);
    avatar.ball.tint = this.COLOR;
    // Enable physics.
    avatar.game.physics.enable(avatar, Phaser.Physics.ARCADE);
    // Adjust bounding box.
    // var w = avatar.body.width;
    // var h = avatar.body.height;
    // var w2 = avatar.ball.width;
    // var h2 = avatar.ball.height;
    // var x = (w - w2) / 2;
    // var y = (h - h2) / 2;
    // avatar.body.setSize(w2, h2, x, y);
};

// Update called as the avatar moves.
AvatarGraphicsBall.prototype.move = function(avatar) {
    // Nothing.
};

// Called by the main game's preload().
AvatarGraphicsBall.preload = function(game) {
    // Nothing.
};

// Called by the main game's create().
AvatarGraphicsBall.create = function(game) {
    // Nothing.
};
