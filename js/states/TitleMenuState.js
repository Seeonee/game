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
    var text = this.game.add.text(0, 0, 'Click to play', style);
    text.setTextBounds(0, 100, this.game.width, 100);
    this.game.input.onDown.addOnce(this.startLevel);
};

// When clicked, start the level.
TitleMenuState.prototype.startLevel = function() {
    // TODO: May want to instead transition to a 
    // 'loading level' state which pulls in any 
    // unloaded resources, then goes to 'play level'.
    var levelName = 'level2';
    this.game.state.start('PlayLevelState', true, false, levelName);
};
