
// First, a few constants.

// var h = 78; // Height of the basic diamond.
// var r = 1.61; // Golden ratio, used to distort the diamond.
// var Y_OFFSET = h * (1 - (1 / r)) / 2; // Icon offset against the diamond.
var Y_OFFSET = 10; // Simpler, and looks better.

var DIAMOND_FADE_IN = 1000; // ms
var DIAMOND_FADE_OUT = 1000; // ms
var ICON_POWER_UP = 1000; // ms
var ICON_POWER_DOWN = 1000; // ms
var ICON_UNPOWERED_RGB = {r: 0xA4, g: 0xA4, b: 0xA4};
var ICON_POWERED_RGB = {r: 0xFF, g: 0xFF, b: 0xFF};
var ICON_SPIN_UP = 600; // ms
var ICON_SPIN_DOWN = 600; // ms
var ICON_BUMP = 400; // ms


// Fancy class to represent a power-up icon.
var Power = function(game, x, y, name) {
    Phaser.Sprite.call(this, game, x, y); // Superclass constructor.
    this.diamond_fg = this.addChild(game.make.sprite(0, 0, 'power_diamond'));
    this.diamond_fg.anchor.setTo(0.5, 0.5);

    this.diamond_bg = this.addChild(game.make.sprite(0, 0, 'power_diamond'));
    this.diamond_bg.frame = 1;
    this.diamond_bg.alpha = 0;
    this.diamond_bg.anchor.setTo(0.5, 0.5);

    this.icon = this.addChild(game.make.sprite(0, Y_OFFSET, 'power_icon_' + name));
    this.icon.anchor.setTo(0.5, 0.5);
    this.rgb = {r: ICON_UNPOWERED_RGB.r, g: ICON_UNPOWERED_RGB.g, b: ICON_UNPOWERED_RGB.b};

    // Finish initializing ourself.
    this.texture.frame.width = this.diamond_fg.width;
    this.texture.frame.height = this.diamond_fg.height;
    this.anchor.setTo(0.5, 0.5);

    this.inputEnabled = true;
    this.events.onInputOver.add(this.select);
    this.events.onInputOut.add(this.deselect);
    this.events.onInputUp.add(this.clicked);
    this.bumping = false;
};

Power.prototype = Object.create(Phaser.Sprite.prototype);
Power.prototype.constructor = Power;

Power.prototype.update = function() {
    this.icon.tint = (this.rgb.r << 16) + (this.rgb.g << 8) + (this.rgb.b);
};

// These are the effects triggered by mouseover.
Power.prototype.select = function(e) {
    e.diamond_fade_in();
    e.icon_power_up();
    e.icon_spin_up();
};

// This reverses the mouseover effects.
Power.prototype.deselect = function(e) {
    e.diamond_fade_out();
    e.icon_power_down();
    e.icon_spin_down();
};

// This kicks off the click effects.
Power.prototype.clicked = function(e) {
    e.icon_bump();
};

Power.prototype.diamond_fade_in = function() {
    this.game.add.tween(this.diamond_bg).to(
        {alpha: 1}, DIAMOND_FADE_IN, Phaser.Easing.Cubic.Out, true);
};

Power.prototype.diamond_fade_out = function() {
    this.game.add.tween(this.diamond_bg).to(
        {alpha: 0}, DIAMOND_FADE_OUT, Phaser.Easing.Cubic.Out, true);
};

Power.prototype.icon_power_up = function() {
    this.game.add.tween(this.rgb).to(
        ICON_POWERED_RGB, ICON_POWER_UP, Phaser.Easing.Cubic.Out, true);
};

Power.prototype.icon_power_down = function() {
    this.game.add.tween(this.rgb).to(
        ICON_UNPOWERED_RGB, ICON_POWER_DOWN, Phaser.Easing.Cubic.Out, true);
};

Power.prototype.icon_spin_up = function() {
    var tween = this.game.add.tween(this.icon).to(
        {rotation: 2 * Math.PI}, ICON_SPIN_UP, Phaser.Easing.Cubic.InOut, true);
    tween.onComplete.add(function(icon, tween) {
        icon.rotation = 0;
    });
};

Power.prototype.icon_spin_down = function() {
    // this.game.add.tween(this.icon).to(
    //     {rotation: 0}, ICON_SPIN_DOWN, Phaser.Easing.Cubic.InOut, true);
};

Power.prototype.icon_bump = function() {
    if (this.bumping) {return;}
    this.bumping = true;
    this.game.add.tween(this.icon.scale).to(
        {x: 2, y: 2}, ICON_BUMP, Phaser.Easing.Back.In, true);
    var tween = this.game.add.tween(this.icon).to(
        {alpha: 0}, ICON_BUMP - 200, Phaser.Easing.Cubic.Out, true, 350);
    tween.onComplete.add(function(icon, tween) {
        icon.scale = {x: 1, y: 1};
        icon.rotation = 0;
        var tween2 = icon.parent.game.add.tween(icon).to(
            {alpha: 1}, 150, Phaser.Easing.Cubic.Out, true, 200);
        tween2.onComplete.add(function(icon, tween) {
            icon.parent.bumping = false;
        });
    });
};



// Called by the main game's preload()
Power.preload = function(game) {
    game.load.spritesheet('power_diamond', 'assets/powerdiamond.png', 49, 78);
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

