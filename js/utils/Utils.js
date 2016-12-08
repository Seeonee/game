// Base utils class.
var Utils = function() {
    // Initialize constants here.
};

// Global methods.

// Basic angle function.
Utils.angleBetweenPoints = function(x1, y1, x2, y2) {
    return Math.atan2(x2 - x1, y2 - y1);
}

// Basic distance function.
Utils.distanceBetweenPoints = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Get the angle between two angles, restricted to 
// the range [0, Math.PI].
Utils.getBoundedAngleDifference = function(a1, a2) {
    return Math.abs(((a1 - a2 + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI);
}
