// Switch component.
var WSwitchArc = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'switch_plate');
    this.anchor.setTo(0.5, 1);
};

WSwitchArc.prototype = Object.create(Phaser.Sprite.prototype);
WSwitchArc.prototype.constructor = WSwitchArc;


// Switch for activating wires.
var WSwitch = function(game, x, y, palette, startClosed) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.color1 = this.game.settings.colors.WHITE.i;
    this.color2 = this.color1; // palette.c2.i;
    this.closed = startClosed;

    var y = this.closed ? 0 : WSwitch.Y;
    this.rotation = this.closed ? 0 : WSwitch.ANGLE;

    this.arcs = [];
    for (var i = 0; i < 3; i++) {
        var dummy = this.addChild(this.game.add.sprite(0, 0));
        dummy.rotation = i * 2 * Math.PI / 3;
        var arc = dummy.addChild(new WSwitchArc(this.game, 0, y));
        arc.alpha = WSwitch.ALPHA;
        this.arcs.push(arc);
    }
    this.arcs[0].alpha = this.closed ? 1 : WSwitch.ALPHA;
    this.arcs[0].tint = this.closed ? this.color2 : this.color1;
};

WSwitch.prototype = Object.create(Phaser.Sprite.prototype);
WSwitch.prototype.constructor = WSwitch;

// Constants.
WSwitch.ALPHA = 0.25;
WSwitch.TIME = 350; // ms
WSwitch.Y = -10;
WSwitch.ANGLE = 1 * Math.PI;


// Expand/collapse.
WSwitch.prototype.close = function() {
    if (!this.closed) {
        this.closed = true;
        this._resize(true);
    }
};

// Expand/collapse.
WSwitch.prototype.open = function() {
    if (this.closed) {
        this.closed = false;
        this._resize(false);
    }
};

// Internal sizer method.
WSwitch.prototype._resize = function(closed) {
    var y = closed ? 0 : WSwitch.Y;
    var rotation = closed ? 0 : WSwitch.ANGLE;
    var easing = closed ? Phaser.Easing.Sinusoidal.Out :
        Phaser.Easing.Sinusoidal.In;
    this.arcs[0].alpha = closed ? 1 : WSwitch.ALPHA;
    this.arcs[0].tint = closed ? this.color2 : this.color1;
    for (var i = 0; i < 3; i++) {
        this.game.add.tween(this.arcs[i]).to({ y: y },
            WSwitch.TIME, easing, true);
    }
    this.game.add.tween(this).to({ rotation: rotation },
        WSwitch.TIME, easing, true);
};
