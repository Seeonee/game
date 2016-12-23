// Add a key.
var CustomizeKeyPointIState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, KeyPoint, 1);
};

CustomizeKeyPointIState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeKeyPointIState.prototype.constructor = CustomizeKeyPointIState;


// Update loop.
CustomizeKeyPointIState.prototype.update = function() {
    if (this.level.tier == this.level.tiers[this.level.tiers.length - 1]) {
        // Can't add a point.
        this.avatar.help.setText('can\'t add keys\n' +
            'to top tier', true);
        this.finished();
        return;
    }
    this.finished(new KeyPoint()); // Activates previous.
};
