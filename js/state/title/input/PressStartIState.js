// Very first splash page the user sees.
var PressStartIState = function(handler) {
    IState.call(this, PressStartIState.NAME, handler);
    // Initialize our text.
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.text = this.game.add.text(
        this.game.camera.width / 2, this.game.camera.height / 3,
        'press start', style);
    this.text.anchor.setTo(0.5, 0.5);
    this.text.alpha = 0;
    this.game.scale.onFullScreenChange.add(this.sizeChanged, this);
    this.game.scale.onSizeChange.add(this.sizeChanged, this);
};

PressStartIState.NAME = 'press-start';
PressStartIState.prototype = Object.create(IState.prototype);
PressStartIState.prototype.constructor = PressStartIState;

// Yup, we have constants.
PressStartIState.TEXT_DELAY = 500; // ms
PressStartIState.TEXT_FADE_TIME = 2500; // ms
PressStartIState.BUTTON_LOCKOUT_TIME = 1000; // ms


// Show some fancy "press start" text.
PressStartIState.prototype.activated = function(prev) {
    this.ready = false;
    this.tween = this.game.add.tween(this.text);
    this.tween.to({ alpha: 1 }, PressStartIState.TEXT_FADE_TIME,
        Phaser.Easing.Sinusoidal.InOut, true,
        PressStartIState.TEXT_DELAY, Number.POSITIVE_INFINITY, true);
    this.game.time.events.add(PressStartIState.BUTTON_LOCKOUT_TIME,
        function() {
            this.ready = true;
        }, this);
};

// Handle an update.
PressStartIState.prototype.update = function() {
    if (!this.ready) {
        return;
    }
    if (this.gpad.justReleased(this.buttonMap.SELECT) ||
        this.gpad.justReleased(this.buttonMap.START)) {
        if (this.tween) {
            this.tween.stop();
        }
        this.text.alpha = 0;
        this.activate(TitleMenuIState.NAME);
    }
};

// Screen resized.
PressStartIState.prototype.sizeChanged = function() {
    this.text.x = this.game.camera.width / 2;
    this.text.y = this.game.camera.height / 3;
};
