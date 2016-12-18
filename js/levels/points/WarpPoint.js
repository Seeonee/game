// A point that allows transitioning to other tiers.
var WarpPoint = function(name, x, y, to) {
    Point.call(this, name, x, y);
    this.emitters = [];
    this.tweens = [];
    this.z = Point.Z + 1;
    this.to = to;
    this.toPoint = undefined;
    this.istateName = WarpIState.NAME;
};

WarpPoint.TYPE = 'warp';
WarpPoint.prototype = Object.create(Point.prototype);
WarpPoint.prototype.constructor = WarpPoint;

// Set up our factory.
Point.load.factory[WarpPoint.TYPE] = WarpPoint;

// Some more constants.
WarpPoint.RADIUS = 20;
WarpPoint.PATH_RATIO = 0.6;
WarpPoint.EMBER_RADIUS = 4;
WarpPoint.EMBER_TIME = 1000; // ms
WarpPoint.EMBER_DELAY = 1400; // ms
WarpPoint.CONTRAIL_LENGTH = 250;
WarpPoint.CONTRAIL_WITHER = 4;
WarpPoint.FLICKER_TIME = 700; // ms


// During our first draw, we create the emitters.
WarpPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
    this.tier = tier;
    this.game = tier.game;
    var c = tier.bitmap.context;
    var r = WarpPoint.RADIUS;
    var x = this.x - r / 2;
    var y = this.y - r / 2;
    Utils.clearArc(c, this.x, this.y, r / 2);
    if (!this.drawn) {
        this.toPoint = tier.pointMap[this.to];
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.strokeStyle = tier.palette.c1.s;
        c.lineWidth = Tier.PATH_WIDTH * WarpPoint.PATH_RATIO;
        c.beginPath();
        c.arc(r, r, r / 2, 0, 2 * Math.PI, false);
        c.stroke();
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.image = this.game.make.sprite(ap.x, ap.y, bitmap);
        this.tier.image.addChild(this.image);
        this.image.anchor.setTo(0.5, 0.5);

        r = WarpPoint.EMBER_RADIUS;
        bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        c = bitmap.context;
        c.fillStyle = this.game.settings.colors.WHITE.s;
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        this.ember = this.game.make.sprite(0, 0, bitmap);
        this.image.addChild(this.ember);
        this.ember.anchor.setTo(0.5, 0.5);
        this.ember.alpha = 0;

        var w = WarpPoint.CONTRAIL_LENGTH;
        var h = 2 * r;
        var h2 = h * WarpPoint.CONTRAIL_WITHER;
        var maxh = Math.max(h, h2);
        var dy = (maxh - h) / 2;
        var dh = (maxh - h2) / 2;
        bitmap = this.game.add.bitmapData(w, maxh);
        c = bitmap.context;
        var gradient = c.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, this.game.settings.colors.WHITE.s);
        gradient.addColorStop(0.95, this.game.settings.colors.WHITE.rgba(0));
        c.fillStyle = gradient;
        c.beginPath();
        c.moveTo(0, dy);
        c.lineTo(w, dh);
        c.lineTo(w, maxh - dh);
        c.lineTo(0, maxh - dy);
        c.lineTo(0, 0);
        c.closePath();
        c.fill();
        this.contrail = this.game.make.sprite(0, 0, bitmap);
        this.image.addChild(this.contrail);
        this.contrail.anchor.setTo(0, 0.5);
        this.contrail.alpha = 0;
        var angle = Utils.angleBetweenPoints(this.x, this.y,
            this.toPoint.x, this.toPoint.y);
        angle = Math.PI / 2 - angle;
        this.contrail.rotation = angle;

        var t = this.game.add.tween(this.ember);
        t.to({ alpha: 1 }, WarpPoint.EMBER_TIME,
            Phaser.Easing.Sinusoidal.InOut, true,
            WarpPoint.EMBER_DELAY, Number.POSITIVE_INFINITY, true);
        t.repeatDelay(WarpPoint.EMBER_DELAY);
        this.tweens.push(t);
    }
};

// Un/pause our tweens.
WarpPoint.prototype.setTweensPaused = function(paused) {
    for (var i = 0; i < this.tweens.length; i++) {
        if (paused) {
            this.tweens[i].pause();
        } else {
            this.tweens[i].resume();
        }
    }
};

// Light up the warp point.
WarpPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    this.setTweensPaused(true);
    this.ember.alpha = 1;
    this.contrail.alpha = 1;
    this.ctween = this.game.add.tween(this.contrail);
    this.ctween.to({ alpha: 0.3 }, WarpPoint.FLICKER_TIME,
        Phaser.Easing.Bounce.InOut, true,
        0, Number.POSITIVE_INFINITY, true);
};

// Lights out for the warp point.
WarpPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    this.setTweensPaused(false);
    this.contrail.alpha = 0;
    this.ctween.stop();
};


// Delete our tweens.
WarpPoint.prototype.delete = function() {
    if (this.ctween) {
        this.ctween.stop();
    }
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
};

// JSON conversion of a warp point.
WarpPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = WarpPoint.TYPE;
    result.to = this.to;
    return result;
};

// Load a JSON representation of a warp point.
WarpPoint.load = function(game, name, json) {
    return new WarpPoint(name, json.x, json.y, json.to);
};
