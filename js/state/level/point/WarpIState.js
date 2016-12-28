// Handle intra-tier warping.
var WarpIState = function(handler, level) {
    IState.call(this, WarpIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.charging = false;
    this.recharging = false;

    this.opool = new SpritePool(this.game, WOrb);
    this.hflash = new HFlash(this.game);
};

WarpIState.NAME = 'warp';
WarpIState.prototype = Object.create(IState.prototype);
WarpIState.prototype.constructor = WarpIState;

// Constants.
WarpIState.HOVER_Y = 44;
WarpIState.FADE_TIME = 250; // ms
WarpIState.AVATAR_FADE_DELAY = 150; // ms


// Called when stepped on.
WarpIState.prototype.activated = function(prev) {
    this.pressed = false;
};

// Called when stepped off.
WarpIState.prototype.deactivated = function(next) {
    this.avatar.setBobble(false);
    this.avatar.setPressed(false);
};

// Handle an update.
WarpIState.prototype.update = function() {
    if (this.charging || this.recharging) {
        return;
    }
    if (!this.avatar.point.isEnabled()) {
        this.avatar.setBobble(false);
        this.pressed = false;
        return false;
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setBobble(false);
        this.avatar.setPressed(true);
        this.pressed = true;
    } else if (this.pressed &&
        this.gpad.released(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.avatar.setPressed(false);
        this.pressed = false;
        this.charge();
    } else {
        this.avatar.setBobble(true);
        return false;
    }
};

// Charge your engines...
WarpIState.prototype.charge = function() {
    this.charging = true;
    var gp = this.level.tier.translateInternalPointToGamePoint(
        this.avatar.point.x, this.avatar.point.y);
    this.orb = this.opool.make(this.game);
    this.level.z.fg.tier().add(this.orb);
    this.orb.charge(gp.x, gp.y);
    this.orb.events.onCharged.add(this.warp, this);

    var t = this.game.add.tween(this.avatar);
    t.to({ alpha: 0 }, WarpIState.FADE_TIME,
        Phaser.Easing.Cubic.Out, true, WarpIState.AVATAR_FADE_DELAY);
};

// ...and blast off!
WarpIState.prototype.warp = function() {
    this.charging = false;
    this.recharging = true;
    var to = this.avatar.point.to;
    var point = this.level.tier.pointMap[to];
    var angle = Utils.angleBetweenPoints(
        this.avatar.point.x, this.avatar.point.y, point.x, point.y);
    angle = -angle;
    this.avatar.point = point;
    var gp = this.level.tier.translateInternalPointToGamePoint(
        this.avatar.point.x, this.avatar.point.y);
    this.hflash.flash(this.level.z.fg.tier(),
        gp.x, gp.y - WarpIState.HOVER_Y, angle);
    this.avatar.x = point.gx;
    this.avatar.y = point.gy;
    this.avatar.alpha = 1;
    this.avatar.updateAttachment();

    this.orb.fizzle();
    this.orb.events.onFizzled.addOnce(function(orb) {
        orb.kill();
    }, this, 1, this.orb);
    this.orb = undefined;
    this.recharging = false;
};
