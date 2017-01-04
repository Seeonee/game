// A power that can be unlocked and used.
var Power = function(game) {
    this.game = game;
    this.type = this.constructor.TYPE;
    this.ihandler = this.game.state.getCurrentState().powerhandler;
};

// Constants.
Power.ALL_TYPES = [
    'sword',
    'shield',
    'axe',
    'crown',
    'hourglass',
    'might',
    'presence',
    'trace',
    'wit'
];


// Called when access to this power is gained.
Power.prototype.acquire = function(avatar) {
    this.avatar = avatar;
    this.ihandler.activate(this.type);
};

// Called when access to this power is lost.
Power.prototype.release = function() {
    this.ihandler.activate(undefined);
};

// Power loader. As we load them, 
// we cache the instances within their 
// class types.
Power.load = function(game, type) {
    var level = game.state.getCurrentState().level;
    if (!level.powerCache) {
        level.powerCache = {};
    }
    if (!level.powerCache[type]) {
        powerClass = Power.load.factory[type];
        if (!powerClass) {
            console.error('could not look up power ' + type);
            return null;
        }
        var power = Utils.construct(powerClass, game);
        level.powerCache[type] = power;
    } else {
        var power = level.powerCache[type];
    }
    return power;
};

Power.load.factory = {};
