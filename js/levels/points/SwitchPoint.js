// A point that sends an enabled signal through wires 
// when stepped upon.
// It's like a circuit; closed means we send a signal, 
// open means we don't (unless you wire stuff to open).
var SwitchPlatePoint = function(name, x, y, /* wires, */
    startClosed, once) {
    Point.call(this, name, x, y);
    this.closed = startClosed;
    this.once = once;
    this.done = false;
    this.events = this.events ? this.events : {};
    this.events.onClose = new Phaser.Signal();
    this.events.onOpen = new Phaser.Signal();
};

SwitchPlatePoint.TYPE = 'switch plate';
SwitchPlatePoint.prototype = Object.create(Point.prototype);
SwitchPlatePoint.prototype.constructor = SwitchPlatePoint;

// Set up our factory.
Point.load.factory[SwitchPlatePoint.TYPE] = SwitchPlatePoint;

// During our first draw, we create the actual key.
SwitchPlatePoint.prototype.draw = function(tier) {
    Point.prototype.draw.call(this, tier);
    if (!this.drawn) {
        this.drawn = true;
        var game = tier.game;
        var ap = tier.translateInternalPointToGamePoint(
            this.x, this.y);
        this.switch = new WSwitch(game, ap.x, ap.y,
            tier.palette, this.closed);
        game.state.getCurrentState().z.bg.tier().add(this.switch);
    }
}; // Called on tier fade.
SwitchPlatePoint.prototype.fadingIn = function(tier) {
    tier.game.add.tween(this.switch).to({ alpha: 1 },
        Tier.FADE_TIME / 2, Phaser.Easing.Linear.InOut, true,
        Tier.FADE_TIME / 2);
};

// Called on tier fade.
SwitchPlatePoint.prototype.fadingOut = function(tier) {
    this.switch.alpha = 0;
};


// Toggle the plate.
SwitchPlatePoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    this.flip();
};

// Toggle the plate.
SwitchPlatePoint.prototype.notifyDetached = function(avatar, next) {
    Point.prototype.notifyDetached.call(this, avatar, next);
    this.flip();
};

// Toggle the plate.
SwitchPlatePoint.prototype.flip = function() {
    if (this.done || !this.enabled) {
        return;
    }
    this.done = this.once;
    if (this.closed) {
        // Open up. Typically cuts power to most wires.
        this.switch.open();
        this.events.onOpen.dispatch();
        // TODO: Power our open-only wires.
    } else {
        // Close the circuit. Typically powers most wires.
        this.switch.close();
        this.events.onClose.dispatch();
        // TODO: Power our closed-only wires.
    }
    this.closed = !this.closed;
};

// Delete our gfx.
SwitchPlatePoint.prototype.delete = function() {
    this.switch.kill();
};

// Editor details.
SwitchPlatePoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'switch plate';
};

// JSON conversion of a key.
SwitchPlatePoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = SwitchPlatePoint.TYPE;
    return result;
};

// Load a JSON representation of a portal.
SwitchPlatePoint.load = function(game, name, json) {
    return new SwitchPlatePoint(name, json.x, json.y,
        json.startClosed, json.once);
};
