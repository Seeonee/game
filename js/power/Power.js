var ICON_SPIN_UP = 600; // ms
var ICON_SPIN_DOWN = 600; // ms

// Fancy class to represent a power-up icon.
var Power = function(game, x, y, name, angle) {
    Phaser.Sprite.call(this, game, x, y); // Superclass constructor.
    this.diamond = this.addChild(game.make.sprite(
        0, Power.DIAMOND_Y_OFFSET, 'power_diamond'));
    this.diamond.anchor.setTo(0.5, 0);

    this.iconY = Power.DIAMOND_Y_OFFSET + Power.ICON_Y_OFFSET +
        (this.diamond.height * 0.5);
    this.icon = this.addChild(game.make.sprite(
        0, this.iconY, 'power_icon_' + name));
    this.icon.anchor.setTo(0.5, 0.5);

    // Power it down by default.
    this.diamond_rgb = Power.rgb(Power.DIAMOND_UNPOWERED);
    this.diamond.scale.setTo(Power.DIAMOND_SCALE);
    this.icon_rgb = Power.rgb(Power.ICON_UNPOWERED);
    this.icon.alpha = 0;
    this.icon.y -= Power.ICON_SLIDE;

    // Finish initializing ourself.
    this.texture.frame.width = this.diamond.width;
    this.texture.frame.height = this.diamond.height;
    this.anchor.setTo(0.5, 0.5);

    // this.inputEnabled = true;
    // this.events.onInputOver.add(this.select);
    // this.events.onInputOut.add(this.deselect);

    if (angle) {
        this.setRotation(angle);
    }
    this.tweens = [];
};

Power.prototype = Object.create(Phaser.Sprite.prototype);
Power.prototype.constructor = Power;

// Some constants.
Power.DIAMOND_Y_OFFSET = 9;
Power.ICON_Y_OFFSET = 10;
Power.DIAMOND_SCALE = 0.35;
Power.DIAMOND_UNPOWERED = COLOR.RED.i;
Power.DIAMOND_POWERED = COLOR.RED.i;
Power.ICON_UNPOWERED = COLOR.WHITE.i;
Power.ICON_POWERED = COLOR.WHITE.i;
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
Power.prototype.select = function(e) {
    e.clearTweens();
    e.diamond_fade_in();
    e.icon_power_up();
};

// This reverses the mouseover effects.
Power.prototype.deselect = function(e) {
    e.clearTweens();
    e.diamond_fade_out();
    e.icon_power_down();
};

// Stop all currently firing tweens.
Power.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
};

Power.prototype.diamond_fade_in = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Power.rgb(Power.DIAMOND_POWERED), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: 1, y: 1 },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

Power.prototype.diamond_fade_out = function() {
    this.tweens.push(this.game.add.tween(this.diamond_rgb).to(
        Power.rgb(Power.DIAMOND_UNPOWERED), Power.DIAMOND_FADE_IN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.diamond.scale).to({ x: Power.DIAMOND_SCALE, y: Power.DIAMOND_SCALE },
        Power.DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true));
};

Power.prototype.icon_power_up = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Power.rgb(Power.ICON_POWERED), Power.ICON_POWER_UP,
        Phaser.Easing.Cubic.Out, true, Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 1 },
        Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        Power.ICON_POWER_DELAY));
    this.tweens.push(this.game.add.tween(this.icon).to({ y: this.iconY },
        Power.ICON_POWER_UP, Phaser.Easing.Cubic.Out, true,
        Power.ICON_POWER_DELAY));
};

Power.prototype.icon_power_down = function() {
    this.tweens.push(this.game.add.tween(this.icon_rgb).to(
        Power.rgb(Power.ICON_UNPOWERED), Power.ICON_POWER_DOWN,
        Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ alpha: 0 },
        Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
    this.tweens.push(this.game.add.tween(this.icon).to({ y: this.iconY - Power.ICON_SLIDE },
        Power.ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true));
};



// Called by the main game's preload()
Power.preload = function(game) {
    game.load.image('power_diamond', 'assets/powerdiamond.png');
    game.load.image('power_icon_crown', 'assets/power_crown.png');
    game.load.image('power_icon_hourglass', 'assets/power_hourglass.png');
    game.load.image('power_icon_stealth', 'assets/power_stealth.png');
    game.load.image('power_icon_might', 'assets/power_might.png');
    game.load.image('power_icon_wit', 'assets/power_wit.png');
    game.load.image('power_icon_presence', 'assets/power_presence.png');
    game.load.image('power_icon_sword', 'assets/power_sword.png');
    game.load.image('power_icon_axe', 'assets/power_axe.png');
    game.load.image('power_icon_shield', 'assets/power_shield.png');
};
