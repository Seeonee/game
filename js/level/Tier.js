// Set up one tier of a wider level.
var Tier = function(game, name) {
    this.name = name;
    this.index = parseInt(this.name.substring(1));
    this.game = game;
    this.level = undefined; // Set during load.
    this.x = 0;
    this.y = 0;
    this.shiftX = Tier.PADDING;
    this.shiftY = Tier.PADDING;
    this.renderNeeded = false;

    this.points = [];
    this.paths = [];
    this.wires = [];
    this.obstacles = [];
    this.objects = [];
    this.pointMap = {};
    this.pathMap = {};
    this.wireMap = {};
    this.obstacleMap = {};
    this.coords = {};
    this.obstacleCoords = {};

    // Bitmap gets set up later.
    this.bitmap = undefined;
    this.image = undefined;
    this._bgimage = undefined;

    this.palette = this.game.settings.colors[name];

    this.faded = false;
    this.hidden = false;
    this.fading = false;
    this.fades = [];
    this.events = {
        onFadingIn: new Phaser.Signal(),
        onFadedIn: new Phaser.Signal(),
        onFadingOut: new Phaser.Signal(),
        onFadedOut: new Phaser.Signal(),
        onUnhiding: new Phaser.Signal(),
        onUnhidden: new Phaser.Signal(),
        onHidden: new Phaser.Signal(),
        onHiding: new Phaser.Signal()
    };
};

// Constants.
Tier.PADDING = 5;
Tier.CAMERA_PADDING = 5000;
Tier.PATH_WIDTH = 7;
Tier.LINE_CAP_STYLE = 'butt';
Tier.LINE_JOIN_STYLE = 'round';
Tier.LINE_DASH = [18, 7];
Tier.LINE_DASH_OFFSET = 11;
Tier.FADE_TIME = 750; // ms
Tier.FADE_SCALE_UP = 2.5;
Tier.FADE_SCALE_DOWN = 1.75;
Tier.FADE_ALPHA_UP = 0.05;
Tier.FADE_ALPHA_DOWN = 0.1;
Tier.HIDE_SCALE_UP = Math.pow(Tier.FADE_SCALE_DOWN, 2);
Tier.HIDE_SCALE_DOWN = Math.pow(Tier.FADE_SCALE_DOWN, 2);
Tier.HIDE_ALPHA_UP = 0;
Tier.HIDE_ALPHA_DOWN = 0;
Tier.BLUR = 15;


// Return a string that can be used to name a new point.
Tier.prototype.getNewPointName = function() {
    var i = 0;
    while (this.pointMap['p' + i]) {
        i += 1;
    }
    return 'p' + i;
};

// Return a string that can be used to name a new path.
Tier.prototype.getNewPathName = function() {
    var i = 0;
    while (this.pathMap['a' + i]) {
        i += 1;
    }
    return 'a' + i;
};

// Return a string that can be used to name a new wire.
Tier.prototype.getNewWireName = function() {
    var i = 0;
    while (this.wireMap['w' + i]) {
        i += 1;
    }
    return 'w' + i;
};

// Return a string that can be used to name a new obstacle.
Tier.prototype.getNewObstacleName = function(type) {
    type = type ? type : 'o';
    var i = 0;
    while (this.obstacleMap[type + i]) {
        i += 1;
    }
    return type + i;
};

// Track a coordinate we've occupied.
Tier.prototype.trackCoords = function(coords) {
    this.coords[coords] = true;
};

// Forget a coordinate we've occupied.
Tier.prototype.forgetCoords = function(coords) {
    delete this.coords[coords];
};

// Track an obstacle's coordinates.
Tier.prototype.trackObstacle = function(obstacle) {
    this.obstacleCoords[obstacle.coords()] = obstacle;
};

// Forget an obstacle's coordinates.
Tier.prototype.forgetObstacle = function(obstacle) {
    delete this.obstacleCoords[obstacle.coords()];
};

// Create a new point, optionally connected to an existing one.
// Returns the newly created point.
Tier.prototype.addPoint = function(name, x, y, point2) {
    var point = new Point(name, x, y);
    this._addPoint(point);
    if (point2 != undefined) {
        this.addPath(this.getNewPathName(), point, point2);
    }
    return point;
};

