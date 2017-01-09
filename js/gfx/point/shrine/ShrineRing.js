// Switch component.
var ShrineRingArc = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'shrine_ring');
    this.anchor.setTo(0.5, 1);
};

ShrineRingArc.prototype = Object.create(Phaser.Sprite.prototype);
ShrineRingArc.prototype.constructor = ShrineRingArc;








// Switch for activating wires.
var ShrineRing = function(game, x, y, palette, startClosed) {
    Phaser.Sprite.call(this, game, x, y);
    this.anchor.setTo(0.5);
    this.color1 = this.game.settings.colors.WHITE.i;
    this.color2 = palette.c2.i;
    this.closed = startClosed;

    var y = this.closed ? 0 : ShrineRing.Y;
    this.rotation = this.closed ? 0 : ShrineRing.ANGLE;

    this.arcs = [];
    for (var i = 0; i < 3; i++) {
        var dummy = this.addChild(this.game.add.sprite(0, 0));
        dummy.rotation = i * 2 * Math.PI / 3;
        var arc = dummy.addChild(new ShrineRingArc(this.game, 0, y));
        arc.alpha = ShrineRing.ALPHA;
        this.arcs.push(arc);
    }
    this.arcs[0].alpha = this.closed ? 1 : ShrineRing.ALPHA;
    this.arcs[0].tint = this.closed ? this.color2 : this.color1;
};

ShrineRing.prototype = Object.create(Phaser.Sprite.prototype);
ShrineRing.prototype.constructor = ShrineRing;

// Constants.
ShrineRing.ALPHA = 0.25;
ShrineRing.TIME = 350; // ms
ShrineRing.Y = -10;
ShrineRing.ANGLE = 1 * Math.PI;


// Set our colors.
ShrineRing.prototype.updatePalette = function(palette) {
    this.color2 = palette.c2.i;
};

// Expand/collapse.
ShrineRing.prototype.close = function() {
    if (!this.closed) {
        this.closed = true;
        this._resize(true);
    }
};

// Expand/collapse.
ShrineRing.prototype.open = function() {
    if (this.closed) {
        this.closed = false;
        this._resize(false);
    }
};

// Internal sizer method.
ShrineRing.prototype._resize = function(closed) {
    var y = closed ? 0 : ShrineRing.Y;
    var rotation = closed ? 0 : ShrineRing.ANGLE;
    var easing = closed ? Phaser.Easing.Sinusoidal.Out :
        Phaser.Easing.Sinusoidal.In;
    this.arcs[0].alpha = closed ? 1 : ShrineRing.ALPHA;
    this.arcs[0].tint = closed ? this.color2 : this.color1;
    for (var i = 0; i < 3; i++) {
        this.game.add.tween(this.arcs[i]).to({ y: y },
            ShrineRing.TIME, easing, true);
    }
    this.game.add.tween(this).to({ rotation: rotation },
        ShrineRing.TIME, easing, true);
};
