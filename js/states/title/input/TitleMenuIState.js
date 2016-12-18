// Title menu.
var TitleMenuIState = function(handler, color) {
    IMenuState.call(this, TitleMenuIState.NAME, handler, this);
    this.color = color;


    this.root.text = 'mero';
    var catalog = this.game.state.getCurrentState().catalog;
    this.addCatalogItem(this, catalog);
    var settings = Settings.Menu.populateSubmenu(this.root);
    settings.events.onSettingsUpdate.add(
        this.handler.updateSettings, this.handler);
    this.addCancel('exit', this.selectExit);
};

TitleMenuIState.NAME = 'menu';
TitleMenuIState.prototype = Object.create(IMenuState.prototype);
TitleMenuIState.prototype.constructor = TitleMenuIState;

// Recursively add all items from the catalog.
TitleMenuIState.prototype.addCatalogItem = function(parent, item) {
    if (item instanceof Catalog) {
        var option = parent.add(item.name);
        for (var i = 0; i < item.items.length; i++) {
            this.addCatalogItem(option, item.items[i]);
        }
        option.addCancel('back');
    } else {
        parent.add(item.name, this.selectLevel, item);
    }
};

// Start up a selected level!
TitleMenuIState.prototype.selectLevel = function(option, catalogLevel) {
    this.game.state.getCurrentState().startLevel(catalogLevel);
};

// User opted to exit. I guess they like the splash page?
TitleMenuIState.prototype.selectExit = function(option) {
    this.close();
    this.activate(PressStartIState.NAME);
};
