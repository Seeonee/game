// Title menu.
var TitleMenuIState = function(handler, color) {
    IMenuState.call(this, TitleMenuIState.NAME, handler, this);
    this.dropCloth = true;
    this.blurBackground = true;
    this.color = color;
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
        selectLevel.add(name, this.selectLevel, name);
    }
    selectLevel.addCancel('back');
    var settings = Settings.Menu.populateSubmenu(this.add('settings'));
    settings.events.onSettingsUpdate.add(
        this.handler.updateSettings, this.handler);
    this.addCancel('exit', this.selectExit);
};

TitleMenuIState.NAME = 'menu';
TitleMenuIState.prototype = Object.create(IMenuState.prototype);
TitleMenuIState.prototype.constructor = TitleMenuIState;

// Start up a selected level!
TitleMenuIState.prototype.selectLevel = function(option, name) {
    this.game.state.getCurrentState().startLevel(name);
};

// User opted to exit. I guess they like the splash page?
TitleMenuIState.prototype.selectExit = function(option) {
    this.close();
    this.activate(PressStartIState.NAME);
};
