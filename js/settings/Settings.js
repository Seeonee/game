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
Settings.HUD_SOMETIMES = 0;
Settings.HUD_NEVER = 1;
Settings.HUD_ALWAYS = 2;

// Restore a JSON'd Settings object.
Settings.load = function(json) {
    var settings = new Settings();
    settings.buttonMap = ButtonMappings.load(json.buttonMap);
    settings.colors = Colors.load(json.colors);
    return settings;
};
