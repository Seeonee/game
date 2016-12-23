// Fancy class to represent a power-up icon.
var Power = function(game, x, y, name, palette, angle) {
    this.enabled = true;
    this.selected = false;
    Phaser.Sprite.call(this, game, x, y); // Superclass constructor.

    this.diamondTint = palette.c2.i;
    this.whiteTint = this.game.settings.colors.WHITE.i;
    this.diamondUnpowered = this.diamondTint;
    this.diamondPowered = this.diamondTint;
    this.iconUnpowered = this.whiteTint;
    this.iconPowered = this.whiteTint;

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
    this.diamond_rgb = Color.rgb(this.diamondUnpowered);
    this.diamond.scale.setTo(Power.DIAMOND_SCALE);
    this.icon_rgb = Color.rgb(this.iconUnpowered);
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
Power.DISABLED_DIAMOND_ALPHA = 0.25;

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
    this.selected = true;
    this.clearTweens();
    this.diamond_fade_in();
    this.icon_power_up();
};

// This reverses the mouseover effects.
Power.prototype.deselect = function() {
    this.clearTweens();
    this.diamond_fade_out();
    this.icon_power_down();
    this.selected = false;
};

// Set our enabled state.
Power.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    this.enabled = enabled;
    this.clearTweens();
    this.diamond.alpha = this.enabled ?
        1 : Power.DISABLED_DIAMOND_ALPHA;
    this.diamondUnpowered = this.enabled ?
        this.diamondTint : this.whiteTint;
    this.diamondPowered = this.enabled ?
        this.diamondTint : this.whiteTint;
    this.diamond_rgb = Color.rgb(this.selected ?
        this.diamondPowered : this.diamondUnpowered);
    this.diamond.scale.setTo(this.selected ?
        1 : Power.DIAMOND_SCALE);
    this.icon.alpha = this.selected ? 1 : 0;
    this.icon.y = this.selected ?
        this.iconY : this.iconY - Power.ICON_SLIDE;
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
        Color.rgb(this.diamondPowered), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: 1, y: 1 },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our main diamond to scale down and change tint.
Power.prototype.diamond_fade_out = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Color.rgb(this.diamondUnpowered), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({
            x: Power.DIAMOND_SCALE,
            y: Power.DIAMOND_SCALE
        },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our icon to fade-slide in and change tint.
Power.prototype.icon_power_up = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Color.rgb(this.iconPowered), Power.ICON_POWER_UP,
        Phaser.Easing.Cubic.Out, true, Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 1 },
        Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon)
        .to({ y: this.iconY },
            Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
            Power.ICON_POWER_DELAY));
};

// Triggers our icon to fade-slide out and change tint.
Power.prototype.icon_power_down = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Color.rgb(this.iconUnpowered), Power.ICON_POWER_DOWN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 0 },
        Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon)
        .to({ y: this.iconY - Power.ICON_SLIDE },
            Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
};
