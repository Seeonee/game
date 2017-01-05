// Falling squares for the (T)itle menu screen.
var TSquare = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        TSquare.prototype.painter, this);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;

    this.scalemin = TSquare.MIN_SCALE;
    this.scalerange = 1 - this.scalemin;
    this.xmin = this.game.camera.x + TSquare.XBOUNDS;
    this.xrange = this.game.camera.width - (2 * TSquare.XBOUNDS);
    if (TSquare.CASCADE_UP) {
        this.y0 = this.game.camera.y + this.game.camera.height;
        this.y1 = this.game.camera.y;
    } else {
        this.y0 = this.game.camera.y;
        this.y1 = this.game.camera.y + this.game.camera.height;
    }
};

TSquare.prototype = Object.create(Phaser.Sprite.prototype);
TSquare.prototype.constructor = TSquare;

// Constants.
TSquare.D = 200;
TSquare.LIFESPAN = 10000; // ms
TSquare.VARIANCE = 2000; // ms
TSquare.YPAD_RATIO = 1.5;
TSquare.XBOUNDS = 80;
TSquare.MIN_SCALE = 0.1;
TSquare.ROTATION = 0.6 * Math.PI; // 3 * Math.PI;
TSquare.CASCADE_UP = true;


// Paint our bitmap.
TSquare.prototype.painter = function(bitmap) {
    var d = TSquare.D;
    var h = d * Math.sqrt(3 / 4);
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(d / 2, 0);
    c.lineTo(d, h);
    c.closePath();
    c.fill();
    // c.fillRect(0, 0, d, d);
};

// Let the square trickle up.
TSquare.prototype.cascade = function(zgroup, tint) {
    var scale = this.scalemin + Math.random() * this.scalerange;
    this.x = this.xmin + Math.random() * this.xrange;
    var dy = TSquare.D * scale * TSquare.YPAD_RATIO;
    var sign = TSquare.CASCADE_UP ? 1 : -1;
    this.y = this.y0 + sign * dy;
    this.scale.setTo(scale);
    // this.rotation = Math.random() * 2 * Math.PI;
    var dr = (Math.random() - 0.5) * TSquare.ROTATION;
    zgroup.add(this);
    this.tint = tint;
    this.visible = true;

    var time = TSquare.LIFESPAN - TSquare.VARIANCE +
        Math.random() * 2 * TSquare.VARIANCE;
    var t = this.game.add.tween(this);
    t.to({ y: this.y1 - sign * dy, rotation: this.rotation + dr },
        time, Phaser.Easing.Linear.None, true);
    t.onComplete.add(function() {
        this.kill();
    }, this);
};
