// Help text floating beside the avatar during editing.
var HoverText = function(game, level, doNotAnimate) {
    this.game = game;
    this.level = level;
    this.avatar = this.level.avatar;
    this.doNotAnimate = doNotAnimate;

    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    Phaser.Sprite.call(this, game,
        HoverText.X_OFFSET, HoverText.Y_OFFSET);
    this.avatar.addChild(this);
    this.avatar.htext = this;
    this.alpha = 0;

    var bitmap = this.game.bitmapCache.get(
        HoverText.painter);
    this.curtain = this.addChild(
        this.game.add.sprite(-HoverText.CURTAIN_PAD, -HoverText.CURTAIN_PAD,
            bitmap));
    this.curtain.alpha = 0.75;

    this.main = this.addChild(this.game.add.text(
        0, 0, '', style));

    style = {
        font: (font.size + HoverText.SUB_FONT_DELTA) + 'px ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.sub = this.addChild(this.game.add.text(
        0, HoverText.SUB_Y_OFFSET, '', style));

    this.holding = false;
    this.queue = [];
    this.events.onHoldComplete = new Phaser.Signal();
    this.setTier(this.level.tier);
    this.level.events.onTierChange.add(this.setTier, this);
};

HoverText.prototype = Object.create(Phaser.Sprite.prototype);
HoverText.prototype.constructor = HoverText;

// Constants.
HoverText.X_OFFSET = 30;
HoverText.Y_OFFSET = -90;
HoverText.CURTAIN_D = 50;
HoverText.CURTAIN_PAD = 3;
HoverText.SUB_Y_OFFSET = 34;
HoverText.SUB_FONT_DELTA = -8;
HoverText.DEFAULT_HOLD = 1000; // ms
HoverText.APPEAR_TIME = 350; // ms


// Paint our bitmap.
HoverText.painter = function(bitmap) {
    var d = HoverText.CURTAIN_D;
    Utils.resizeBitmap(bitmap, d, d);
    bitmap.context.fillRect(0, 0, d, d);
};

// Change the current tier.
HoverText.prototype.setTier = function(tier, old) {
    this.main.tint = tier.palette.c2.i;
};

// Queue up a text change. If necessary, delays 
// until the current hold expires.
HoverText.prototype.setText = function(text, hold, wipe) {
    if (wipe && this.holding) {
        this.queue = [];
        this.holding = false;
        if (this.event) {
            this.game.time.events.remove(this.event);
        }
    }
    if (!this.holding) {
        this._setText(text, hold);
    } else {
        // Queue it up.
        this.queue.push({ t: text, h: hold });
    }
};

// Set our text. Optionally takes a hold time;
// further text sets will queue up until the hold 
// time expires.
HoverText.prototype._setText = function(text, hold) {
    var i = text.indexOf('\n');
    if (i >= 0) {
        this.main.setText(text.substring(0, i));
        this.sub.setText(text.substring(i + 1));
        var w = 2 * HoverText.CURTAIN_PAD +
            Math.max(this.main.width, this.sub.width);
        var h = 0 * HoverText.CURTAIN_PAD +
            this.main.height + this.sub.height;
    } else {
        this.main.setText(text);
        this.sub.setText('');
        var w = 2 * HoverText.CURTAIN_PAD + this.main.width;
        var h = 0 * HoverText.CURTAIN_PAD + this.main.height;
    }
    if (text.length) {
        this.setCurtainDimensions(w, h);
    } else {
        this.alpha = 0;
    }

    if (hold) {
        hold = hold == true ? HoverText.DEFAULT_HOLD : hold;
        this.holding = true;
        this.event = this.game.time.events.add(
            hold, this.holdExpired, this);
    }
};

// Called when a hold expires.
HoverText.prototype.setCurtainDimensions = function(w, h) {
    if (this.doNotAnimate) {
        this.alpha = 1;
        this.curtain.scale.setTo(w / HoverText.CURTAIN_D,
            h / HoverText.CURTAIN_D);
        return;
    }
    this.alpha = 0;
    var t = this.game.add.tween(this).to({ alpha: 1 },
        HoverText.APPEAR_TIME,
        Phaser.Easing.Sinusoidal.InOut, true,
        HoverText.APPEAR_TIME / 2);

    this.curtain.scale.setTo(0.1);
    var t = this.game.add.tween(this.curtain.scale);
    t.to({ x: w / HoverText.CURTAIN_D, y: h / HoverText.CURTAIN_D },
        HoverText.APPEAR_TIME, Phaser.Easing.Sinusoidal.InOut, true);
};

// Called when a hold expires.
HoverText.prototype.holdExpired = function() {
    this.holding = false;
    do {
        var next = this.queue.shift();
    } while (this.queue.length && next && !next.h);
    if (next) {
        this._setText(next.t, next.h);
    }
};
