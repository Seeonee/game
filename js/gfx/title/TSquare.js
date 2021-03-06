// Falling squares for the (T)itle menu screen.
var TSquare = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        TSquare.painter, true);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5, 0.5);
    this.visible = false;
};

TSquare.prototype = Object.create(Phaser.Sprite.prototype);
TSquare.prototype.constructor = TSquare;

// Constants.
TSquare.D = 200;
TSquare.LIFESPAN = 10000; // ms
TSquare.VARIANCE = 2000; // ms
TSquare.YPAD_RATIO = 1.5;
TSquare.XBOUNDS = 50;
TSquare.MIN_SCALE = 0.1;
TSquare.ROTATION = 0.6 * Math.PI; // 3 * Math.PI;
TSquare.CASCADE_UP = true;


// Paint our bitmap.
TSquare.painter = function(bitmap) {
    var d = TSquare.D;
    var h = d * Math.sqrt(3 / 4);
    Utils.resizeBitmap(bitmap, d, d);
    var c = bitmap.context;
    c.fillStyle = bitmap.game.settings.colors.WHITE.s;
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(d / 2, 0);
    c.lineTo(d, h);
    c.closePath();
    c.fill();
    // c.fillRect(0, 0, d, d);

    TSquare.scalemin = TSquare.MIN_SCALE;
    TSquare.scalerange = 1 - TSquare.scalemin;
    TSquare.xmin = bitmap.game.camera.x + TSquare.XBOUNDS;
    TSquare.xrange = bitmap.game.camera.width - (2 * TSquare.XBOUNDS);
    if (TSquare.CASCADE_UP) {
        TSquare.y0 = bitmap.game.camera.height;
        TSquare.y1 = 0;
    } else {
        TSquare.y0 = 0;
        TSquare.y1 = bitmap.game.camera.height;
    }
};

// Let the square trickle up.
TSquare.prototype.cascade = function(zgroup, tint) {
    var scale = TSquare.scalemin + Math.random() * TSquare.scalerange;
    this.x = TSquare.xmin + Math.random() * TSquare.xrange;
    var dy = TSquare.D * scale * TSquare.YPAD_RATIO;
    var sign = TSquare.CASCADE_UP ? 1 : -1;
    this.y = TSquare.y0 + sign * dy;
    this.scale.setTo(scale);
    // this.rotation = Math.random() * 2 * Math.PI;
    var dr = (Math.random() - 0.5) * TSquare.ROTATION;
    zgroup.add(this);
    this.tint = tint;
    this.visible = true;

    var time = TSquare.LIFESPAN - TSquare.VARIANCE +
        Math.random() * 2 * TSquare.VARIANCE;
    var t = this.game.add.tween(this);
    t.to({ y: TSquare.y1 - sign * dy, rotation: this.rotation + dr },
        time, Phaser.Easing.Linear.None, true);
    t.onComplete.add(function() {
        this.kill();
    }, this);

    this.alpha = Math.random() > 0.8 ? 0.5 : 1;
    if (Math.random() > 0.5) {
        var time = 1000 + Math.random() * 1000;
        var delay = 2000 + Math.random() * 3000;
        var easing = Phaser.Easing.Sinusoidal.InOut;
        var t = this.game.add.tween(this);
        t.to({ alpha: 0.1 }, time, easing, true,
            delay / 2, Number.POSITIVE_INFINITY, true);
        t.repeatDelay(delay);
    }
    this.tween = t;
    this.events.onKilled.add(function() {
        this.tween.stop();
    }, this);
};
