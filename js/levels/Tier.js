// Set up one tier of a wider level.
var Tier = function(game, name) {
    this.name = name;
    this.index = parseInt(this.name.substring(1));
    this.game = game;
    this.level = undefined; // Set during load.
    this.x = 0;
    this.y = 0;
    this.renderNeeded = false;

    this.points = [];
    this.paths = [];
    this.objects = [];
    this.pointMap = {};
    this.pathMap = {};

    // Bitmap gets set up later.
    this.bitmap = undefined;
    this.image = undefined;

    this.palette = this.game.settings.colors[name];

    this.visible = false;
    this.fading = false;
    this.fades = [];
    this.events = {
        onFadingIn: new Phaser.Signal(),
        onFadedIn: new Phaser.Signal(),
        onFadingOut: new Phaser.Signal(),
        onFadedOut: new Phaser.Signal()
    };
};

// Constants.
Tier.PADDING = 5;
Tier.CAMERA_PADDING = 1500;
Tier.PATH_WIDTH = 7;
Tier.LINE_CAP_STYLE = 'butt';
Tier.LINE_JOIN_STYLE = 'round';
Tier.LINE_DASH = [18, 7];
Tier.LINE_DASH_OFFSET = 11;
Tier.FADE_TIME = 300; // ms
Tier.FADE_SCALE = 3; // ms


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
    this.points.push(point);
    this.pointMap[point.name] = point;
    this.events.onFadingIn.add(point.fadingIn, point);
    this.events.onFadedIn.add(point.fadedIn, point);
    this.events.onFadingOut.add(point.fadingOut, point);
    this.events.onFadedOut.add(point.fadedOut, point);
    return point;
};

// Tear an existing point wholly out of existence, 
// and replace it in all ways with a new point.
// This will update *every* reference to the old point.
Tier.prototype.replacePoint = function(old, point) {
    // Copy over a bunch of values.
    point.name = old.name;
    point.x = old.x;
    point.y = old.y;
    point.avatar = old.avatar;
    point.attached = old.attached;
    // Change all paths to link with us instead.
    for (var i = 0; i < old.paths.length; i++) {
        var path = old.paths[i];
        point.paths.push(path);
        path.p1 === old ? path.p1 = point : path.p2 = point;
    }
    old.paths = [];
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
    point.paths.push(path);
    point2.paths.push(path);
    this.paths.push(path);
    this.events.onFadingIn.add(path.fadingIn, path);
    this.events.onFadedIn.add(path.fadedIn, path);
    this.events.onFadingOut.add(path.fadingOut, path);
    this.events.onFadedOut.add(path.fadedOut, path);
    this.pathMap[path.name] = path;
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
        point.delete();
        this.events.onFadingIn.remove(point.fadingIn, point);
        this.events.onFadedIn.remove(point.fadedIn, point);
        this.events.onFadingOut.remove(point.fadingOut, point);
        this.events.onFadedOut.remove(point.fadedOut, point);
        this.points.splice(index, 1);
        delete this.pointMap[point.name];
        this.renderNeeded = true;
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
        return path;
    }
    return undefined;
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
    // We can now ask any child point to calculate how far 
    // it's moved from its desired game point. It doesn't matter 
    // who we ask; all points have shifted the same amount.
    var point = this.points[0];
    var oldShiftX = point.x - point.gx;
    var oldShiftY = point.y - point.gy;
    // All our old measurements, stripped of things like 
    // padding and shift.
    var oldX = this.x + oldShiftX;
    var oldY = this.y + oldShiftY;
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

    // Recompute the new shift.
    var shiftX = point.x - point.gx;
    var shiftY = point.y - point.gy;
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
    this.x -= shiftX;
    this.y -= shiftY;
};

// Make sure our current image is big enough 
// to render our full size.
Tier.prototype.recreateImageAsNeeded = function() {
    var w = (this.bitmap) ? this.bitmap.width : 0;
    var h = (this.bitmap) ? this.bitmap.height : 0;
    var children = undefined;
    if (this.width != w || this.height != h) {
        if (this.bitmap) {
            children = this.image.children.slice();
            this.image.kill();
            this.bitmap.destroy();
            this.image = undefined;
            this.bitmap = undefined;
        }
    }
    if (this.bitmap) {
        this.bitmap.context.clearRect(0, 0, w, h);
    } else {
        this.bitmap = this.game.add.bitmapData(
            this.width, this.height);
        this.image = this.game.add.sprite(
            this.x + this.widthOver2, this.y + this.heightOver2,
            this.bitmap);
        this.image.anchor.setTo(0.5, 0.5);
        this.game.state.getCurrentState().z.level.tier().addAt(
            this.image, 0);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.image.addChild(child);
                child.revive();
            }
        }
        this.updateWorldBounds();
    }
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

    this.objects = this.paths.concat(this.points);
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

// Set ourselves to inactive, with no fade.
Tier.prototype.setInactive = function() {
    if (!this.visible) {
        if (this.fading) {
            // We're fading out; stop the fade and 
            // snap to fully invisible.
            // We don't need to signal start-of-fade.
            this.clearFades();
            this.fading = false;
        } else {
            // Snap straight to invisible, 
            // but also signal start-of-fade.
            this.events.onFadingOut.dispatch(this);
        }
        this.events.onFadedOut.dispatch(this);
    }
    this.visible = false;
};

// Stop any fades in progress.
Tier.prototype.clearFades = function() {
    for (var i = 0; i < this.fades; i++) {
        this.fades[i].stop();
    }
    this.fades = [];
};

// Transition a tier via fade + scaling.
Tier.prototype.fadeIn = function(increasing) {
    if (this.visible) {
        return;
    }
    this.visible = true;
    this.render();
    this.clearFades();
    this.fading = true;
    this.events.onFadingIn.dispatch(this);

    var time = Tier.FADE_TIME;
    var s = Tier.FADE_SCALE;
    this.image.alpha = 0;
    var t = this.game.add.tween(this.image);
    t.to({ alpha: 1 }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.fading = false;
        this.events.onFadedIn.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var scale = increasing ? s : 1 / s;
    this.image.scale.setTo(scale);
    var t2 = this.game.add.tween(this.image.scale);
    t2.to({ x: 1, y: 1 }, time, Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
};

// Transition a tier via fade + scaling.
Tier.prototype.fadeOut = function(increasing) {
    if (!this.visible) {
        return;
    }
    this.visible = false;
    if (!this.image) {
        return;
    }
    this.clearFades();
    this.fading = true;
    this.events.onFadingOut.dispatch(this);

    var time = Tier.FADE_TIME;
    var s = Tier.FADE_SCALE;
    this.image.alpha = 1;
    var t = this.game.add.tween(this.image);
    t.to({ alpha: 0 }, time, Phaser.Easing.Cubic.Out, true);
    t.onComplete.add(function() {
        this.fading = false;
        this.events.onFadedOut.dispatch(this);
    }, this);
    this.fades.push(t);
    // If we're going up, the old tier's going to shrink,
    // so the new tier needs to start huge and shrink down 
    // to normal as well.
    var scale = increasing ? s : 1 / s;
    this.image.scale.setTo(1);
    var t2 = this.game.add.tween(this.image.scale);
    t2.to({ x: scale, y: scale }, time,
        Phaser.Easing.Quartic.Out, true);
    this.fades.push(t2);
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
};

// JSON conversion of our points and paths.
Tier.prototype.toJSON = function() {
    return {
        points: this.pointMap,
        paths: this.pathMap
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
    return tier;
};
