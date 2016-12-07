// Settings class.
// Initializes with default values.
// Eventually, it should be loaded from/exported to JSON.
var Settings = function() {
    this.buttonMap = new ButtonMappings();
    this.colors = new Colors();
    // this.sounds = new Sounds();
};

// Restore a JSON'd Settings object.
Settings.load = function(json) {
    var settings = new Settings();
    settings.buttonMap = ButtonMappings.load(json.buttonMap);
    settings.colors = Colors.load(json.colors);
    return settings;
};