// Internal use only.
// Adds an already-constructed point.
Tier.prototype._addPoint = function(point) {
    point.x += this.shiftX;
    point.y += this.shiftY;
    point.tier = this;
    this.points.push(point);
    this.pointMap[point.name] = point;
    this.events.onFadingIn.add(point.fadingIn, point);
    this.events.onFadedIn.add(point.fadedIn, point);
    this.events.onFadingOut.add(point.fadingOut, point);
    this.events.onFadedOut.add(point.fadedOut, point);
    if (this.game.settings.edit) {
        this.trackCoords(point.coords());
    }
    return point;
};

// Tear an existing point wholly out of existence, 
// and replace it in all ways with a new point.
// This will update *every* reference to the old point.
Tier.prototype.replacePoint = function(old, point) {
    // Copy over a bunch of values.
    point.name = old.name;
    point.tier = old.tier;
    point.x = old.x;
    point.y = old.y;
    point.gx = old.gx;
    point.gy = old.gy;
    point.avatar = old.avatar;
    point.attached = old.attached;
    // Change all paths to link with us instead.
    for (var i = 0; i < old.paths.length; i++) {
        var path = old.paths[i];
        point.paths.push(path);
        path.p1 === old ? path.p1 = point : path.p2 = point;
    }
    old.paths = [];
    while (old.wires.length) {
        old.wires[0].replaceEnd(old, point);
    }
    old.wires = [];
    // Update the tier's lists.
    // Can't use the helpers since we've already changed 
    // the lists ourselves.
    var index = this.points.indexOf(old);
    this.points[index] = point;
    this.pointMap[point.name] = point;
    // Fix up the listeners.
    this.events.onFadingIn.add(point.fadingIn, point);
    this.events.onFadedIn.add(point.fadedIn, point);
    this.events.onFadingOut.add(point.fadingOut, point);
    this.events.onFadedOut.add(point.fadedOut, point);
    this.events.onFadingIn.remove(old.fadingIn, old);
    this.events.onFadedIn.remove(old.fadedIn, old);
    this.events.onFadingOut.remove(old.fadingOut, old);
    this.events.onFadedOut.remove(old.fadedOut, old);
    old.delete();
    // If we're connected, let them know.
    if (point.avatar) {
        point.avatar.point = point;
        point.avatar.updateAttachment();
    }
    this.renderNeeded = true;
    return point;
};

// Connect two points.
Tier.prototype.addPath = function(name, point, point2) {
    if (!point.isConnectedTo(point2)) {
        var path = new Path(name, point, point2);
        return this._addPath(path, point, point2);
    }
};

// Internal use only.
// Adds an already-constructed path.
Tier.prototype._addPath = function(path, point, point2) {
    path.tier = this;
    point.paths.push(path);
    point2.paths.push(path);
    this.paths.push(path);
    this.events.onFadingIn.add(path.fadingIn, path);
    this.events.onFadedIn.add(path.fadedIn, path);
    this.events.onFadingOut.add(path.fadingOut, path);
    this.events.onFadedOut.add(path.fadedOut, path);
    this.pathMap[path.name] = path;
    if (this.game.settings.edit) {
        var coords = path.coords();
        for (var i = 0; i < coords.length; i++) {
            this.trackCoords(coords[i]);
        }
    }
    return path;
};

// Add a point to a path at coordinates that *should* lie along its length.
// Return the newly created point.
Tier.prototype.addPointToPathAtCoords = function(path, x, y) {
    var point = this.addPoint(this.getNewPointName(), x, y);
    var point2 = path.p2;
    point.paths.push(path);
    var index = point2.paths.indexOf(path);
    point2.paths.splice(index, 1);
    path.p2 = point;
    this.addPath(this.getNewPathName(), point, point2);
    return point;
};

