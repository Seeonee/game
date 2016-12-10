// This state is responsible for the title menu.
// Eventually it'll allow a host of options:
// change settings, select levels, load/save, etc.
var TitleMenuState = function(game) {};

// For now, just make a button which launches the level.
TitleMenuState.prototype.create = function() {
    var style = {
        font: 'bold 32px Arial',
        fill: '#FFFFFF',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
    };
    var text = this.game.add.text(0, 0, 'Press X to play', style);
    text.setTextBounds(0, 100, this.game.width, 100);

    this.game.input.gamepad.start();
    this.gpad = new GPad(this.game, this.game.input.gamepad.pad1);
};

// When clicked, start the level.
TitleMenuState.prototype.update = function() {
    var buttonMap = this.game.settings.buttonMap;
    if (this.gpad.justPressed(buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent(buttonMap.SELECT);
        this.startLevel();
    }
}

// When clicked, start the level.
TitleMenuState.prototype.startLevel = function() {
    // TODO: May want to instead transition to a 
    // 'loading level' state which pulls in any 
    // unloaded resources, then goes to 'play level'.
    var levelName = 'level1';
    this.game.state.start('PlayLevelState', true, false,
        levelName, this.gpad);
};
