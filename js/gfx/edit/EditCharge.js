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
        this.tween.to({ ratio: 0 }, EditCharge.CHARGE_TIME,
            Phaser.Easing.Linear.InOut, true);
    } else {
        this.ratio = 0.2;
    }
};

EditCharge.prototype = Object.create(Phaser.Sprite.prototype);
EditCharge.prototype.constructor = EditCharge;

// Constants.
EditCharge.STARTING_RADIUS = 25;
EditCharge.ENDING_RADIUS = 5;
EditCharge.PATH_WIDTH = 4;
EditCharge.CHARGE_TIME = 700; // ms


// Redraw based on ratio.
EditCharge.prototype.update = function() {
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

// Jump to our final scale.
EditCharge.prototype.finish = function() {
    if (this.animate) {
        this.tween.stop();
        this.ratio = 0;
    }
};