// Delete an existing point.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePoint = function(point) {
    if (this.points.length == 1) {
        return undefined;
    }
    var index = this.points.indexOf(point);
    if (index >= 0) {
        while (point.paths.length) {
            this.deletePath(point.paths[0]);
        }
        while (point.wires.length) {
            this.deleteWire(point.wires[0]);
        }
        point.delete();
        this.events.onFadingIn.remove(point.fadingIn, point);
        this.events.onFadedIn.remove(point.fadedIn, point);
        this.events.onFadingOut.remove(point.fadingOut, point);
        this.events.onFadedOut.remove(point.fadedOut, point);
        this.points.splice(index, 1);
        delete this.pointMap[point.name];
        this.renderNeeded = true;
        if (this.game.settings.edit) {
            this.forgetCoords(point.coords());
        }
        return point;
    }
    return undefined;
};

// Delete an existing point, merging each of its
// connected points to the others.
// Return the deleted point, or undefined if it wasn't deleted.
Tier.prototype.deletePointAndMerge = function(point) {
    if (this.points.length == 1) {
        return undefined;
    }
    var index = this.points.indexOf(point);
    if (index >= 0) {
        var linked = [];
        for (var i = 0; i < point.paths.length; i++) {
            linked.push(point.paths[i].getCounterpoint(point));
        }
        for (var i = 0; i < linked.length; i++) {
            for (var j = 0; j < linked.length; j++) {
                if (i != j) {
                    var p1 = linked[i];
                    var p2 = linked[j];
                    var xequal = p1.x == p2.x;
                    var yequal = p1.y == p2.y;
                    var diag = Math.abs(p2.x - p1.x) ==
                        Math.abs(p2.y - p1.y);
                    if (xequal || yequal || diag) {
                        this.addPath(this.getNewPathName(),
                            p1, p2);
                    }
                }
            }
        }
        return this.deletePoint(point);
    }
    return undefined;
};

// Delete an existing path between two points.
// Return the deleted path, or undefined if it wasn't deleted.
Tier.prototype.deletePath = function(path) {
    var index = this.paths.indexOf(path);
    if (index >= 0) {
        var points = [path.p1, path.p2];
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var index2 = point.paths.indexOf(path);
            point.paths.splice(index2, 1);
        }
        path.delete();
        this.events.onFadingIn.remove(path.fadingIn, path);
        this.events.onFadedIn.remove(path.fadedIn, path);
        this.events.onFadingOut.remove(path.fadingOut, path);
        this.events.onFadedOut.remove(path.fadedOut, path);
        this.paths.splice(index, 1);
        delete this.pathMap[path.name];
        this.renderNeeded = true;
        if (this.game.settings.edit) {
            var coords = path.coords();
            for (var i = 0; i < coords.length; i++) {
                this.forgetCoords(coords[i]);
            }
        }
        return path;
    }
    return undefined;
};

// Create a new wire and return it.
Tier.prototype.addWire = function(name, sourceName, sinkName) {
    var wire = new Wire(name, sourceName, sinkName);
    this._addWire(wire);
    return wire;
};

// Internal use only.
// Adds an already-constructed wire.
Tier.prototype._addWire = function(wire) {
    this.wires.push(wire);
    wire.tier = this;
    this.wireMap[wire.name] = wire;
    this.events.onFadingIn.add(wire.fadingIn, wire);
    this.events.onFadedIn.add(wire.fadedIn, wire);
    this.events.onFadingOut.add(wire.fadingOut, wire);
    this.events.onFadedOut.add(wire.fadedOut, wire);
    this.renderNeeded = true;
    return wire;
};

// Delete a wire. Returns it too, why not.
Tier.prototype.deleteWire = function(wire) {
    var index = this.wires.indexOf(wire);
    if (index >= 0) {
        wire.delete();
        this.events.onFadingIn.remove(wire.fadingIn, wire);
        this.events.onFadedIn.remove(wire.fadedIn, wire);
        this.events.onFadingOut.remove(wire.fadingOut, wire);
        this.events.onFadedOut.remove(wire.fadedOut, wire);
        this.wires.splice(index, 1);
        delete this.wireMap[wire.name];
        return wire;
    }
    return undefined;
};

