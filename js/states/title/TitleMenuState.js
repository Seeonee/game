// This state is responsible for the title menu.
// Eventually it'll allow a host of options:
// change settings, select levels, load/save, etc.
var TitleMenuState = function(game) {};

// We can be passed a color palette to use.
// Otherwise, we'll choose at random.
TitleMenuState.prototype.init = function(palette) {
    this.palette = palette;
};
// For now, just make a button which launches the level.
TitleMenuState.prototype.create = function() {
    if (!this.palette) {
        var i = Math.floor(Math.random() * (7 + 1));
        this.palette = this.game.settings.colors['t' + i];
    }
    this.game.stage.backgroundColor = this.palette.c3.i;
    this.game.input.gamepad.start();
    this.gpad = new GPad(this.game, this.game.input.gamepad.pad1);

    this.z = new ZGroup(this.game, ['bg', 'mg', 'fg']);
    this.z.createSubgroup('menu', false);

    // TODO: Fade in stuff prior to popping up the menu?
    // Have a "press start" to bring up initial menu?
    this.menuhandler = new TitleMenuIHandler(
        this.game, this.gpad, this.palette.c1);

    this.tsPool = new SpritePool(this.game, TSquare);
};

// Update loop.
TitleMenuState.prototype.update = function() {
    if (Math.random() < 0.01) {
        this.tsPool.make(this.game).cascade(
            this.z.fg, this.palette.c1.i);
    }
    this.menuhandler.update();
}

// Render loop.
TitleMenuState.prototype.render = function() {
    this.menuhandler.render();
}

// When clicked, start the level.
TitleMenuState.prototype.startLevel = function(levelName) {
    // TODO: May want to instead transition to a 
    // 'loading level' state which pulls in any 
    // unloaded resources, then goes to 'play level'.
    this.game.state.start('PlayLevelState', true, false,
        levelName, this.gpad);
};
