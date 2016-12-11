// Handles rendering for avatar objects.
var AvatarGraphicsBall = function(game) {};

// Constants.
AvatarGraphicsBall.RADIUS = 16;

// Figure out what we look like. Also enables physics.
AvatarGraphicsBall.prototype.createGraphics = function(avatar) {
    avatar.anchor.setTo(0.5, 0.5);
    // Initialize our graphics.
    var bitmap = this.game.add.bitmapData(
        2 * AvatarGraphicsBall.RADIUS,
        2 * AvatarGraphicsBall.RADIUS);
    bitmap.context.fillStyle = '#ffffff';
    bitmap.context.arc(AvatarGraphicsBall.RADIUS,
        AvatarGraphicsBall.RADIUS, AvatarGraphicsBall.RADIUS,
        0, 2 * Math.PI, false);
    bitmap.context.fill();
    avatar.ball = avatar.addChild(this.game.make.sprite(0, 0, bitmap));
    avatar.ball.anchor.setTo(0.5, 0.5);
    avatar.ball.tint = this.game.settings.colors.BLUE.i;
    // Enable physics.
    this.game.physics.enable(avatar, Phaser.Physics.ARCADE);
};

// Update called as the avatar moves.
AvatarGraphicsBall.prototype.move = function(avatar) {
    // Nothing.
};
