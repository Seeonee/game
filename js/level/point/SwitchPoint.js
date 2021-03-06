// A point that sends an enabled signal through wires 
// when stepped upon or toggled.
// It's like a circuit; closed means we send a signal, 
// open means we don't (unless you wire stuff to open).
var SwitchPoint = function(name, x, y, enabled, textKeys,
    once, contact) {
    Point.call(this, name, x, y, enabled, textKeys);
    this.once = once == undefined ? false : once;
    this._once = this.once;
    this.contact = contact;
    this.done = false;
    this.disableIStateWhileDisabled = false;

    this.istateName = SwitchIState.NAME;
    this.attachmentOffsetY = SwitchPoint.Y;
    // this.useOffsets = false;
};

SwitchPoint.TYPE = 'switch';
SwitchPoint.prototype = Object.create(Point.prototype);
SwitchPoint.prototype.constructor = SwitchPoint;

// Set up our factory.
Point.load.factory[SwitchPoint.TYPE] = SwitchPoint;

// Constants.
SwitchPoint.Y = 15;


// During our first draw, we create the actual key.
SwitchPoint.prototype.draw = function(tier) {
    Point.prototype.draw.call(this, tier);
    if (!this.drawn) {
        this.drawn = true;
        this.game = tier.game;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.switch = new WSwitch(this.game, ap.x, ap.y + SwitchPoint.Y,
            tier.palette, this.enabled, this.contact);
        tier.image.addChild(this.switch);
    } else {
        this.switch.updatePalette(tier.palette);
    }
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
SwitchPoint.prototype.setEnabled = function(enabled) {
    if (this.enabled == enabled) {
        return;
    }
    if (this.once) {
        this.done = true;
        this.switch.lock();
        var gfx = new SwitchLock(this.game, this.gx, this.gy + SwitchPoint.Y);
        this.game.state.getCurrentState().z.mg.tier().add(gfx);
    }
    this.switch.flip();
    Point.prototype.setEnabled.call(this, enabled);
};

// Should the avatar "stick" briefly when passing this point?
SwitchPoint.prototype.shouldHold = function() {
    if (this.done) {
        return false;
    }
    return Point.prototype.shouldHold.call(this);
};

// Save progress.
SwitchPoint.prototype.saveProgress = function(p) {
    if (this.enabled == this.startEnabled &&
        this.once == this._once &&
        !this.done) {
        return;
    }
    p[this.name] = {
        enabled: this.enabled,
        once: this.once,
        done: this.done
    };

};

// Restore progress.
SwitchPoint.prototype.restoreProgress = function(p) {
    var myp = p[this.name];
    var enabled = myp && myp.enabled ? myp.enabled : this.startEnabled;
    var once = myp && myp.once ? myp.once : false;
    var done = myp && myp.done ? myp.done : false;
    if (enabled == this.enabled &&
        once == this.once &&
        done == this.done) {
        return;
    }
    this.done = done;
    // If we've become locked (e.g. from lightning),
    // unlock ourself.
    if (!once && this.once) {
        this.switch.unlock();
    }
    this.once = once;

    if (enabled != this.enabled) {
        this.switch.flip();
        Point.prototype.setEnabled.call(this, enabled);
    }
};

// Delete our gfx.
SwitchPoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
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
    if (this._once) {
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
        json.enabled, json.textKeys,
        json.once, json.contact);
};
