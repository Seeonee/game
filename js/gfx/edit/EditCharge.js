// A crude timer for editing.
var EditCharge = function(game, x, y, palette, animate) {
    this.game = game;
    // Can't cache this particular bitmap.
    this._r = EditCharge.STARTING_RADIUS * 4;
    this.bitmap = this.game.add.bitmapData(
        this._r, this._r);
    var c = this.bitmap.context;
    c.strokeStyle = palette.c2.s;
    c.fillStyle = palette.c2.s;
    c.lineWidth = EditCharge.PATH_WIDTH;
    Phaser.Sprite.call(this, game, x, y, this.bitmap);
    this.anchor.setTo(0.5);


    this.animate = animate;
    if (this.animate) {
        this.ratio = 1;
        this.tween = this.game.add.tween(this);
        this.tween.to({ ratio: 0 }, EditCharge.TIME,
            Phaser.Easing.Linear.None, true);
    } else {
        this.ratio = EditCharge.RING_RATIO;
    }
};

EditCharge.prototype = Object.create(Phaser.Sprite.prototype);
EditCharge.prototype.constructor = EditCharge;

// Constants.
EditCharge.STARTING_RADIUS = 25;
EditCharge.ENDING_RADIUS = 5;
EditCharge.PATH_WIDTH = 4;
EditCharge.TIME = 700; // ms
EditCharge.RING_RATIO = 0.2;


// Redraw based on ratio.
EditCharge.prototype.update = function() {
    Phaser.Sprite.prototype.update.call(this);
    if (this.ratio == this.ratioOld) {
        return;
    }
    var ratio = this.ratio;
    if (!this.animate) {
        ratio = Math.sqrt(ratio);
    }
    var c = this.bitmap.context;
    c.clearRect(0, 0, this._r, this._r);
    c.beginPath();
    var radius = EditCharge.ENDING_RADIUS +
        (ratio * (EditCharge.STARTING_RADIUS -
            EditCharge.ENDING_RADIUS));
    c.arc(
        EditCharge.STARTING_RADIUS * 2,
        EditCharge.STARTING_RADIUS * 2,
        radius, 0, 2 * Math.PI, false);
    c.stroke();
    if (ratio == 0) {
        c.fill();
    }
    this.ratioOld = this.ratio;
    this.bitmap.dirty = true;
};

// Update the color.
EditCharge.prototype.setColor = function(palette) {
    this.bitmap.context.strokeStyle = palette.c2.s;
    this.bitmap.context.fillStyle = palette.c2.s;
    this.oldRatio = undefined;
};

// Jump to our final scale.
EditCharge.prototype.restart = function() {
    if (this.tween) {
        this.tween.stop();
    }
    this.animate = true;
    this.ratio = 1;
    this.tween = this.game.add.tween(this);
    this.tween.to({ ratio: 0 }, EditCharge.TIME,
        Phaser.Easing.Linear.None, true);
};

// Jump to our final scale.
EditCharge.prototype.finishPoint = function() {
    if (this.animate) {
        this.tween.stop();
    }
    this.ratio = 0;
};

// Jump to our final scale.
EditCharge.prototype.finishRing = function() {
    this.animate = false;
    this.ratio = EditCharge.RING_RATIO;
};
