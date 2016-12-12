// Pause the game.
var PausedIState = function(handler, level) {
    IState.call(this, PausedIState.NAME, handler);
    this.level = level;
};

PausedIState.NAME = 'paused';
PausedIState.prototype = Object.create(IState.prototype);
PausedIState.prototype.constructor = PausedIState;

// Constants!
PausedIState.TEXT_Y_DELTA = 50;
PausedIState.MENU_TEXT_STYLE = { font: '30px Arial', fill: '#fff' };
PausedIState.SELECTOR_SIDE = 16;
PausedIState.SELECTOR_THICKNESS = 3;
PausedIState.ANGLE_CATCH = Math.PI / 10;
PausedIState.TILT_TIME = 300; // ms
PausedIState.TILT_HOLD_DELAY_FACTOR = 1.7;
PausedIState.BLUR = 15; // 0 is no blur.
PausedIState.BLUR_TIME = 700; // ms

// Called when the game is first paused.
PausedIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.game.paused = true;
    this.options = [
        { text: 'continue', action: this.selectContinue },
        { text: 'restart', action: this.selectRestart },
        { text: 'exit', action: this.selectExit }
    ];
    // this.tilts = { up: 0, down: Math.PI };
    this.tiltTimes = {
        up: 0,
        down: 0
    };
    var totalDelta = (this.options.length - 1) * PausedIState.TEXT_Y_DELTA;
    this.initialDelta = totalDelta / -2;
    this.perItemDelta = PausedIState.TEXT_Y_DELTA;

    var view = this.game.camera.view;
    this.x = view.x;
    this.y = view.y;
    this.width = view.width;
    this.height = view.height;
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    bitmap.context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Black, alpha'd.
    bitmap.context.strokeStyle = '#fff';
    bitmap.context.lineWidth = 1;
    bitmap.context.fillRect(0, 0, this.width, this.height);
    bitmap.context.beginPath();
    bitmap.context.moveTo(this.width / 2 - (PausedIState.TEXT_Y_DELTA / 2),
        (this.height / 2) + (2 * this.initialDelta));
    bitmap.context.lineTo(this.width / 2 - (PausedIState.TEXT_Y_DELTA / 2),
        (this.height / 2) - (2 * this.initialDelta));
    bitmap.context.stroke();
    this.cloth = this.game.add.image(this.x, this.y, bitmap);
    this.game.state.getCurrentState().z.menu.add(this.cloth);

    bitmap = this.game.add.bitmapData(this.width, this.height);
    this.spacer = this.game.add.image(this.x, this.y, bitmap);
    this.game.state.getCurrentState().z.level.add(this.spacer);

    var d = PausedIState.SELECTOR_SIDE;
    var w = PausedIState.SELECTOR_THICKNESS;
    this.bitmap = this.game.add.bitmapData(d, d);
    this.bitmap.context.fillStyle = '#fff';
    this.bitmap.context.strokeStyle = '#fff';
    this.bitmap.context.lineWidth = w;
    // this.bitmap.context.fillRect(0, 0, d, d);
    this.bitmap.context.strokeRect(w / 2, w / 2,
        d - w, d - w);
    this.selector = this.game.add.image(
        this.x + (this.width / 2) - PausedIState.TEXT_Y_DELTA,
        this.y + (this.height / 2),
        this.bitmap);
    this.selector.anchor.setTo(0.5, 0.5);
    this.game.state.getCurrentState().z.menu.add(this.selector);
    var tween = this.game.add.tween(this.selector)
    tween.to({ rotation: Math.PI / 2 },
        1000, Phaser.Easing.Linear.InOut, true, 0,
        Number.POSITIVE_INFINITY, false);
    this.tweens = [tween];

    this.texts = [];
    for (var i = 0; i < this.options.length; i++) {
        this.texts.push(this.createText(this.options[i].text, i));
    }

    this.myFilter = new PIXI.BlurFilter();
    this.myFilter.blur = 0;
    this.game.state.getCurrentState().zAll.filters = [this.myFilter];
    tween = this.game.add.tween(this.myFilter);
    tween.to({ blur: PausedIState.BLUR }, PausedIState.BLUR_TIME,
        Phaser.Easing.Cubic.Out, true);
    this.tweens.push(tween);

    this.setSelected(0);
};

