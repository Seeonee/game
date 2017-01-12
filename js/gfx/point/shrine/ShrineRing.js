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

    this.spinner = this.addChild(this.game.add.sprite(0, 0));
    this.spinner.anchor.setTo(0.5);
    this.startSpinner();

    this.arcs = [];
    for (var i = 0; i < 3; i++) {
        var dummy = this.spinner.addChild(this.game.add.sprite(0, 0));
        dummy.rotation = i * 2 * Math.PI / 3;
        var arc = dummy.addChild(new ShrineRingArc(this.game, 0, y));
        arc.alpha = ShrineRing.ALPHA;
        this.arcs.push(arc);
    }
    this.arcs[0].alpha = this.closed ? 1 : ShrineRing.ALPHA;
    this.arcs[0].tint = this.closed ? this.color2 : this.color1;
    this.tweens = [];
};

ShrineRing.prototype = Object.create(Phaser.Sprite.prototype);
ShrineRing.prototype.constructor = ShrineRing;

// Constants.
ShrineRing.ALPHA = 0.25;
ShrineRing.TIME = 350; // ms
ShrineRing.Y = -10;
ShrineRing.ANGLE = 1 * Math.PI;
ShrineRing.SPIN_TIME = 20000; // ms


// Set our colors.
ShrineRing.prototype.updatePalette = function(palette) {
    this.color2 = palette.c2.i;
};

// (Re)start our ongoing spin.
ShrineRing.prototype.startSpinner = function() {
    this.stopSpinner();
    this.spinner.rotation = 0;
    var t = this.game.add.tween(this.spinner);
    t.to({ rotation: -2 * Math.PI },
        ShrineRing.SPIN_TIME, Phaser.Easing.Linear.None,
        true, 0, Number.POSITIVE_INFINITY);
    this.spinTween = t;
};

// End our ongoing spin.
ShrineRing.prototype.stopSpinner = function() {
    if (this.spinTween) {
        this.spinTween.stop();
        this.spinTween = undefined;
    }
};

// Tween clean.
ShrineRing.prototype.clearTweens = function() {
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    this.tweens = [];
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
        var t = this.game.add.tween(this.arcs[i]);
        t.to({ y: y }, ShrineRing.TIME, easing, true);
        this.tweens.push(t);
    }
    var t = this.game.add.tween(this);
    t.to({ rotation: rotation }, ShrineRing.TIME, easing, true);
    this.tweens.push(t);
};

// Shrine has crumbled.
ShrineRing.prototype.break = function() {
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, ShrineRing.TIME, Phaser.Easing.Linear.None, true);
    t.onComplete.add(function() {
        this.stopSpinner();
    }, this);
    this.tweens.push(t);
};

// Reset after a save/restore.
ShrineRing.prototype.resetVisited = function() {
    this.clearTweens();
    this.rotation = 0;
    this.alpha = 1;
    this.closed = true;

    this.arcs[0].alpha = 1;
    this.arcs[0].tint = this.color2;
    for (var i = 0; i < 3; i++) {
        this.arcs[i].y = 0;
    }
    this.startSpinner();
};

// Reset after a save/restore.
ShrineRing.prototype.resetUnvisited = function() {
    this.clearTweens();
    this.rotation = ShrineRing.ANGLE;
    this.alpha = 1;
    this.closed = false;

    this.arcs[0].alpha = ShrineRing.ALPHA;
    this.arcs[0].tint = this.color1;
    for (var i = 0; i < 3; i++) {
        this.arcs[i].y = ShrineRing.Y;
    }
    this.startSpinner();
};
