// A point that allows transitioning to other tiers.
var WarpPoint = function(name, x, y, to, enabled, textKeys) {
    Point.call(this, name, x, y, enabled, textKeys);
    this.emitters = [];
    this.z = Point.Z + 1;
    this.to = to;
    this.istateName = WarpIState.NAME;

    this.attachmentRadius = WSocket.RING_RADIUS / 2;
};

WarpPoint.TYPE = 'warp';
WarpPoint.prototype = Object.create(Point.prototype);
WarpPoint.prototype.constructor = WarpPoint;

// Set up our factory.
Point.load.factory[WarpPoint.TYPE] = WarpPoint;

// Some more constants.
WarpPoint.RADIUS = 20;
WarpPoint.PATH_RATIO = 0.6;


// During our first draw, we create the emitters.
WarpPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
    this.tier = tier;
    this.game = tier.game;
    var c = tier.bitmap.context;
    var r = WarpPoint.RADIUS;
    var x = this.x - r / 2;
    var y = this.y - r / 2;
    Utils.clearArc(c, this.x, this.y, r / 2);
    if (!this.drawn) {
        this.drawn = true;
        var toPoint = tier.pointMap[this.to];
        // Graphical elements.
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.socket = new WSocket(this.game, ap.x, ap.y, this.tier.palette);
        this.tier.image.addChild(this.socket);
        this.ember = new WEmber(this.game);
        this.ember.setEnabled(this.enabled);
        this.socket.addChild(this.ember);
        var angle = Utils.angleBetweenPoints(this.x, this.y,
            toPoint.x, toPoint.y);
        this.contrail = new WContrail(this.game, angle);
        this.socket.addChild(this.contrail);
    } else {
        this.socket.updatePalette(tier.palette);
    }
};

// Set our enabled state.
WarpPoint.prototype.setEnabled = function(enabled) {
    if (enabled == this.enabled) {
        return;
    }
    Point.prototype.setEnabled.call(this, enabled);
    this.ember.setEnabled(enabled);
    if (!this.enabled) {
        this.contrail.setShining(false);
    } else if (this.attached) {
        this.contrail.setShining(true);
    }
};

// Light up the warp point.
WarpPoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (this.enabled) {
        this.ember.setFlaring(true);
        this.contrail.setShining(true);
    }
};

// Lights out for the warp point.
WarpPoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    if (this.enabled) {
        this.ember.setFlaring(false);
        this.contrail.setShining(false);
    }
};

// Delete our children.
WarpPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    Utils.destroy(this.socket);
    Utils.destroy(this.ember);
    Utils.destroy(this.contrail);
};

// Editor details.
WarpPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'warp to ' + this.to;
};

// JSON conversion of a warp point.
WarpPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.to = this.to;
    return result;
};

// Load a JSON representation of a warp point.
WarpPoint.load = function(game, name, json) {
    return new WarpPoint(name, json.x, json.y,
        json.to, json.enabled, json.textKeys);
};
