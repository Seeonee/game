// Portal marker.
var PGate = function(game, x, y, palette, direction) {
    this.game = game;
    if (PGate.CACHED_BITMAP == undefined) {
        var r = PGate.RADIUS;
        // Leave some slack for the path width.
        var factor = 3;
        var bitmap = this.game.add.bitmapData(
            factor * r, factor * r);
        var c = bitmap.context;
        c.strokeStyle = this.game.settings.colors.WHITE.s;
        c.lineWidth = Tier.PATH_WIDTH;
        c.beginPath();
        c.arc(factor * r / 2, factor * r / 2,
            r, 0, 2 * Math.PI, false);
        c.stroke();
        PGate.CACHED_BITMAP = bitmap;
    }
    Phaser.Sprite.call(this, game, x, y, PGate.CACHED_BITMAP);
    this.anchor.setTo(0.5);
    this.tint = palette.c1.i;

    // Triangles center weirdly; shift to look better.
    var dy = -Math.sign(direction) * 2;
    this.triangle = this.game.make.sprite(0, dy, 'smoke');
    this.addChild(this.triangle);
    this.triangle.anchor.setTo(0.5);
    if (direction < 0) {
        this.triangle.rotation = Math.PI;
    }

    this.enabled = true;
};

PGate.prototype = Object.create(Phaser.Sprite.prototype);
PGate.prototype.constructor = PGate;

// Constants.
PGate.RADIUS = 35 / 2;
PGate.DISABLED_TRIANGLE_ALPHA = 0.25;
PGate.DISABLED_TRIANGLE_SCALE = 0.7;


// Set our colors.
PGate.prototype.updatePalette = function(palette) {
    this.tint = palette.c1.i;
};

// Set our enabled state.
PGate.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    this.enabled = enabled;
    if (this.enabled) {
        this.triangle.alpha = 1;
        this.triangle.scale.setTo(1);
    } else {
        this.triangle.alpha = PGate.DISABLED_TRIANGLE_ALPHA;
        this.triangle.scale.setTo(PGate.DISABLED_TRIANGLE_SCALE);
    }
};
