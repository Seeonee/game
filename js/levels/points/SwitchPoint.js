// A point that sends an enabled signal through wires 
// when stepped upon or toggled.
// It's like a circuit; closed means we send a signal, 
// open means we don't (unless you wire stuff to open).
var SwitchPoint = function(name, x, y, enabled, /* wires, */
    once, contact) {
    Point.call(this, name, x, y, enabled);
    this.once = once;
    this.contact = contact;
    this.done = false;

    this.istateName = SwitchIState.NAME;
    this.events = this.events ? this.events : {};
    this.events.onEnabled = new Phaser.Signal();
    this.events.onDisabled = new Phaser.Signal();
};

SwitchPoint.TYPE = 'switch';
SwitchPoint.prototype = Object.create(Point.prototype);
SwitchPoint.prototype.constructor = SwitchPoint;

// Set up our factory.
Point.load.factory[SwitchPoint.TYPE] = SwitchPoint;

// During our first draw, we create the actual key.
SwitchPoint.prototype.draw = function(tier) {
    Point.prototype.draw.call(this, tier);
    if (!this.drawn) {
        this.drawn = true;
        var game = tier.game;
        var ap = tier.translateInternalPointToGamePoint(
            this.x, this.y);
        this.switch = new WSwitch(game, ap.x, ap.y,
            tier.palette, this.enabled, this.contact);
        game.state.getCurrentState().z.bg.tier().add(this.switch);
    } else {
        this.switch.updatePalette(tier.palette);
    }
};

// Called on tier fade.
SwitchPoint.prototype.fadingIn = function(tier) {
    this.switch.fadingIn();
};

// Called on tier fade.
SwitchPoint.prototype.fadingOut = function(tier) {
    this.switch.fadingOut();
};

// Set whether or not we're pressed.
SwitchPoint.prototype.setPressed = function(pressed) {
    this.switch.setPressed(pressed);
};

// Toggle the plate.
SwitchPoint.prototype.flip = function() {
    if (this.done) {
        return;
    }
    this.setEnabled(!this.enabled);
};

// Toggle enabledness, aka flip the switch.
// Do *NOT* call our super.setEnabled().
SwitchPoint.prototype.setEnabled = function(enabled) {
    if (this.once) {
        this.done = true;
        this.switch.lock();
    }
    this.enabled = enabled;
    this.switch.flip();
    if (this.enabled) {
        // Close the circuit. Typically powers most wires.
        this.events.onEnabled.dispatch();
        // TODO: Power our closed-only wires.
    } else {
        // Open up. Typically cuts power to most wires.
        this.events.onDisabled.dispatch();
        // TODO: Power our open-only wires.
    }
};

// Should the avatar "stick" briefly when passing this point?
SwitchPoint.prototype.shouldHold = function() {
    if (this.done) {
        return false;
    }
    return Point.prototype.shouldHold.call(this);
};

// Delete our gfx.
SwitchPoint.prototype.delete = function() {
    Utils.destroy(this.switch);
};

// Editor details.
SwitchPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'switch (' + (this.enabled ? 'on' : 'off') + ')';
};

// JSON conversion of a switch.
SwitchPoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    result.type = SwitchPoint.TYPE;
    if (this.once) {
        result.once = true;
    }
    if (this.contact) {
        result.contact = true;
    }
    return result;
};

// Load a JSON representation of a portal.
SwitchPoint.load = function(game, name, json) {
    return new SwitchPoint(name, json.x, json.y,
        json.enabled, json.once, json.contact);
};