// Internal use only.
// Adds an already-constructed obstacle.
Tier.prototype._addObstacle = function(obstacle) {
    obstacle.gx = obstacle.x;
    obstacle.gy = obstacle.y;
    obstacle.tier = this;
    this.obstacles.push(obstacle);
    this.obstacleMap[obstacle.name] = obstacle;
    this.events.onFadingIn.add(obstacle.fadingIn, obstacle);
    this.events.onFadedIn.add(obstacle.fadedIn, obstacle);
    this.events.onFadingOut.add(obstacle.fadingOut, obstacle);
    this.events.onFadedOut.add(obstacle.fadedOut, obstacle);
    this.renderNeeded = true;
    if (this.game.settings.edit) {
        this.trackObstacle(obstacle);
    }
    return obstacle;
};

// Delete an obstacle. Returns it too, why not.
Tier.prototype.deleteObstacle = function(obstacle) {
    var index = this.obstacles.indexOf(obstacle);
    if (index >= 0) {
        obstacle.delete();
        this.events.onFadingIn.remove(obstacle.fadingIn, obstacle);
        this.events.onFadedIn.remove(obstacle.fadedIn, obstacle);
        this.events.onFadingOut.remove(obstacle.fadingOut, obstacle);
        this.events.onFadedOut.remove(obstacle.fadedOut, obstacle);
        this.obstacles.splice(index, 1);
        delete this.obstacleMap[obstacle.name];
        if (this.game.settings.edit) {
            this.forgetObstacle(obstacle);
        }
        return obstacle;
    }
    return undefined;
};

// Get the tier above us.
Tier.prototype.getAbove = function() {
    return this.level.tierMap['t' + (this.index + 1)];
};

// Get the tier below us.
Tier.prototype.getBelow = function() {
    return this.level.tierMap['t' + (this.index - 1)];
};

// Takes x and y values relative to this Tier object's 
// internal points, and returns an {x, y} object whose 
// coordinates have been adjusted to work with the 
// game.
Tier.prototype.translateInternalPointToGamePoint = function(x, y) {
    return {
        x: x + this.x,
        y: y + this.y
    };
};

// Takes x and y values relative to the game, 
// and returns an {x, y} object whose coordinates 
// have been adjusted to work with this Tier 
// object's internal points.
Tier.prototype.translateGamePointToInternalPoint = function(x, y) {
    return {
        x: x - this.x,
        y: y - this.y
    };
};

// Takes x and y values relative to this Tier object's 
// internal points, and returns an {x, y} object whose 
// coordinates have been adjusted to be offset from the 
// tier's anchor point.
Tier.prototype.translateInternalPointToAnchorPoint = function(x, y) {
    return {
        x: x - this.widthOver2,
        y: y - this.heightOver2
    };
};

// Takes x and y values relative to the tier's anchor, 
// and returns an {x, y} object whose coordinates 
// have been adjusted to work with this Tier 
// object's internal points.
Tier.prototype.translateAnchorPointToInternalPoint = function(x, y) {
    return {
        x: x + this.widthOver2,
        y: y + this.heightOver2
    };
};

// Slide point values and children.
Tier.prototype.slideContents = function(minX, minY) {
    // Shift takes a value to add. We want to subtract.
    // So, pass in the negations.
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].shift(this, -minX, -minY);
    }
    for (var i = 0; i < this.paths.length; i++) {
        this.paths[i].shift(this, -minX, -minY);
    }
    if (this._bgimage && this._bgimage.children.length) {
        for (var i = 0; i < this._bgimage.children.length; i++) {
            var child = this._bgimage.children[i];
            if (child === this.image) {
                continue;
            }
            child.x -= minX;
            child.y -= minY;
        }
    }
    if (this.image && this.image.children.length) {
        for (var i = 0; i < this.image.children.length; i++) {
            var child = this.image.children[i];
            child.x -= minX;
            child.y -= minY;
        }
    }
};

// When we stretch, our children's anchors need to shift.
Tier.prototype.stretchContents = function(dw, dh) {
    if (this._bgimage && this._bgimage.children.length) {
        for (var i = 0; i < this._bgimage.children.length; i++) {
            var child = this._bgimage.children[i];
            if (child === this.image) {
                continue;
            }
            child.x -= dw * 0.5;
            child.y -= dh * 0.5;
        }
    }
    if (this.image && this.image.children.length) {
        for (var i = 0; i < this.image.children.length; i++) {
            var child = this.image.children[i];
            child.x -= dw * 0.5;
            child.y -= dh * 0.5;
        }
    }
};

