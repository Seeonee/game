// Title menu.
var TitleMenuIState = function(handler, color) {
    IMenuState.call(this, TitleMenuIState.NAME, handler, this);
    this.color = color;
    this.root.text = 'mero';

    // General level select.
    var catalog = this.game.state.getCurrentState().catalog;
    this.addCatalogItem(this, catalog, this.selectLevel);

    // Settings.
    var settings = Settings.Menu.populateSubmenu(this.root);
    settings.events.onSettingsUpdate.add(
        this.handler.updateSettings, this.handler);

    // Editor.
    var edit = this.add('create');
    edit.add('from scratch', this.editLevel, undefined);
    this.addCatalogItem(edit.add('from...'), catalog, this.editLevel);
    edit.addCancel('back');

    this.addCancel('exit', this.selectExit);
};

TitleMenuIState.NAME = 'menu';
TitleMenuIState.prototype = Object.create(IMenuState.prototype);
TitleMenuIState.prototype.constructor = TitleMenuIState;

// Recursively add all items from the catalog.
TitleMenuIState.prototype.addCatalogItem = function(parent, item, callback) {
    if (item instanceof Catalog) {
        var option = parent.add(item.name);
        for (var i = 0; i < item.items.length; i++) {
            this.addCatalogItem(option, item.items[i], callback);
        }
        option.addCancel('back');
    } else {
        parent.add(item.name, callback, item);
    }
};

// Start up a selected level!
TitleMenuIState.prototype.selectLevel = function(option, catalogLevel) {
    var params = new LevelStateParams(this.gpad);
    params.catalogLevel = catalogLevel;
    this.game.state.start('PlayLevelState', true, false, params);
};

// Start editing, possibly based on a selected level.
TitleMenuIState.prototype.editLevel = function(option, catalogLevel) {
    var params = new LevelStateParams(this.gpad);
    params.catalogLevel = catalogLevel;
    this.game.state.start('EditLevelState', true, false, params);
};

// User opted to exit. I guess they like the splash page?
TitleMenuIState.prototype.selectExit = function(option) {
    this.close();
    this.activate(PressStartIState.NAME);
};
