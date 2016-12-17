// Settings class.
// Initializes with default values.
// Eventually, it should be loaded from/exported to JSON.
var Settings = function() {
    this.colors = new Colors();
    this.font = {
        size: 30,
        sizePx: '30px',
        name: 'Roboto'
    };
    // this.sounds = new Sounds();
    this.edit = false;
    this.hud = Settings.HUD_SOMETIMES;
    this._controller = Settings.CONTROLLER_PLAYSTATION;
    this.buttonMap = new ButtonMappingsPlaystation();
};

// Make controller a property that affects button map.
Object.defineProperty(Settings.prototype, 'controller', {
    get: function() {
        return this._controller;
    },
    set: function(value) {
        if (this._controller != value) {
            this._controller = value;
            switch (this._controller) {
                case Settings.CONTROLLER_PLAYSTATION:
                default:
                    this.buttonMap = new ButtonMappingsPlaystation();
                    break;
                case Settings.CONTROLLER_XBOX:
                    this.buttonMap = new ButtonMappingsXbox();
                    break;
            }
        }
    }
});


// Even we have constants!
Settings.HUD_ALWAYS = 0;
Settings.HUD_SOMETIMES = 1;
Settings.HUD_NEVER = 2;
Settings.CONTROLLER_PLAYSTATION = 0;
Settings.CONTROLLER_XBOX = 1;

// Restore a JSON'd Settings object.
Settings.load = function(json) {
    var settings = new Settings();
    settings.buttonMap = ButtonMappings.load(json.buttonMap);
    settings.colors = Colors.load(json.colors);
    return settings;
};


// Root object for all our settings menu stuff.
Settings.Menu = {};

// Fill in a settings submenu within a root 
// settings menu option.
Settings.Menu.populateSubmenu = function(settings) {
    // Controls for the heads-up display.
    var hud = settings.add('HUD display');
    hud.add('◇ always', Settings.Menu.changeSetting,
        'hud', Settings.HUD_ALWAYS);
    hud.add('◇ sometimes', Settings.Menu.changeSetting,
        'hud', Settings.HUD_SOMETIMES);
    hud.add('◇ never', Settings.Menu.changeSetting,
        'hud', Settings.HUD_NEVER);
    hud.addCancel('back');
    // This works because each HUD constant corresponds to its menu index.
    hud.selected = settings.menu.game.settings.hud;
    var option = hud.options[hud.selected];
    option.text = '◈' + option.text.substring(1);

    // Controls for... controlling! Change controller button mappings.
    var controller = settings.add('controller');
    controller.add('◇ playstation', Settings.Menu.changeSetting,
        'controller', Settings.CONTROLLER_PLAYSTATION);
    controller.add('◇ xbox', Settings.Menu.changeSetting,
        'controller', Settings.CONTROLLER_XBOX);
    controller.addCancel('back');
    // As above: shenanigans.
    controller.selected = settings.menu.game.settings.controller;
    var option = controller.options[controller.selected];
    option.text = '◈' + option.text.substring(1);

    settings.addCancel('back');
    settings.events.onSettingsUpdate = new Phaser.Signal();
    return settings;
};

// Called when the user changes a radial setting.
Settings.Menu.changeSetting = function(option, settingName, newValue) {
    this.gpad.consumeButtonEvent();
    var parent = option.parent;
    if (parent.selected == option.index) {
        return;
    }
    var old = parent.options[parent.selected];
    parent.selected = option.index;
    old.text = '◇' + old.text.substring(1);
    old.t.setText(old.text);
    option.text = '◈' + option.text.substring(1);
    option.t.setText(option.text);
    this.game.settings[settingName] = newValue;
    parent.parent.events.onSettingsUpdate.dispatch(
        this.game.settings);
};
