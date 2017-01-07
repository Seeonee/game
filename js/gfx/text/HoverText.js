// Textbox floating beside the avatar; can be used 
// to display temporary or permanent messages.
var HoverText = function(game, level) {
    this.game = game;
    this.level = level;
    this.avatar = this.level.avatar;
    this.animate = true;
    this.tweens = [];

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
    if (this.level.tier) {
        this.setTier(this.level.tier);
    }
    this.level.events.onTierChange.add(this.setTier, this);

    this.showingEmpty = true;
    this.emptyText = '';
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
HoverText.APPEAR_TIME = 400; // ms
HoverText.FADE_TIME = 400; // ms
HoverText.BASE_HOLD = 1000; // ms
HoverText.WORDS_PER_SECOND = 2.5;


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
    this.showingEmpty = false;
    if (wipe && this.holding) {
        this.clearHold();
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
        hold = hold == true ? this.getHoldMSForText(text) : hold;
        hold += !this.animate ? 0 :
            HoverText.APPEAR_TIME + HoverText.FADE_TIME;
        this.holding = true;
        this.event = this.game.time.events.add(
            hold, this.holdExpired, this);
    }
};

// Figure out how long to hold (in milliseconds) for 
// a block of text.
HoverText.prototype.getHoldMSForText = function(text) {
    var words = text.trim().split(/\s+/).length;
    return HoverText.BASE_HOLD + 1000 *
        words / HoverText.WORDS_PER_SECOND;
};

// Called when a hold expires.
HoverText.prototype.setCurtainDimensions = function(w, h) {
    this.clearTweens();
    if (!this.animate) {
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
    this.tweens.push(t);

    this.curtain.scale.setTo(0.1);
    var t = this.game.add.tween(this.curtain.scale);
    t.to({ x: w / HoverText.CURTAIN_D, y: h / HoverText.CURTAIN_D },
        HoverText.APPEAR_TIME, Phaser.Easing.Sinusoidal.InOut, true);
    this.tweens.push(t);
};

// Tween clean.
HoverText.prototype.clearTweens = function() {
    if (this.tweens.length) {
        for (var i = 0; i < this.tweens.length; i++) {
            this.tweens[i].stop();
        }
        this.tweens = [];
    }
};

// Set the text that we display whenever all current text
// fades out.
HoverText.prototype.setEmptyText = function(text) {
    this.emptyText = text ? text : '';
    if (this.showingEmpty) {
        this._setText(this.emptyText);
    }
};

// Clear any text events that we may have queued up.
HoverText.prototype.clearHold = function() {
    this.queue = [];
    this.holding = false;
    if (this.event) {
        this.game.time.events.remove(this.event);
    }
};

// Called when a hold expires.
HoverText.prototype.holdExpired = function() {
    if (!this.animate) {
        this.textFaded();
        return;
    }
    var t = this.game.add.tween(this);
    t.to({ alpha: 0 }, HoverText.FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
    this.tweens.push(t);
    t.onComplete.add(this.textFaded, this);
};

// Called when text fades back out.
HoverText.prototype.textFaded = function() {
    this.holding = false;
    do {
        var next = this.queue.shift();
    } while (this.queue.length && next && !next.h);
    if (next) {
        this._setText(next.t, next.h);
    } else {
        this.showingEmpty = true;
        this._setText(this.emptyText);
    }
};
