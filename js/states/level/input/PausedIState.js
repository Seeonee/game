// Pause the game.
var PausedIState = function(handler, level) {
    IMenuState.call(this, PausedIState.NAME, handler, this);
    this.level = level;
    this.dropCloth = true;
    this.blurBackground = true;

    this.root.text = level.name;
    this.add('continue', this.selectContinue, true);
    var more = this.add('more');
    var evenMore = more.add('even more');
    more.add('restart', this.selectRestart);
    more.add('back', null, true);
    evenMore.add('back again', null, true);
    this.add('exit', this.selectExit);
};

PausedIState.NAME = 'paused';
PausedIState.prototype = Object.create(IMenuState.prototype);
PausedIState.prototype.constructor = PausedIState;

// Called when the game is first paused.
PausedIState.prototype.activated = function(prev) {
    this.game.paused = true;
    this.color = this.level.tier.palette.c1;
    IMenuState.prototype.activated.call(this, prev);
};

// User opted to unpause.
PausedIState.prototype.selectContinue = function(option) {
    this.unpause();
    this.activate(UnpausedIState.NAME);
};

// User opted to restart.
PausedIState.prototype.selectRestart = function(option) {
    this.unpause();
    this.game.state.start('PlayLevelState', true, false,
        this.level.name, this.gpad);
};

// User opted to exit.
PausedIState.prototype.selectExit = function(option) {
    this.unpause();
    this.game.state.start('TitleMenuState');
};

// Unpause the game.
PausedIState.prototype.unpause = function() {
    this.close();
    this.game.paused = false;
};
