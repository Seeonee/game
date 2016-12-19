// A single object to encapsulate any of 
// the parameters we might pass to a level state.
// 
// Gamepad is the only real required parameter.
var LevelStateParams = function(gpad) {
    this.gpad = gpad;

    // We usually want a catalog level object.
    // This is the level we'll load from a .json file.
    // Even if we're editing, this can be set; it just 
    // tells us what level to load as a starting point.
    // If it's blank, and we're editing, it means to 
    // start with a blank canvas.
    // If it's blank and we're not editing, problem!
    this.catalogLevel = undefined;

    // This can be used when resetting a level that's 
    // currently being edited. If we receive it, we'll 
    // load the level directly from this json instead 
    // of searching for a .json file matching the catalog.
    this.json = undefined;

    // This can be set to true to indicate that the level 
    // is restarting rather than starting fresh. It's mainly 
    // used to do things like hide the "what level is this?"
    // splash (since the user probably knows by now).
    this.restart = false;
};
