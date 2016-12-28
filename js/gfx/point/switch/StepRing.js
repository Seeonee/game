// Switch component.
var StepRingArc = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'switch_ring');
    this.anchor.setTo(0.5, 1);
};

StepRingArc.prototype = Object.create(Phaser.Sprite.prototype);
StepRingArc.prototype.constructor = StepRingArc;


// Switch for activating wires.
var StepRing = function(game, x, y, palette, startClosed) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.color1 = this.game.settings.colors.WHITE.i;
    this.color2 = palette.c2.i;
    this.closed = startClosed;

    var y = this.closed ? 0 : StepRing.Y;
    this.rotation = this.closed ? 0 : StepRing.ANGLE;

    this.arcs = [];
    for (var i = 0; i < 3; i++) {
        var dummy = this.addChild(this.game.add.sprite(0, 0));
        dummy.rotation = i * 2 * Math.PI / 3;
        var arc = dummy.addChild(new StepRingArc(this.game, 0, y));
        arc.alpha = StepRing.ALPHA;
        this.arcs.push(arc);
    }
    this.arcs[0].alpha = this.closed ? 1 : StepRing.ALPHA;
    this.arcs[0].tint = this.closed ? this.color2 : this.color1;
};

StepRing.prototype = Object.create(Phaser.Sprite.prototype);
StepRing.prototype.constructor = StepRing;

// Constants.
StepRing.ALPHA = 0.25;
StepRing.TIME = 350; // ms
StepRing.Y = -10;
StepRing.ANGLE = 1 * Math.PI;


// Set our colors.
StepRing.prototype.updatePalette = function(palette) {
    this.color2 = palette.c2.i;
};

// Expand/collapse.
StepRing.prototype.close = function() {
    if (!this.closed) {
        this.closed = true;
        this._resize(true);
    }
};

// Expand/collapse.
StepRing.prototype.open = function() {
    if (this.closed) {
        this.closed = false;
        this._resize(false);
    }
};

// Internal sizer method.
StepRing.prototype._resize = function(closed) {
    var y = closed ? 0 : StepRing.Y;
    var rotation = closed ? 0 : StepRing.ANGLE;
    var easing = closed ? Phaser.Easing.Sinusoidal.Out :
        Phaser.Easing.Sinusoidal.In;
    this.arcs[0].alpha = closed ? 1 : StepRing.ALPHA;
    this.arcs[0].tint = closed ? this.color2 : this.color1;
    for (var i = 0; i < 3; i++) {
        this.game.add.tween(this.arcs[i]).to({ y: y },
            StepRing.TIME, easing, true);
    }
    this.game.add.tween(this).to({ rotation: rotation },
        StepRing.TIME, easing, true);
};
