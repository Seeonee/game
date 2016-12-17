// Settings class.
// Initializes with default values.
// Eventually, it should be loaded from/exported to JSON.
var Settings = function() {
    this.buttonMap = new ButtonMappings();
    this.colors = new Colors();
    this.font = {
        size: 30,
        sizePx: '30px',
        name: 'Roboto'
    };
    // this.sounds = new Sounds();
    this.edit = false;
    this.hud = Settings.HUD_SOMETIMES;
};

// Even we have constants!
Settings.HUD_ALWAYS = 0;
Settings.HUD_SOMETIMES = 1;
Settings.HUD_NEVER = 2;

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
    var hud = settings.add('show HUD');
    hud.add('◇ always', Settings.Menu.showHUD, Settings.HUD_ALWAYS);
    hud.add('◇ sometimes', Settings.Menu.showHUD, Settings.HUD_SOMETIMES);
    hud.add('◇ never', Settings.Menu.showHUD, Settings.HUD_NEVER);
    // This works because each HUD constant corresponds to its menu index.
    hud.selected = settings.menu.game.settings.hud;
    var option = hud.options[hud.selected];
    option.text = '◈' + option.text.substring(1);
    hud.addCancel('back');
    settings.addCancel('back');
    settings.events.onSettingsUpdate = new Phaser.Signal();
    return settings;
};

// Called when the user changes the show HUD option.
Settings.Menu.showHUD = function(option, hudSetting) {
    this.gpad.consumeButtonEvent();
    var hud = option.parent;
    if (hud.selected == option.index) {
        return;
    }
    var old = hud.options[hud.selected];
    hud.selected = option.index;
    old.text = '◇' + old.text.substring(1);
    old.t.setText(old.text);
    option.text = '◈' + option.text.substring(1);
    option.t.setText(option.text);
    this.game.settings.hud = hudSetting;
    hud.parent.events.onSettingsUpdate.dispatch(
        this.game.settings);
};
