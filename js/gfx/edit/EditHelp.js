// Help text floating beside the avatar during editing.
var EditHelp = function(game, level, doNotAnimate) {
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
        EditHelp.X_OFFSET, EditHelp.Y_OFFSET);
    this.avatar.addChild(this);
    this.avatar.help = this;
    this.alpha = 0;

    var bitmap = this.game.bitmapCache.get(
        EditHelp.painter);
    this.curtain = this.addChild(
        this.game.add.sprite(-EditHelp.CURTAIN_PAD, -EditHelp.CURTAIN_PAD,
            bitmap));
    this.curtain.alpha = 0.75;

    this.main = this.addChild(this.game.add.text(
        0, 0, '', style));

    style = {
        font: (font.size + EditHelp.SUB_FONT_DELTA) + 'px ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.sub = this.addChild(this.game.add.text(
        0, EditHelp.SUB_Y_OFFSET, '', style));

    this.holding = false;
    this.queue = [];
    this.events.onHoldComplete = new Phaser.Signal();
    this.setTier(this.level.tier);
    this.level.events.onTierChange.add(this.setTier, this);
};

EditHelp.prototype = Object.create(Phaser.Sprite.prototype);
EditHelp.prototype.constructor = EditHelp;

// Constants.
EditHelp.X_OFFSET = 30;
EditHelp.Y_OFFSET = -90;
EditHelp.CURTAIN_D = 50;
EditHelp.CURTAIN_PAD = 3;
EditHelp.SUB_Y_OFFSET = 34;
EditHelp.SUB_FONT_DELTA = -8;
EditHelp.DEFAULT_HOLD = 1000; // ms
EditHelp.APPEAR_TIME = 350; // ms


// Paint our bitmap.
EditHelp.painter = function(bitmap) {
    var d = EditHelp.CURTAIN_D;
    Utils.resizeBitmap(bitmap, d, d);
    bitmap.context.fillRect(0, 0, d, d);
};

// Change the current tier.
EditHelp.prototype.setTier = function(tier, old) {
    this.main.tint = tier.palette.c2.i;
};

// Queue up a text change. If necessary, delays 
// until the current hold expires.
EditHelp.prototype.setText = function(text, hold, wipe) {
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
EditHelp.prototype._setText = function(text, hold) {
    var i = text.indexOf('\n');
    if (i >= 0) {
        this.main.setText(text.substring(0, i));
        this.sub.setText(text.substring(i + 1));
        var w = 2 * EditHelp.CURTAIN_PAD +
            Math.max(this.main.width, this.sub.width);
        var h = 0 * EditHelp.CURTAIN_PAD +
            this.main.height + this.sub.height;
    } else {
        this.main.setText(text);
        this.sub.setText('');
        var w = 2 * EditHelp.CURTAIN_PAD + this.main.width;
        var h = 0 * EditHelp.CURTAIN_PAD + this.main.height;
    }
    if (text.length) {
        this.setCurtainDimensions(w, h);
    } else {
        this.alpha = 0;
    }

    if (hold) {
        hold = hold == true ? EditHelp.DEFAULT_HOLD : hold;
        this.holding = true;
        this.event = this.game.time.events.add(
            hold, this.holdExpired, this);
    }
};

// Called when a hold expires.
EditHelp.prototype.setCurtainDimensions = function(w, h) {
    if (this.doNotAnimate) {
        this.alpha = 1;
        this.curtain.scale.setTo(w / EditHelp.CURTAIN_D,
            h / EditHelp.CURTAIN_D);
        return;
    }
    this.alpha = 0;
    var t = this.game.add.tween(this).to({ alpha: 1 },
        EditHelp.APPEAR_TIME,
        Phaser.Easing.Sinusoidal.InOut, true,
        EditHelp.APPEAR_TIME / 2);

    this.curtain.scale.setTo(0.1);
    var t = this.game.add.tween(this.curtain.scale);
    t.to({ x: w / EditHelp.CURTAIN_D, y: h / EditHelp.CURTAIN_D },
        EditHelp.APPEAR_TIME, Phaser.Easing.Sinusoidal.InOut, true);
};

// Called when a hold expires.
EditHelp.prototype.holdExpired = function() {
    this.holding = false;
    do {
        var next = this.queue.shift();
    } while (this.queue.length && next && !next.h);
    if (next) {
        this._setText(next.t, next.h);
    }
};
