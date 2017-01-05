// Switch for activating wires.
var WSwitch = function(game, x, y, palette, startClosed, contact) {
    Phaser.Sprite.call(this, game, x, y, 'switch_light');
    this.anchor.setTo(0.5);
    this.color1 = this.game.settings.colors.WHITE.i;
    this.color2 = palette.c2.i;
    this.closed = startClosed;
    this.contact = contact;

    if (!this.contact) {
        this.rotation = Math.PI / 4;
    }

    this.alpha = this.closed ? 1 : WSwitch.ALPHA;
    this.animations.add('closed', [0]);
    this.animations.add('pressed', [1]);
    this.animations.add('open', [2]);
    this.animations.add('contact closed', [3]);
    this.animations.add('contact open', [4]);
    this.setPressed(false);
};

WSwitch.prototype = Object.create(Phaser.Sprite.prototype);
WSwitch.prototype.constructor = WSwitch;

// Constants.
WSwitch.ALPHA = 0.25;
WSwitch.LOCK_TIME = 1000; // ms


// Set our colors.
WSwitch.prototype.updatePalette = function(palette) {
    this.color2 = palette.c2.i;
};

// Close the circuit.
WSwitch.prototype.close = function() {
    if (!this.closed) {
        this.flip();
    }
};

// Break the circuit.
WSwitch.prototype.open = function() {
    if (this.closed) {
        this.flip();
    }
};

// Flip state.
WSwitch.prototype.flip = function() {
    this.closed = !this.closed;
    this.alpha = this.closed ? 1 : WSwitch.ALPHA;
    this.setPressed(false);
};

// Set whether or not we're pressed.
WSwitch.prototype.setPressed = function(pressed) {
    if (this.contact) {
        this.animations.play('contact ' + (this.closed ? 'closed' : 'open'));
    } else if (pressed) {
        this.animations.play('pressed');
    } else {
        this.animations.play(this.closed ? 'closed' : 'open');
    }
};

// Indicate that we can't be pressed again.
WSwitch.prototype.lock = function() {
    var t = this.game.add.tween(this.scale).to({ x: 0, y: 0 },
        WSwitch.LOCK_TIME, Phaser.Easing.Quadratic.In, true);
    t.onComplete.add(function() { this.visible = false; }, this);
};

// Called on tier fade.
WSwitch.prototype.fadingIn = function() {
    var alpha = this.closed ? 1 : WSwitch.ALPHA;
    this.game.add.tween(this).to({ alpha: alpha },
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.None, true,
        Tier.FADE_TIME / 2);
};

// Called on tier fade.
WSwitch.prototype.fadingOut = function() {
    this.alpha = 0;
};








// Graphics for when a switch locks after flipping once.
var SwitchLock = function(game, x, y) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        SwitchLock.prototype.painter, this);
    Phaser.Sprite.call(this, game, x, y, bitmap);
    this.anchor.setTo(0.5);
    this.alpha = 0;

    var time = SwitchLock.TIME;
    var easing = Phaser.Easing.Cubic.In;
    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, time, easing, true);
    var t2 = this.game.add.tween(this.scale);
    t2.to({ x: 0.25, y: 0.25 }, time, easing, true);
    t2.onComplete.add(function() {
        this.destroy();
    }, this);
};

SwitchLock.prototype = Object.create(Phaser.Sprite.prototype);
SwitchLock.prototype.constructor = SwitchLock;


// Constants.
SwitchLock.R = 50;
SwitchLock.TIME = 500; // ms


// Paint our bitmap.
SwitchLock.prototype.painter = function(bitmap) {
    var r = SwitchLock.R;
    var pad = 8;
    Utils.resizeBitmap(bitmap, 2 * (r + pad), 2 * (r + pad));
    var c = bitmap.context;
    c.translate(pad, pad);
    c.strokeStyle = this.game.settings.colors.WHITE.s;
    c.lineWidth = pad;
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.stroke();
};
