// An orbiting ring fragment.
var TextBanner = function(game) {
    this.game = game;
    var bitmap = this.game.bitmapCache.get(
        TextBanner.painter, true);
    Phaser.Sprite.call(this, game, 0, 0, bitmap);
    this.anchor.setTo(0.5);
    this.alpha = 0;
    this.visible = false;

    // Initialize our text.
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.text = this.game.add.text(0, 0, '', style);
    this.addChild(this.text);
    this.text.anchor.setTo(0.5, 0.5);

    // Lock position relative to the camera.
    this.fixedToCamera = true;
};

TextBanner.prototype = Object.create(Phaser.Sprite.prototype);
TextBanner.prototype.constructor = TextBanner;

// Constants.
TextBanner.WIDTH = undefined; // 550;
TextBanner.HEIGHT = 55;
TextBanner.BANNER_ALPHA = 0.75;
TextBanner.BANNER_EDGE_RATIO = 0.35;
TextBanner.FADE_IN_TIME = 1000; // ms
TextBanner.DURATION = 2000; // ms
TextBanner.FADE_OUT_TIME = 1000; // ms


// Paint our bitmap.
TextBanner.painter = function(bitmap) {
    var w = TextBanner.WIDTH != undefined ?
        TextBanner.WIDTH : bitmap.game.camera.width;
    var h = TextBanner.HEIGHT;

    // Initialize the banner.
    Utils.resizeBitmap(bitmap, w, h);
    c = bitmap.context;
    var gradient = c.createLinearGradient(0, 0, w, h);
    var colorEdge = bitmap.game.settings.colors.BLACK.rgba(0);
    var colorMid = bitmap.game.settings.colors.BLACK.rgba(
        TextBanner.BANNER_ALPHA);
    var e = TextBanner.BANNER_EDGE_RATIO;
    gradient.addColorStop(0, colorEdge);
    gradient.addColorStop(e, colorMid);
    gradient.addColorStop(1 - e, colorMid);
    gradient.addColorStop(1, colorEdge);
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);
};

// Throw the banner up for a bit, then fade out and die.
TextBanner.prototype.splash = function(text, zgroup) {
    zgroup.add(this);
    this.text.setText(text);
    this.x = this.game.width / 2;
    this.y = this.game.height / 3;
    this.cameraOffset.setTo(this.x, this.y);
    this.visible = true;

    this.game.scale.onSizeChange.add(this.screenResized, this);
    this.game.scale.onFullScreenChange.add(this.screenResized, this);

    // Alpha should already be at zero.
    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, TextBanner.FADE_OUT_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 0 }, TextBanner.FADE_OUT_TIME,
        Phaser.Easing.Sinusoidal.InOut, false,
        TextBanner.DURATION);
    t2.onComplete.add(function() {
        this.game.scale.onSizeChange.remove(this.screenResized, this);
        this.game.scale.onFullScreenChange.remove(this.screenResized, this);
        this.kill();
    }, this);
    t.chain(t2);
};

// Recenter when screen resizes.
TextBanner.prototype.screenResized = function() {
    this.x = this.game.width / 2;
    this.y = this.game.height / 3;
    this.cameraOffset.setTo(this.x, this.y);
};