// Update our dimensions.
Tier.prototype.recalculateDimensions = function() {
    // All our old measurements, stripped of things like 
    // padding and shift.
    var oldX = this.x + this.shiftX;
    var oldY = this.y + this.shiftY;
    var oldW = this.width ? this.width - 2 * Tier.PADDING : 0;
    var oldH = this.height ? this.height - 2 * Tier.PADDING : 0;

    var minX = Number.POSITIVE_INFINITY;
    var minY = Number.POSITIVE_INFINITY;
    var maxX = Number.NEGATIVE_INFINITY;
    var maxY = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        minX = (point.x < minX) ? point.x : minX;
        minY = (point.y < minY) ? point.y : minY;
        maxX = (point.x > maxX) ? point.x : maxX;
        maxY = (point.y > maxY) ? point.y : maxY;
    }
    // All points have the 5,5 padding in their coords.
    // Strip it off.
    minX -= Tier.PADDING;
    minY -= Tier.PADDING;
    maxX -= Tier.PADDING;
    maxY -= Tier.PADDING;
    var width = maxX - minX;
    var height = maxY - minY;
    if (minX == oldX &&
        minY == oldY &&
        width == oldW &&
        height == oldH) {
        // THANK FREAKING GOODNESS.
        return;
    }

    // We always want the points with the lowest X/Y
    // to have 0 for those values.
    // So subtract minX and minY from all points' 
    // internal values.
    // When we do this, we also need to shift children 
    // by half the same amount.    
    if (minX != 0 || minY != 0) {
        this.slideContents(minX, minY);
    }

    // If we've stretched, it moves our anchor by half that amount.
    // Points don't care, but children need to 
    if (width != oldW || height != oldH) {
        this.stretchContents(width - oldW, height - oldH);
    }

    // Recompute the new shift, using any point for reference.
    var point = this.points[0];
    this.shiftX = point.x - point.gx;
    this.shiftY = point.y - point.gy;
    // If the point is where it wants to be, we can still anchor 
    // at 0,0. If the point is greater than its goal, we must 
    // shift negative to compensate. Likewise, if the point is 
    // negative of its goal, we'll shift positive.

    // Also, don't forget that our anchor is at w/2,h/2.
    // So we want to reset our x,y to be at those points minus 
    // the appropriate shifts.
    this.width = width + 2 * Tier.PADDING;
    this.height = height + 2 * Tier.PADDING;
    this.widthOver2 = this.width / 2;
    this.heightOver2 = this.height / 2;
    this.x = -this.shiftX;
    this.y = -this.shiftY;
};

// Make sure our current image is big enough 
// to render our full size.
Tier.prototype.recreateImageAsNeeded = function() {
    var w = (this.bitmap) ? this.bitmap.width : 0;
    var h = (this.bitmap) ? this.bitmap.height : 0;
    resize = false;
    if (this.width != w || this.height != h) {
        if (this.bitmap) {
            resize = true;
        }
    }
    if (this.bitmap) {
        this.bitmap.context.clearRect(0, 0, w, h);
    } else {
        var bitmap = this.game.add.bitmapData(
            this.width, this.height);
        this._bgimage = this.game.add.sprite(
            this.x + this.widthOver2, this.y + this.heightOver2, bitmap);
        this._bgimage.anchor.setTo(0.5, 0.5);
        this.game.state.getCurrentState().z.level.tier().addAt(
            this._bgimage, 0);

        this.bitmap = this.game.add.bitmapData(
            this.width, this.height);
        this.image = this.game.add.sprite(0, 0, this.bitmap);
        this.image.anchor.setTo(0.5, 0.5);
        this.image.addBackgroundChild = function(child) {
            var idx = this.parent.children.length - 1;
            this.parent.addChildAt(child, idx);
        };
        this._bgimage.addChild(this.image);

        if (!this.spacer) {
            this.spacer = this.game.add.sprite(
                this.x, this.y);
            this.game.state.getCurrentState().z.level.tier().add(this.spacer);
            this.updateSpacer();
        }
    }
    if (resize) {
        this._bgimage.x = this.x + this.widthOver2;
        this._bgimage.y = this.y + this.heightOver2;
        var bitmap = this._bgimage.key;
        Utils.resizeBitmap(bitmap, this.width, this.height);
        Utils.resizeBitmap(this.bitmap, this.width, this.height);
        this.updateSpacer();

        this.updateWorldBounds();
    }
};

