// Base utils class.
var Utils = function() {
    // Initialize constants here.
};

// Let's fix string a little bit.
String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

// Global methods.

// Spit out an object's JSON to a new tab.
Utils.writeJSONToNewTab = function(obj) {
    var s = JSON.stringify(obj, null, '  ');
    var newWindow = window.open();
    if (newWindow) {
        s = s.replaceAll('\n', '<br />\n');
        newWindow.document.write(s);
    } else {
        console.log(s);
    }
};

// Basic angle function.
Utils.angleBetweenPoints = function(x1, y1, x2, y2) {
    return Math.atan2(x2 - x1, y2 - y1);
};

// Basic distance function.
Utils.distanceBetweenPoints = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Get the angle between two angles, restricted to 
// the range [0, Math.PI].
Utils.getBoundedAngleDifference = function(a1, a2) {
    return Math.abs(((a1 - a2 + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI);
};

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

// Utility method for finding the closest point.
Utils.findClosestPointToAvatar = function(tier, avatar) {
    var min = Number.POSITIVE_INFINITY;
    var name = undefined;
    var ip = tier.translateGamePointToInternalPoint(avatar.x, avatar.y);
    for (var i = 0; i < tier.points.length; i++) {
        var p = tier.points[i];
        var d = Utils.distanceBetweenPoints(ip.x, ip.y, p.x, p.y);
        if (d < min || !name) {
            min = d;
            name = p.name;
        }
    }
    return name;
};

// Utility method for finding the closest point.
Utils.destroy = function(sprite) {
    if (!sprite) {
        return;
    }
    sprite.destroy();
    if (sprite.parent) {
        sprite.parent.removeChild(sprite);
    }
};

// Update a bitmapData's size.
// You probably want to clear it afterwards and 
// start from scratch.
Utils.resizeBitmap = function(bitmap, width, height) {
    if (width == bitmap.width && height == bitmap.height) {
        return;
    }
    bitmap.width = width;
    bitmap.height = height;

    bitmap.canvas.width = width;
    bitmap.canvas.height = height;

    bitmap.baseTexture.width = width;
    bitmap.baseTexture.height = height;

    bitmap.textureFrame.width = width;
    bitmap.textureFrame.height = height;

    bitmap.texture.width = width;
    bitmap.texture.height = height;
};

// Toggle fullscreen on double-click.
Utils.prepFullscreen = function(game) {
    game.input.onTap.add(Utils.toggleFullscreen);
};

// Toggle fullscreen on double-click.
Utils.toggleFullscreen = function(pointer, isDoubleClick) {
    if (isDoubleClick) {
        var canvas = document.getElementsByTagName('canvas')[0];
        if (game.scale.isFullScreen) {
            game.scale.stopFullScreen();
            canvas.style.cursor = 'default';
        } else {
            game.scale.startFullScreen(false);
            canvas.style.cursor = 'none';
        }
    }
};








// Simple factory for instantiating new sprite-based objects.
// Main goal is that it will return a new sprite if 
// necessary, otherwise it'll revive an earlier one.
// Either way, its reset method is then called.
var SpritePool = function(game, ctor, clearOnStateChange) {
    this.game = game;
    this.ctor = ctor;
    this.all = [];
    if (clearOnStateChange) {
        this.game.state.onStateChange.add(function() {
            for (var i = 0; i < this.all.length; i++) {
                this.all[i].destroy();
            }
            this.all = [];
        }, this);
    }
};

// Instantiate a new sprite.
// If a dead sprite is found, it's revived.
SpritePool.prototype.make = function() {
    var sprite = this.getFirstDead();
    if (!sprite) {
        var args = [this.ctor].concat(
            Array.prototype.slice.call(arguments, 0));
        sprite = Utils.construct.apply(null, args);
        this.all.push(sprite);
    } else {
        sprite.revive();
    }
    return sprite;
};

// Find a currently destroyed sprite.
SpritePool.prototype.getFirstDead = function() {
    var i = 0;
    while (i < this.all.length) {
        if (!this.all[i].alive) {
            return this.all[i];
        }
        i += 1;
    }
    return null;
};

// Kill EVERYTHING.
SpritePool.prototype.killAll = function() {
    for (var i = 0; i < this.all.length; i++) {
        this.all[i].kill();
    }
};
