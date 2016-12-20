// Handle tier changes and additions.
var SwapIState = function(handler, level, name,
    direction) {
    IState.call(this, name, handler);
    this.level = level;
    this.avatar = level.avatar;
    this.up = direction > 0;
    this.word = this.up ? 'above' : 'below';
    this.button = this.up ?
        this.buttonMap.EDIT_STEP_UP : this.buttonMap.EDIT_STEP_DOWN;
};

SwapIState.prototype = Object.create(IState.prototype);
SwapIState.prototype.constructor = SwapIState;

// Constants.
SwapIState.CHARGE_TIME = 700; // ms


// Called when we become the active state.
SwapIState.prototype.activated = function(prev) {
    this.startCharging = -1;
};

// Called when we become inactive.
SwapIState.prototype.deactivated = function(next) {
    if (this.image) {
        this.image.kill();
        this.image = undefined;
    }
};

// Handle an update.
SwapIState.prototype.update = function() {
    if (this.startCharging > 0) {
        this.updateCharging();
    } else {
        this.updateSwap();
    }
};

// Handle an update.
SwapIState.prototype.updateSwap = function() {
    this.avatar.tierMeter.showBriefly();
    this.gpad.consumeButtonEvent();
    var t = this.getNextTier();
    if (!t) {
        if (this.canAddTier()) {
            this.startCharging = this.game.time.now +
                SwapIState.CHARGE_TIME;
            this.avatar.help.setText('adding tier ' + this.word);
            this.image = new EditCharge(this.game,
                this.avatar.x, this.avatar.y, this.level.tier.palette, true);
            this.game.state.getCurrentState().z.mg.tier().add(this.image);
            return this.updateCharging();
        } else {
            this.activate(GeneralEditIState.NAME);
            return;
        }
    }
    var p = Utils.findClosestPointToAvatar(
        t, this.level.avatar);
    this.changeTier(t, p);
    this.activate(GeneralEditIState.NAME);
};

// Handle an update.
SwapIState.prototype.updateCharging = function() {
    if (this.gpad.justReleased(this.button)) {
        if (this.game.time.now > this.startCharging) {
            this.addTier();
        }
        this.activate(GeneralEditIState.NAME);
    }
};

// What tier are we headed to?
SwapIState.prototype.getNextTier = function() {
    return this.up ?
        this.level.getNextTierUp() :
        this.level.getNextTierDown()
};

// Move to our target tier.
SwapIState.prototype.changeTier = function(t, p) {
    this.avatar.help.setText('tier: ' + t.name, true, true);
    return this.up ?
        this.level.advanceTierUp(p) :
        this.level.advanceTierDown(p)
};

// Can we even add?
SwapIState.prototype.canAddTier = function() {
    return !this.level.tierMap[this.up ? 't7' : 't0'];
};

// Create and move to a new tier.
SwapIState.prototype.addTier = function() {
    // Create a tier containing p0 at (5,5);
    if (this.up) {
        var i = this.level.tiers.length - 1;
        var index = this.level.tiers[i].index + 1;
    } else {
        var index = this.level.tiers[0].index - 1;
    }
    var t = new Tier(this.game, 't' + index);
    t.level = this.level;
    t._addPoint(new Point('p0', 5, 5));
    this.level.addTier(t.name, t, !this.up);
    this.avatar.tierMeter.recreate();
    this.changeTier(t, 'p0');
};



// Handle tier ascension.
var StepUpIState = function(handler, level) {
    SwapIState.call(this, handler, level, StepUpIState.NAME, 1);
};

StepUpIState.NAME = 'stepUp';
StepUpIState.prototype = Object.create(SwapIState.prototype);
StepUpIState.prototype.constructor = StepUpIState;


// Handle tier descension.
var StepDownIState = function(handler, level) {
    SwapIState.call(this, handler, level, StepDownIState.NAME, -1);
};

StepDownIState.NAME = 'stepDown';
StepDownIState.prototype = Object.create(SwapIState.prototype);
StepDownIState.prototype.constructor = StepDownIState;
