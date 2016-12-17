// Title menu.
var TitleMenuIState = function(handler) {
    IMenuState.call(this, TitleMenuIState.NAME, handler, this);
    this.dropCloth = false;
    this.blurBackground = false;
    this.levelNames = [
        'level1',
        'level2',
        'level3',
        'level4'
    ];

    this.root.text = 'mero';
    var selectLevel = this.add('select level');
    for (var i = 0; i < this.levelNames.length; i++) {
        var name = this.levelNames[i];
        selectLevel.add(name, this.selectLevel);
    }
    this.add('exit', this.selectExit, true);
};

TitleMenuIState.NAME = 'menu';
TitleMenuIState.prototype = Object.create(IMenuState.prototype);
TitleMenuIState.prototype.constructor = TitleMenuIState;

// Start up a selected level!
TitleMenuIState.prototype.selectLevel = function(option) {
    var name = option.text;
    this.game.state.getCurrentState().startLevel(name);
};

// User opted to exit. I guess they like the splash page?
TitleMenuIState.prototype.selectExit = function(option) {
    this.close();
    this.activate(PressStartIState.NAME);
};
