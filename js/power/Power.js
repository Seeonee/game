// Fancy class to represent a power-up icon.
var Power = function(game, x, y, name, angle) {
    Phaser.Sprite.call(this, game, x, y); // Superclass constructor.

    var colors = this.game.settings.colors;
    this.diamondUnpowered = colors.RED.i;
    this.diamondPowered = colors.RED.i;
    this.iconUnpowered = colors.WHITE.i;
    this.iconPowered = colors.WHITE.i;

    // Create our graphics.
    this.diamond = this.addChild(game.make.sprite(
        0, Power.DIAMOND_Y_OFFSET, 'power_diamond'));
    this.diamond.anchor.setTo(0.5, 0);

    this.iconY = Power.DIAMOND_Y_OFFSET + Power.ICON_Y_OFFSET +
        (this.diamond.height * 0.5);
    this.icon = this.addChild(game.make.sprite(
        0, this.iconY, 'power_icon_' + name));
    this.icon.anchor.setTo(0.5, 0.5);

    // Power it down by default.
    this.diamond_rgb = Power.rgb(this.diamondUnpowered);
    this.diamond.scale.setTo(Power.DIAMOND_SCALE);
    this.icon_rgb = Power.rgb(this.iconUnpowered);
    this.icon.alpha = 0;
    this.icon.y -= Power.ICON_SLIDE;

    // Finish initializing ourself.
    this.texture.frame.width = this.diamond.width;
    this.texture.frame.height = this.diamond.height;
    this.anchor.setTo(0.5, 0.5);

    if (angle) {
        this.setRotation(angle);
    }
    this.tweens = [];
};

Power.prototype = Object.create(Phaser.Sprite.prototype);
Power.prototype.constructor = Power;

// Constants.
Power.DIAMOND_Y_OFFSET = 9;
Power.ICON_Y_OFFSET = 10;
Power.DIAMOND_SCALE = 0.35;
Power.DIAMOND_FADE_IN = 400; // ms
Power.DIAMOND_FADE_OUT = 300; // ms
Power.ICON_POWER_UP = 400; // ms
Power.ICON_POWER_DOWN = 200; // ms
Power.ICON_SLIDE = 25;
Power.ICON_POWER_DELAY = 100; // ms

// Convert a hex color int into an rgb "tuple".
Power.rgb = function(color) {
    return {
        r: (color >> 16) & 0xFF,
        g: (color >> 8) & 0xFF,
        b: (color) & 0xFF
    };
}

// Twist our rotation.
Power.prototype.setRotation = function(angle) {
    this.rotation = angle;
    this.icon.rotation = -angle;
};

// On update, redo our tints.
Power.prototype.update = function() {
    this.icon.tint = (this.icon_rgb.r << 16) +
        (this.icon_rgb.g << 8) +
        (this.icon_rgb.b);
    this.diamond.tint = (this.diamond_rgb.r << 16) +
        (this.diamond_rgb.g << 8) +
        (this.diamond_rgb.b);
};

// These are the effects triggered by mouseover.
Power.prototype.select = function() {
    this.clearTweens();
    this.diamond_fade_in();
    this.icon_power_up();
};

// This reverses the mouseover effects.
Power.prototype.deselect = function() {
    this.clearTweens();
    this.diamond_fade_out();
    this.icon_power_down();
};

// Stop all currently firing tweens.
Power.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Triggers our main diamond to scale up and change tint.
Power.prototype.diamond_fade_in = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Power.rgb(this.diamondPowered), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: 1, y: 1 },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our main diamond to scale down and change tint.
Power.prototype.diamond_fade_out = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Power.rgb(this.diamondUnpowered), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: Power.DIAMOND_SCALE, y: Power.DIAMOND_SCALE },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our icon to fade-slide in and change tint.
Power.prototype.icon_power_up = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Power.rgb(this.iconPowered), Power.ICON_POWER_UP,
        Phaser.Easing.Cubic.Out, true, Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 1 },
        Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ y: this.iconY },
        Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        Power.ICON_POWER_DELAY));
};

// Triggers our icon to fade-slide out and change tint.
Power.prototype.icon_power_down = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Power.rgb(this.iconUnpowered), Power.ICON_POWER_DOWN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 0 },
        Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ y: this.iconY - Power.ICON_SLIDE },
        Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
};