// Resize the spacer.
Tier.prototype.updateSpacer = function() {
    var sw = this.spacer.width;
    var sh = this.spacer.height;
    var sw2 = this.game.width + this.width * Tier.HIDE_SCALE_UP * 4;
    var sh2 = this.game.height + this.height * Tier.HIDE_SCALE_UP * 4;
    this.spacer.x = this.x - (sw2 - this.width) / 2;
    this.spacer.y = this.y - (sh2 - this.height) / 2;
    this.spacer.scale.setTo(sw2 / sw, sh2 / sh);
};

// Draw all paths onto the bitmap.
Tier.prototype.updateWorldBounds = function() {
    if (this.renderNeeded) {
        return; // We'll update during our next render.
    }
    var p = Tier.CAMERA_PADDING;
    var w = this.width;
    var h = this.height;
    var x = this.x - this.widthOver2;
    var y = this.y - this.heightOver2;
    this.game.world.setBounds(
        this.x - p,
        this.y - p,
        this.width + (2 * p),
        this.height + (2 * p)
    );
};

// Draw all paths onto the bitmap.
Tier.prototype.draw = function() {
    this.renderNeeded = false;
    this.recalculateDimensions();
    this.recreateImageAsNeeded();
    this.bitmap.context.strokeStyle = this.palette.c1.s;
    this.bitmap.context.fillStyle = this.palette.c1.s;
    this.bitmap.context.lineWidth = Tier.PATH_WIDTH;
    this.bitmap.context.lineCap = Tier.LINE_CAP_STYLE;
    this.bitmap.context.lineJoin = Tier.LINE_JOIN_STYLE;
    this.bitmap.context.lineDashOffset = Tier.LINE_DASH_OFFSET;
    // this.bitmap.context.strokeRect(0, 0, this.width, this.height);

    this.objects = this.paths.concat(this.points)
        .concat(this.wires).concat(this.obstacles);
    this.objects.sort(function(a, b) {
        var z1 = a.z ? a.z : 10;
        var z2 = b.z ? b.z : 10;
        return z1 - z2;
    });
    for (var i = 0; i < this.objects.length; i++) {
        this.objects[i].draw(this);
    }
    this.bitmap.dirty = true;
};

// Update loop processing.
Tier.prototype.update = function() {
    // We don't actually do anything at the moment.
    // Input's all handled by the IHandler states.
    // However, we'll go ahead and let our paths/points know.
    for (var i = 0; i < this.objects.length; i++) {
        this.objects[i].update();
    }
};

// Return true if we, or any of our points/paths, 
// need a new render.
Tier.prototype.isRenderNeeded = function() {
    if (this.renderNeeded) {
        return true;
    }
    for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].renderNeeded) {
            return true;
        }
    }
    for (var i = 0; i < this.paths.length; i++) {
        if (this.paths[i].renderNeeded) {
            return true;
        }
    }
    return false;
};

// The rendering loop.
Tier.prototype.render = function() {
    // Figure it if we need to render (again).
    if (this.isRenderNeeded()) {
        this.draw();
    }
};

// Adjust our starting graphical configuration.
Tier.prototype.initializeBasedOnStartingTier = function(tier) {
    this.draw();
    var increasing = false;
    var increment = increasing ? 1 : -1;
    if (this.index == tier.index - 2 * increment) {
        this.setFaded();
    } else if (this.index == tier.index - 1 * increment) {
        // Do nothing.
    } else if (this === tier) {
        this.setFaded();
    } else if (this.index == tier.index - -1 * increment) {
        this.setHidden();
    } else {
        this.setHidden();
    }
};

