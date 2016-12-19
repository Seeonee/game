// An orbiting ring fragment.
var TextBanner = function(game, x, y) {
    this.game = game;
    var w = TextBanner.WIDTH != undefined ?
        TextBanner.WIDTH : this.game.camera.width;
    var h = TextBanner.HEIGHT;
    x = x != undefined ? x : (this.game.camera.width / 2);
    y = y != undefined ? y : (this.game.camera.height / 3);

    // Initialize the banner.
    var bitmap = this.game.add.bitmapData(w, h);
    c = bitmap.context;
    var gradient = c.createLinearGradient(0, 0, w, h);
    var colorEdge = this.game.settings.colors.BLACK.rgba(0);
    var colorMid = this.game.settings.colors.BLACK.rgba(
        TextBanner.BANNER_ALPHA);
    var e = TextBanner.BANNER_EDGE_RATIO;
    gradient.addColorStop(0, colorEdge);
    gradient.addColorStop(e, colorMid);
    gradient.addColorStop(1 - e, colorMid);
    gradient.addColorStop(1, colorEdge);
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);
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
    this.cameraOffset.setTo(x, y);
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


// Throw the banner up for a bit, then fade out and die.
TextBanner.prototype.splash = function(text, zgroup) {
    zgroup.add(this);
    this.text.setText(text);
    this.visible = true;

    // Alpha should already be at zero.
    var t = this.game.add.tween(this);
    t.to({ alpha: 1 }, TextBanner.FADE_OUT_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
    var t2 = this.game.add.tween(this);
    t2.to({ alpha: 0 }, TextBanner.FADE_OUT_TIME,
        Phaser.Easing.Sinusoidal.InOut, false,
        TextBanner.DURATION);
    t2.onComplete.add(function() {
        this.kill();
    }, this);
    t.chain(t2);
};
