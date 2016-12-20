// Help text floating beside the avatar during editing.
var EditHelp = function(game, level) {
    this.game = game;
    this.level = level;
    this.avatar = this.level.avatar;

    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    Phaser.Text.call(this, game,
        EditHelp.X_OFFSET, EditHelp.Y_OFFSET, '', style);
    this.avatar.addChild(this);
    this.avatar.help = this;

    this.holding = false;
    this.queue = [];
    this.events.onHoldComplete = new Phaser.Signal();
    this.setTier(this.level.tier);
    this.level.events.onTierChange.add(this.setTier, this);
};

EditHelp.prototype = Object.create(Phaser.Text.prototype);
EditHelp.prototype.constructor = EditHelp;

// Constants.
EditHelp.X_OFFSET = 30;
EditHelp.Y_OFFSET = -90;
EditHelp.DEFAULT_HOLD = 1000;


// Change the current tier.
EditHelp.prototype.setTier = function(tier, old) {
    this.tint = tier.palette.c2.i;
};

// Queue up a text change. If necessary, delays 
// until the current hold expires.
EditHelp.prototype.setText = function(text, hold) {
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
    Phaser.Text.prototype.setText.call(this, text);
    if (hold) {
        hold = hold == true ? EditHelp.DEFAULT_HOLD : hold;
        this.holding = true;
        this.game.time.events.add(hold, this.holdExpired, this);
    }
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
