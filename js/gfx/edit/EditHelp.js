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

    this.setTier(this.level.tier);
    this.level.events.onTierChange.add(this.setTier, this);
};

EditHelp.prototype = Object.create(Phaser.Text.prototype);
EditHelp.prototype.constructor = EditHelp;

// Constants.
EditHelp.X_OFFSET = 30;
EditHelp.Y_OFFSET = -90;


// Change the current tier.
EditHelp.prototype.setTier = function(tier, old) {
    this.tint = tier.palette.c2.i;
};
