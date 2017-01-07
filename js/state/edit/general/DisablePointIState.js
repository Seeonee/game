// Handle point en/dis-abling.
var DisablePointIState = function(handler, level) {
    IState.call(this, DisablePointIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

DisablePointIState.NAME = 'disable';
DisablePointIState.prototype = Object.create(IState.prototype);
DisablePointIState.prototype.constructor = DisablePointIState;


// Update loop.
DisablePointIState.prototype.update = function() {
    this.gpad.consumeButtonEvent();
    if (this.avatar.point && this.avatar.point.type) {
        var enabled = !this.avatar.point.isEnabled();
        this.avatar.point.setEnabled(enabled);
        var s = this.avatar.point.name + ' ' +
            (enabled ? 'enabled' : 'disabled');
        this.avatar.htext.setText(s, true);
    }
    this.activate(GeneralEditIState.NAME);
};
