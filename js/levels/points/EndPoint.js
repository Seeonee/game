// "End of the level" point.
var EndPoint = function(name, x, y, enabled) {
    Point.call(this, name, x, y, enabled);
    this.z = Point.Z + 1;
    this.rings = { inner: [], outer: [] };
    // this.istateName = EndIState.NAME;
};

EndPoint.TYPE = 'end';
EndPoint.prototype = Object.create(Point.prototype);
EndPoint.prototype.constructor = EndPoint;

// Set up our factory.
Point.load.factory[EndPoint.TYPE] = EndPoint;

// Constants.
EndPoint.INNER_RINGS = 9;
EndPoint.OUTER_RINGS = 10;
EndPoint.RING_RADIUS = Tier.PATH_WIDTH;


// During our first draw, we create the rings.
EndPoint.prototype.draw = function(tier) {
    // Point.prototype.draw.call(this, tier);
    this.tier = tier;
    this.game = tier.game;
    if (!this.drawn) {
        this.renderNeeded = false;
        var r = EndPoint.RING_RADIUS;
        var bitmap = this.game.add.bitmapData(2 * r, 2 * r);
        var c = bitmap.context;
        c.fillStyle = tier.palette.c1.s;
        c.beginPath();
        c.arc(r, r, r, 0, 2 * Math.PI, false);
        c.fill();
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.image = this.game.make.sprite(ap.x, ap.y, bitmap);
        this.tier.image.addChild(this.image);
        this.image.anchor.setTo(0.5, 0.5);

        // TODO: Two options here:
        // * Translate to game point and add to bg, but 
        //   then we don't scale/hide with the tier.
        // * Translate to anchor point and add as tier image child, 
        //   but then we lose control of our z ordering.
        // var ap = tier.translateInternalPointToAnchorPoint(
        //     this.x, this.y);
        var ap = tier.translateInternalPointToGamePoint(
            this.x, this.y);
        for (var i = 0; i < EndPoint.INNER_RINGS; i++) {
            this.rings.inner.push(new ERing(this.game,
                ap.x, ap.y, 'ring_inner', tier.palette,
                i, EndPoint.INNER_RINGS));
        }
        for (var i = 0; i < EndPoint.OUTER_RINGS; i++) {
            this.rings.outer.push(new ERing(this.game,
                ap.x, ap.y, 'ring_outer', tier.palette,
                i, EndPoint.OUTER_RINGS));
        }
        this.rings.all = this.rings.inner.concat(this.rings.outer);
        for (var i = 0; i < this.rings.all.length; i++) {
            // this.tier.image.addChild(this.rings.all[i]);
            this.game.state.getCurrentState().z.bg.add(
                this.rings.all[i]);
        }
    }
};

// Fade the rings back in.
EndPoint.prototype.fadingIn = function() {
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].fade(true);
    }
};

// Fade the rings out.
EndPoint.prototype.fadingOut = function() {
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].fade(false);
    }
};

// Set our enabled state.
EndPoint.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    Point.prototype.setEnabled.call(this, enabled);
    for (var i = 0; i < this.rings.all.length; i++) {
        var ring = this.rings.all[i]
        ring.setEnabled(this.enabled);
        ring.setStable(this.attached);
    }
};

// Pause rings (e.g. when tier is hidden).
EndPoint.prototype.setPaused = function(paused) {
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].setPaused(paused);
    }
};

// Sping the rings into place.
EndPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.enabled) {
        for (var i = 0; i < this.rings.all.length; i++) {
            this.rings.all[i].setStable(true);
        }
    }
};

// Let the rings orbit again.
EndPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].setStable(false);
    }
};


// Delete our tweens.
EndPoint.prototype.delete = function() {
    for (var i = 0; i < this.rings.all.length; i++) {
        this.rings.all[i].kill();
    }
};

// JSON conversion of an end point.
EndPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = EndPoint.TYPE;
    if (!this.enabled) {
        result.enabled = this.enabled;
    }
    return result;
};

// Load a JSON representation of an end point.
EndPoint.load = function(game, name, json) {
    return new EndPoint(name, json.x, json.y,
        json.enabled);
};