// Figure out how we need to transition.
Tier.prototype.updateBasedOnChangingTiers = function(tier, old) {
    var increasing = (old && tier) ? old.index < tier.index : false;
    var increment = increasing ? 1 : -1;
    if (this.index == tier.index - 2 * increment) {
        this.hide(!increasing);
    } else if (this.index == tier.index - 1 * increment) {
        this.fadeOut(!increasing);
    } else if (this === tier) {
        this.fadeIn(increasing);
    } else if (this.index == tier.index - -1 * increment) {
        this.unhide(increasing);
    } else {
        this.setHidden();
    }
};

// Faded tiers are "current adjacent".
Tier.prototype.setFaded = function() {
    this.clearFades();
    if (!this.faded) {
        this.events.onFadingOut.dispatch(this);
        this.events.onFadedOut.dispatch(this);
    } else if (this.hidden) {
        this.events.onUnhiding.dispatch(this);
        this.events.onHidden.dispatch(this);
    }
    this._bgimage.alpha = Tier.FADE_ALPHA;
    this.faded = true;
    this.hidden = false;
};

// Set ourselves to completely hidden.
Tier.prototype.setHidden = function() {
    this.clearFades();
    if (!this.hidden) {
        if (!this.faded) {
            this.events.onFadingOut.dispatch(this);
            this.events.onFadedOut.dispatch(this);
        }
        this.events.onHiding.dispatch(this);
        this.events.onHidden.dispatch(this);
    }
    this._bgimage.alpha = Tier.HIDE_ALPHA;
    this.faded = true;
    this.hidden = true;
};

// Stop any fades in progress.
Tier.prototype.clearFades = function() {
    for (var i = 0; i < this.fades.length; i++) {
        var fade = this.fades[i];
        if (fade.isRunning) {
            fade.onComplete.dispatch();
            fade.stop();
        }
    }
    this.fades = [];
};

