// Pause the game.
var PausedIState = function(handler, level) {
    IState.call(this, PausedIState.NAME, handler);
    // No use for the level yet, but maybe someday?
};

PausedIState.NAME = 'paused';
PausedIState.prototype = Object.create(IState.prototype);
PausedIState.prototype.constructor = PausedIState;

// Called when the game is first paused.
PausedIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.game.paused = true;

    var view = this.game.camera.view;
    this.bitmap = this.game.add.bitmapData(view.width, view.height);
    this.bitmap.context.fillStyle = '#000';
    this.bitmap.context.fillRect(0, 0, view.width, view.height);
    this.image = this.game.add.image(view.x, view.y, this.bitmap);
    this.image.alpha = 0.5;
    this.game.state.getCurrentState().z.fg.add(this.image);
    this.label = game.add.text(
        this.x + (this.w / 2), this.y + (this.h / 2),
        'Paused', { font: '30px Arial', fill: '#fff' });
    this.game.state.getCurrentState().z.fg.add(this.label);
    this.label.anchor.setTo(0.5, 0.5);
};

// Handle an update.
PausedIState.prototype.pauseUpdate = function() {
    this.game.input.update();
    this.update();
};

// Handle an update.
PausedIState.prototype.update = function() {
    if (this.gpad.justPressed(this.buttonMap.PAUSE_BUTTON) ||
        this.gpad.justPressed(this.buttonMap.CANCEL_BUTTON)) {
        this.gpad.consumeButtonEvent();
        this.image.destroy();
        this.label.destroy();
        this.game.paused = false;
        this.activate(UnpausedIState.NAME);
    }
};
