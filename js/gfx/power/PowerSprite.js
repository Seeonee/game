// Fancy class to represent a power-up icon.
var PowerSprite = function(game, x, y, name, palette, angle) {
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
        0, PowerSprite.DIAMOND_Y_OFFSET, 'power_diamond'));
    this.diamond.anchor.setTo(0.5, 0);

    this.iconY = PowerSprite.DIAMOND_Y_OFFSET + PowerSprite.ICON_Y_OFFSET +
        (this.diamond.height * 0.5);
    this.icon = this.addChild(game.make.sprite(
        0, this.iconY, 'power_icon_' + name));
    this.icon.anchor.setTo(0.5, 0.5);

    // Power it down by default.
    this.diamond_rgb = Color.rgb(this.diamondUnpowered);
    this.diamond.scale.setTo(PowerSprite.DIAMOND_SCALE);
    this.icon_rgb = Color.rgb(this.iconUnpowered);
    this.icon.alpha = 0;
    this.icon.y -= PowerSprite.ICON_SLIDE;

    // Finish initializing ourself.
    this.texture.frame.width = this.diamond.width;
    this.texture.frame.height = this.diamond.height;
    this.anchor.setTo(0.5, 0.5);

    if (angle) {
        this.setRotation(angle);
    }
    this.tweens = [];
};

PowerSprite.prototype = Object.create(Phaser.Sprite.prototype);
PowerSprite.prototype.constructor = PowerSprite;

// Constants.
PowerSprite.DIAMOND_Y_OFFSET = 9;
PowerSprite.ICON_Y_OFFSET = 10;
PowerSprite.DIAMOND_SCALE = 0.35;
PowerSprite.DIAMOND_FADE_IN = 400; // ms
PowerSprite.DIAMOND_FADE_OUT = 300; // ms
PowerSprite.ICON_POWER_UP = 400; // ms
PowerSprite.ICON_POWER_DOWN = 200; // ms
PowerSprite.ICON_SLIDE = 25;
PowerSprite.ICON_POWER_DELAY = 100; // ms
PowerSprite.DISABLED_DIAMOND_ALPHA = 0.25;


// Set our colors.
PowerSprite.prototype.updatePalette = function(palette) {
    this.diamondTint = palette.c2.i;
    this.diamondUnpowered = this.diamondTint;
    this.diamondPowered = this.diamondTint;
    this.diamond_rgb = Color.rgb(this.selected ?
        this.diamondPowered : this.diamondUnpowered);
    this.diamond.tint = (this.diamond_rgb.r << 16) +
        (this.diamond_rgb.g << 8) +
        (this.diamond_rgb.b);
};

// Twist our rotation.
PowerSprite.prototype.setRotation = function(angle) {
    this.rotation = angle;
    this.icon.rotation = -angle;
};

// On update, redo our tints.
PowerSprite.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    this.icon.tint = (this.icon_rgb.r << 16) +
        (this.icon_rgb.g << 8) +
        (this.icon_rgb.b);
    this.diamond.tint = (this.diamond_rgb.r << 16) +
        (this.diamond_rgb.g << 8) +
        (this.diamond_rgb.b);
};

// These are the effects triggered by mouseover.
PowerSprite.prototype.select = function() {
    this.selected = true;
    this.clearTweens();
    this.diamond_fade_in();
    this.icon_power_up();
};

// This reverses the mouseover effects.
PowerSprite.prototype.deselect = function() {
    this.clearTweens();
    this.diamond_fade_out();
    this.icon_power_down();
    this.selected = false;
};

// Set our enabled state.
PowerSprite.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    this.enabled = enabled;
    this.clearTweens();
    this.diamond.alpha = this.enabled ?
        1 : PowerSprite.DISABLED_DIAMOND_ALPHA;
    this.diamondUnpowered = this.enabled ?
        this.diamondTint : this.whiteTint;
    this.diamondPowered = this.enabled ?
        this.diamondTint : this.whiteTint;
    this.diamond_rgb = Color.rgb(this.selected ?
        this.diamondPowered : this.diamondUnpowered);
    this.diamond.scale.setTo(this.selected ?
        1 : PowerSprite.DIAMOND_SCALE);
    this.icon.alpha = this.selected ? 1 : 0;
    this.icon.y = this.selected ?
        this.iconY : this.iconY - PowerSprite.ICON_SLIDE;
};

// Stop all currently firing tweens.
PowerSprite.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

// Triggers our main diamond to scale up and change tint.
PowerSprite.prototype.diamond_fade_in = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Color.rgb(this.diamondPowered), PowerSprite.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: 1, y: 1 },
        PowerSprite.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our main diamond to scale down and change tint.
PowerSprite.prototype.diamond_fade_out = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Color.rgb(this.diamondUnpowered), PowerSprite.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({
            x: PowerSprite.DIAMOND_SCALE,
            y: PowerSprite.DIAMOND_SCALE
        },
        PowerSprite.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our icon to fade-slide in and change tint.
PowerSprite.prototype.icon_power_up = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Color.rgb(this.iconPowered), PowerSprite.ICON_POWER_UP,
        Phaser.Easing.Cubic.Out, true, PowerSprite.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 1 },
        PowerSprite.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        PowerSprite.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon)
        .to({ y: this.iconY },
            PowerSprite.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
            PowerSprite.ICON_POWER_DELAY));
};

// Triggers our icon to fade-slide out and change tint.
PowerSprite.prototype.icon_power_down = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Color.rgb(this.iconUnpowered), PowerSprite.ICON_POWER_DOWN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 0 },
        PowerSprite.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon)
        .to({ y: this.iconY - PowerSprite.ICON_SLIDE },
            PowerSprite.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
};

// Triggers our icon to fade-slide out and change tint.
PowerSprite.prototype.purchase = function() {
    var t = this.game.add.tween(this.diamond);
    t.to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.Out, true);
    var t2 = this.game.add.tween(this.icon);
    t2.to({ alpha: 0 }, 1500, Phaser.Easing.Quartic.Out);
    t.chain(t2);
    t2.onComplete.add(function() {
        this.destroy();
    }, this);
};
