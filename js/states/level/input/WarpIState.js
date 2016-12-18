// Handle intra-tier warping.
var WarpIState = function(handler, level) {
    IState.call(this, WarpIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.charging = false;
    this.recharging = false;

    var r = WarpIState.R1;
    var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = this.game.settings.colors.WHITE.s;
    c.arc(r, r, r, 0, Math.PI * 2, false);
    c.fill();
    this.orb = this.game.add.sprite(0, 0, bitmap);
    this.orb.anchor.setTo(0.5);
    this.orb.visible = false;

    this.hflash = new HFlash(this.game);
};

WarpIState.NAME = 'warp';
WarpIState.prototype = Object.create(IState.prototype);
WarpIState.prototype.constructor = WarpIState;

// Constants.
WarpIState.R1 = 100;
WarpIState.R2 = 20;
WarpIState.HOVER_Y = 44;
WarpIState.FADE_TIME = 250; // ms
WarpIState.AVATAR_FADE_DELAY = 150; // ms
WarpIState.SCALE_TIME = 450; // ms

// Handle an update.
WarpIState.prototype.update = function() {
    if (this.charging || this.recharging) {
        return;
    }
    if (this.avatar.point.isEnabled() &&
        this.gpad.justReleased(this.buttonMap.WARP)) {
        this.gpad.consumeButtonEvent();
        this.charge();
    } else {
        return false;
    }
};

// Avatar turns into a ball of light.
WarpIState.prototype.charge = function() {
    this.charging = true;
    var gp = this.level.tier.translateInternalPointToGamePoint(
        this.avatar.point.x, this.avatar.point.y);
    this.level.z.fg.tier().add(this.orb);
    this.orb.x = gp.x;
    this.orb.y = gp.y - WarpIState.HOVER_Y;
    this.orb.scale.setTo(1);
    this.orb.alpha = 0;
    this.orb.visible = true;

    var t = this.game.add.tween(this.orb);
    t.to({ alpha: 1 }, WarpIState.FADE_TIME,
        Phaser.Easing.Cubic.Out, true);
    var t2 = this.game.add.tween(this.avatar);
    t2.to({ alpha: 0 }, WarpIState.FADE_TIME,
        Phaser.Easing.Cubic.Out, true, WarpIState.AVATAR_FADE_DELAY);
    var t3 = this.game.add.tween(this.orb.scale);
    var scale = WarpIState.R2 / WarpIState.R1;
    t3.to({ x: scale, y: scale }, WarpIState.SCALE_TIME,
        Phaser.Easing.Quadratic.Out, true);
    t3.onComplete.add(this.warp, this);
};

// Avatar turns into a ball of light.
WarpIState.prototype.warp = function() {
    this.charging = false;
    this.recharging = true;
    var point = this.avatar.point.toPoint; // WarpPoint.toPoint
    var angle = Utils.angleBetweenPoints(
        this.avatar.point.x, this.avatar.point.y, point.x, point.y);
    angle = -angle;
    this.avatar.point = point;
    var gp = this.level.tier.translateInternalPointToGamePoint(
        this.avatar.point.x, this.avatar.point.y);
    this.hflash.flash(this.level.z.fg.tier(),
        gp.x, gp.y - WarpIState.HOVER_Y, angle);
    this.level.z.fg.tier().add(this.orb);
    this.avatar.alpha = 1;
    this.avatar.updateAttachment();

    var t = this.game.add.tween(this.orb.scale);
    var scale = 0.05;
    t.to({ x: scale, y: scale }, WarpIState.FADE_TIME,
        Phaser.Easing.Quartic.Out, true);
    t.onComplete.add(function() {
        this.orb.visible = false;
        this.recharging = false;
    }, this);
};
