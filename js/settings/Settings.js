// Settings class.
// Initializes with default values.
// Eventually, it should be loaded from/exported to JSON.
var Settings = function(game) {
    this.game = game;
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
    this._fullscreen = Settings.FULLSCREEN_OFF;
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

// Property for the fullscreen setting.
Object.defineProperty(Settings.prototype, 'fullscreen', {
    get: function() {
        return this._fullscreen;
    },
    set: function(value) {
        if (this._fullscreen != value) {
            this._fullscreen = value;
            this.game.scale.scaleMode =
                value == Settings.FULLSCREEN_ON ?
                Phaser.ScaleManager.RESIZE :
                Phaser.ScaleManager.NO_SCALE;
        }
    }
});


// Even we have constants!
Settings.HUD_ALWAYS = 0;
Settings.HUD_SOMETIMES = 1;
Settings.HUD_NEVER = 2;

Settings.CONTROLLER_PLAYSTATION = 0;
Settings.CONTROLLER_XBOX = 1;

Settings.FULLSCREEN_ON = 0;
Settings.FULLSCREEN_OFF = 1;


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
Settings.Menu.populateSubmenu = function(parent) {
    var settings = parent.add('settings');
    settings.events.onSettingsUpdate = new Phaser.Signal();
    // Controls for the heads-up display.
    Settings.Menu.createRadialSettingMenu(
        settings, 'HUD display', 'hud', [
            { text: 'always', value: Settings.HUD_ALWAYS },
            { text: 'sometimes', value: Settings.HUD_SOMETIMES },
            { text: 'never', value: Settings.HUD_NEVER }
        ]);
    // Controls for... controlling! Change controller button mappings.
    Settings.Menu.createRadialSettingMenu(
        settings, 'controller', 'controller', [
            { text: 'playstation', value: Settings.CONTROLLER_PLAYSTATION },
            { text: 'xbox', value: Settings.CONTROLLER_XBOX }
        ]);
    // Controls for fullscreen.
    Settings.Menu.createRadialSettingMenu(
        settings, 'fullscreen', 'fullscreen', [
            { text: 'on', value: Settings.FULLSCREEN_ON },
            { text: 'off', value: Settings.FULLSCREEN_OFF }
        ]);
    // Aaaaand a final "get out of here" option.
    settings.addCancel('back');
    return settings;
};

// Creates a submenu for changing a particular setting.
// textValuePairs should be a list of items which each have a 
// .text (what to display) and .value (what to set the setting to).
// This sets up a radial submenu, e.g. you can change the value to 
// any of the possible options, and only one is shown as set at a 
// time.
Settings.Menu.createRadialSettingMenu = function(
    parent, name, settingName, textValuePairs) {
    var option = parent.add(name);
    for (var i = 0; i < textValuePairs.length; i++) {
        var p = textValuePairs[i];
        option.add('◇ ' + p.text, Settings.Menu.changeSetting,
            settingName, p.value);
    }
    option.addCancel('back');
    // This works because each HUD constant corresponds to its 
    // menu index. And yes, that means you have to maintain 
    // them properly and in order.
    option.selected = parent.menu.game.settings[settingName];
    option = option.options[option.selected];
    option.text = '◈' + option.text.substring(1);

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