// Transition a tier via fade + scaling.
Tier.prototype.fadeIn = function(increasing) {
    if (!this.faded) {
        return;
    }
    this.faded = false;
    this.hidden = false;
    this.render();
    this.clearFades();
    this.events.onFadingIn.dispatch(this);

    var time = Tier.FADE_TIME;
    var s = increasing ?
        Tier.FADE_SCALE_UP : Tier.FADE_SCALE_DOWN;
    this._bgimage.alpha = increasing ?
        Tier.FADE_ALPHA_UP : Tier.FADE_ALPHA_DOWN;
    var t = this.game.add.tween(this._bgimage);
    t.to({ alpha: 1 }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.events.onFadedIn.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var scale = increasing ? s : 1 / s;
    this._bgimage.scale.setTo(scale);
    var t2 = this.game.add.tween(this._bgimage.scale);
    t2.to({ x: 1, y: 1 }, time, Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
};

// Transition a tier via fade + scaling.
Tier.prototype.fadeOut = function(increasing) {
    if (this.faded && !this.hidden) {
        return;
    }
    this.faded = true;
    this.hidden = false;
    if (!this._bgimage) {
        return;
    }
    this.clearFades();
    this.events.onFadingOut.dispatch(this);

    var time = Tier.FADE_TIME;
    var s = increasing ?
        Tier.FADE_SCALE_UP : Tier.FADE_SCALE_DOWN;
    var alpha = increasing ?
        Tier.FADE_ALPHA_UP : Tier.FADE_ALPHA_DOWN;
    this._bgimage.alpha = 1;
    var t = this.game.add.tween(this._bgimage);
    t.to({ alpha: alpha }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.events.onFadedOut.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var scale = increasing ? s : 1 / s;
    this._bgimage.scale.setTo(1);
    var t2 = this.game.add.tween(this._bgimage.scale);
    t2.to({ x: scale, y: scale }, time,
        Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
};

// Transition a tier via fade + scaling.
Tier.prototype.unhide = function(increasing) {
    if (!this.hidden) {
        return;
    }
    this.hidden = false;
    this.render();
    this.clearFades();
    this.events.onUnhiding.dispatch(this);

    var time = Tier.FADE_TIME;
    this._bgimage.alpha = increasing ?
        Tier.HIDE_ALPHA_UP : Tier.HIDE_ALPHA_DOWN;
    var alpha = increasing ?
        Tier.FADE_ALPHA_UP : Tier.FADE_ALPHA_DOWN;
    var t = this.game.add.tween(this._bgimage);
    t.to({ alpha: alpha }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.events.onUnhidden.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var s = increasing ?
        Tier.HIDE_SCALE_UP : Tier.HIDE_SCALE_DOWN;
    var scale = increasing ? s : 1 / s;
    this._bgimage.scale.setTo(scale);
    var s = increasing ?
        Tier.FADE_SCALE_UP : Tier.FADE_SCALE_DOWN;
    var scale = increasing ? s : 1 / s;
    var t2 = this.game.add.tween(this._bgimage.scale);
    t2.to({ x: scale, y: scale }, time, Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
};

// Transition a tier via fade + scaling.
Tier.prototype.hide = function(increasing) {
    if (this.hidden) {
        return;
    }
    this.hidden = true;
    if (!this._bgimage) {
        return;
    }
    this.clearFades();
    this.events.onHiding.dispatch(this);

    var time = Tier.FADE_TIME;
    this._bgimage.alpha = increasing ?
        Tier.FADE_ALPHA_UP : Tier.FADE_ALPHA_DOWN;
    var alpha = increasing ?
        Tier.HIDE_ALPHA_UP : Tier.HIDE_ALPHA_DOWN;
    var t = this.game.add.tween(this._bgimage);
    t.to({ alpha: alpha }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.events.onHidden.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var s = increasing ?
        Tier.FADE_SCALE_UP : Tier.FADE_SCALE_DOWN;
    var scale = increasing ? s : 1 / s;
    this._bgimage.scale.setTo(scale);
    var s = increasing ?
        Tier.HIDE_SCALE_UP : Tier.HIDE_SCALE_DOWN;
    var scale = increasing ? s : 1 / s;
    var t2 = this.game.add.tween(this._bgimage.scale);
    t2.to({ x: scale, y: scale }, time,
        Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
};

// Save progress.
Tier.prototype.saveProgress = function(p) {
    var p2 = {};
    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if (obj.saveProgress) {
            obj.saveProgress(p2);
        }
    }
    p[this.name] = p2;
};

// Restore progress.
Tier.prototype.restoreProgress = function(p) {
    var p2 = p[this.name];
    if (!p2) {
        return;
    }
    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if (obj.restoreProgress) {
            obj.restoreProgress(p2);
        }
    }
};

// Delete ourself and our stuff.
Tier.prototype.delete = function() {
    for (var i = 0; i < this.paths.length; i++) {
        this.paths[i].delete();
    }
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].delete();
    }
    this.events.onFadingIn.removeAll();
    this.events.onFadedIn.removeAll();
    this.events.onFadingOut.removeAll();
    this.events.onFadedOut.removeAll();
    Utils.destroy(this.image);
    Utils.destroy(this._bgimage);
    Utils.destroy(this.spacer);
};

// JSON conversion of our points and paths.
Tier.prototype.toJSON = function() {
    return {
        points: this.pointMap,
        paths: this.pathMap,
        wires: this.wireMap,
        obstacles: this.obstacleMap
    };
};

// Load a JSON representation of points and paths.
Tier.load = function(game, name, json) {
    var tier = new Tier(game, name);
    var keys = Object.keys(json.points);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var pointObj = json.points[key];
        var point = Point.load(game, key, pointObj);
        tier._addPoint(point);
    }
    if (json.paths) {
        keys = Object.keys(json.paths);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var pathObj = json.paths[key];
            var p1 = tier.pointMap[pathObj.p1];
            var p2 = tier.pointMap[pathObj.p2];
            var path = Path.load(game, key, pathObj, p1, p2);
            tier._addPath(path, p1, p2);
        }
    }
    if (json.wires) {
        keys = Object.keys(json.wires);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var wireObj = json.wires[key];
            var wire = Wire.load(game, key, wireObj);
            tier._addWire(wire);
        }
    }
    if (json.obstacles) {
        keys = Object.keys(json.obstacles);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var obstacleObj = json.obstacles[key];
            var obstacle = Obstacle.load(game, key, obstacleObj);
            tier._addObstacle(obstacle);
        }
    }
    return tier;
};