// Create one of our menu text options.
PausedIState.prototype.createText = function(text, index) {
    var textObj = game.add.text(
        this.x + (this.width / 2),
        this.y + (this.height / 2) + this.initialDelta +
        (this.perItemDelta * index),
        text, PausedIState.MENU_TEXT_STYLE);
    textObj.anchor.setTo(0, 0.5);
    this.game.state.getCurrentState().z.menu.add(textObj);
    return textObj;
};

// Redraw our selector when the button's depressed.
PausedIState.prototype.activateSelector = function() {
    var d = PausedIState.SELECTOR_SIDE;
    var w = PausedIState.SELECTOR_THICKNESS;
    this.bitmap.context.clearRect(0, 0, d, d);
    this.bitmap.context.fillRect(w, w, d - (2 * w), d - (2 * w));
    this.bitmap.dirty = true;
};

// User opted to unpause.
PausedIState.prototype.setSelected = function(index) {
    this.selectedIndex = index;
    for (var i = 0; i < this.texts.length; i++) {
        this.texts[i].alpha = i == this.selectedIndex ? 1 : 0.25;
    }
    this.selector.y = this.y + (this.height / 2) + this.initialDelta +
        (this.perItemDelta * index);
};

// User opted to unpause.
PausedIState.prototype.selectContinue = function() {
    this.unpause();
    this.activate(UnpausedIState.NAME);
};

// User opted to restart.
PausedIState.prototype.selectRestart = function() {
    this.unpause();
    this.game.state.start('PlayLevelState', true, false,
        this.level.name, this.gpad);
};

// User opted to exit.
PausedIState.prototype.selectExit = function() {
    this.unpause();
    this.game.state.start('TitleMenuState');
};

// Unpause the game.
PausedIState.prototype.unpause = function() {
    this.gpad.consumeButtonEvent();
    this.cloth.destroy();
    this.selector.destroy();
    for (var i = 0; i < this.texts.length; i++) {
        this.texts[i].destroy();
    }
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    var tween = this.game.add.tween(this.myFilter);
    tween.scope = this;
    tween.to({ blur: 0 }, PausedIState.BLUR_TIME,
        Phaser.Easing.Cubic.Out, true);
    tween.onComplete.add(function(filter, tween) {
        tween.scope.spacer.destroy();
        tween.scope.game.state.getCurrentState().zAll.filters = null;
    });

    this.game.paused = false;
};

// Handle an update.
PausedIState.prototype.pauseUpdate = function() {
    this.game.input.update();
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].update();
    }
    if (this.bitmap.dirty) {
        this.bitmap.render();
    }
    this.update();
};

// Handle an update.
PausedIState.prototype.update = function() {
    var joystick = this.gpad.getAngleAndTilt();
    if (joystick.tilt > 0.5) {
        var t = this.game.time.now;
        var aUp = Utils.getBoundedAngleDifference(joystick.angle, 0);
        var aDown = Utils.getBoundedAngleDifference(joystick.angle, Math.PI);
        if (aUp < PausedIState.ANGLE_CATCH) {
            this.tiltTimes.down = 0;
            var first = this.tiltTimes.up == 0;
            if (first || this.tiltTimes.up <= t) {
                var index = (this.selectedIndex + 1) % this.options.length;
                this.setSelected(index);
                var factor = first ? PausedIState.TILT_HOLD_DELAY_FACTOR : 1;
                this.tiltTimes.up = t + factor * PausedIState.TILT_TIME;
            }
        } else if (aDown < PausedIState.ANGLE_CATCH) {
            this.tiltTimes.up = 0;
            var first = this.tiltTimes.down == 0;
            if (first || this.tiltTimes.down <= t) {
                var change = this.options.length - 1;
                var index = (this.selectedIndex + change) % this.options.length;
                this.setSelected(index);
                var factor = first ? PausedIState.TILT_HOLD_DELAY_FACTOR : 1;
                this.tiltTimes.down = t + factor * PausedIState.TILT_TIME;
            }
        } else {
            this.tiltTimes.up = 0;
            this.tiltTimes.down = 0;
        }
    } else {
        this.tiltTimes.up = 0;
        this.tiltTimes.down = 0;
    }
    if (this.gpad.justReleased(this.buttonMap.PAUSE_BUTTON) ||
        this.gpad.justReleased(this.buttonMap.CANCEL_BUTTON)) {
        this.selectContinue();
    } else if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.activateSelector();
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.options[this.selectedIndex].action.call(this);
    }
};
