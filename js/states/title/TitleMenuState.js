// This state is responsible for the title menu.
// Eventually it'll allow a host of options:
// change settings, select levels, load/save, etc.
var TitleMenuState = function(game) {};

// For now, just make a button which launches the level.
TitleMenuState.prototype.create = function() {
    this.game.stage.backgroundColor = this.game.settings.colors.BACKGROUND.i;
    this.game.input.gamepad.start();
    this.gpad = new GPad(this.game, this.game.input.gamepad.pad1);

    this.z = new ZGroup(this.game, ['bg', 'mg', 'fg']);
    this.z.createSubgroup('menu', false);

    // TODO: Fade in stuff prior to popping up the menu?
    // Have a "press start" to bring up initial menu?
    this.menuhandler = new TitleMenuIHandler(
        this.game, this.gpad);
};

// Update loop.
TitleMenuState.prototype.update = function() {
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
