// Gain a key for the next tier up.
var GainKeyIState = function(handler, level) {
    IState.call(this, GainKeyIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

GainKeyIState.NAME = 'gainKey';
GainKeyIState.prototype = Object.create(IState.prototype);
GainKeyIState.prototype.constructor = GainKeyIState;

// Handle an update.
GainKeyIState.prototype.update = function() {
    this.gpad.consumeButtonEvent();
    this.avatar.tierMeter.addKey();
    this.activate(GeneralEditIState.NAME);
};

// Spend a key for the current tier.
var LoseKeyIState = function(handler, level) {
    IState.call(this, LoseKeyIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

LoseKeyIState.NAME = 'loseKey';
LoseKeyIState.prototype = Object.create(IState.prototype);
LoseKeyIState.prototype.constructor = LoseKeyIState;

// Handle an update.
LoseKeyIState.prototype.update = function() {
    this.gpad.consumeButtonEvent();
    this.avatar.tierMeter.useKey();
    this.activate(GeneralEditIState.NAME);
};
