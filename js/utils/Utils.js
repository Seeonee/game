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

// Construct a class. You can pass one or more arguments 
// after the class, and they'll be supplied to the constructor.
Utils.construct = function(ctor) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new(ctor.bind.apply(ctor, [null].concat(args)))();
};

// Extend one associative array with the contents 
// of another.
// Returns the first array (which gets extended).
Utils.extend = function(a1, a2) {
    var keys = Object.keys(a2);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (a2.hasOwnProperty(key)) {
            a1[key] = a2[key];
        }
    }
    return a1;
};

// Helper function for clearing a bitmap arc.
Utils.clearArc = function(context, x, y, r) {
    context.beginPath();
    context.globalCompositeOperation = 'destination-out';
    context.arc(x, y, r, 0, 2 * Math.PI, true);
    context.fill();
    context.globalCompositeOperation = 'source-over';
};
