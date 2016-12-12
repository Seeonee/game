// Pause the game.
var PausedIState = function(handler, level) {
    IState.call(this, PausedIState.NAME, handler);
    this.level = level;

    this.options = [
        { text: 'continue', action: this.selectContinue },
        { text: 'restart', action: this.selectRestart },
        { text: 'exit', action: this.selectExit }
    ];
    this.tilts = [
        { angle: 0, action: this.setSelectedToPrevious },
        { angle: Math.PI, action: this.setSelectedToNext }
    ];

    this.initialIndex = 0;
    this.totalDelta = (this.options.length - 1) * PausedIState.TEXT_Y_DELTA;
    this.initialDelta = 0; // this.totalDelta / -2;
    this.perItemDelta = PausedIState.TEXT_Y_DELTA;
    this.style = PausedIState.STYLE.BAR_LEFT;
    this.color1 = this.game.settings.colors.MENU1;
    this.color2 = this.game.settings.colors.MENU2;
    this.dropCloth = true;
    this.blurBackground = true;
};

PausedIState.NAME = 'paused';
PausedIState.prototype = Object.create(IState.prototype);
PausedIState.prototype.constructor = PausedIState;

// Constants!
PausedIState.TEXT_Y_DELTA = 50;
PausedIState.SELECTOR_SIDE = 16;
PausedIState.SELECTOR_THICKNESS = 3;
PausedIState.SELECTOR_QUARTER_TURN_TIME = 2000; // ms
PausedIState.ANGLE_CATCH = Math.PI / 10;
PausedIState.TILT_CATCH = 0.5;
PausedIState.TILT_TIME = 300; // ms
PausedIState.TILT_HOLD_DELAY_FACTOR = 1.7;
PausedIState.BLUR = 15; // 0 is no blur.
PausedIState.BLUR_TIME = 700; // ms
PausedIState.STYLE = {
    DIVIDED: 0,
    BAR_LEFT: 1,
    BAR_RIGHT: 2
};
PausedIState.COLOR2_ALPHA = 0.25;

// Called when the game is first paused.
PausedIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.game.paused = true;

    var view = this.game.camera.view;
    this.x = view.x;
    this.y = view.y;
    this.z = this.game.state.getCurrentState().z;
    this.zAll = this.game.state.getCurrentState().zAll;
    this.width = view.width;
    this.height = view.height;
    this.tweens = [];
    this.texts = [];

    // Create EVERYTHING.
    this.chrome = this.createChrome(this.dropCloth);
    if (this.blurBackground) {
        this.spacer = this.createSpacer();
    }
    this.bitmap = this.createSelectorBitmap();
    this.selector = this.createSelector(this.bitmap);
    this.tweens.push(this.createSelectorTween(this.selector));
    for (var i = 0; i < this.options.length; i++) {
        this.texts.push(this.createText(this.options[i].text, i));
    }
    if (this.blurBackground) {
        this.myFilter = this.createFilter();
        this.tweens.push(this.createFilterTween(this.myFilter));
    }

    this.setSelected(this.initialIndex);
};

// Creates the menu chrome, and if asked also draws
// the blackout cloth that covers the stage.
PausedIState.prototype.createChrome = function(dropCloth) {
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    if (dropCloth) {
        bitmap.context.fillStyle = this.game.settings.colors.BLACK.rgba(0.5);
        bitmap.context.fillRect(0, 0, this.width, this.height);
    }
    if (this.style == PausedIState.STYLE.DIVIDED) {
        bitmap.context.strokeStyle = this.color2.s;
        bitmap.context.lineWidth = 1;
        bitmap.context.beginPath();
        bitmap.context.moveTo(
            this.width / 2 - (PausedIState.TEXT_Y_DELTA / 2), 0);
        bitmap.context.lineTo(
            this.width / 2 - (PausedIState.TEXT_Y_DELTA / 2),
            this.height);
        bitmap.context.stroke();
    } else {
        bitmap.context.beginPath();
        bitmap.context.fillStyle = this.color2.rgba(PausedIState.COLOR2_ALPHA);
        var h = 2 * PausedIState.TEXT_Y_DELTA / 2;
        var w = this.width / 2 - (PausedIState.TEXT_Y_DELTA / 2);
        if (this.style == PausedIState.STYLE.BAR_LEFT) {
            bitmap.context.fillRect(
                0, (this.height / 2) - (h / 2), w, h);
        } else if (this.style == PausedIState.STYLE.BAR_RIGHT) {
            bitmap.context.fillRect(
                w, (this.height / 2) - (h / 2), this.width - w, h);
        }
    }
    var chrome = this.game.add.image(this.x, this.y, bitmap);
    this.z.menu.add(chrome);
    return chrome;
};

// Create the camera view spacer that makes the blur work properly.
PausedIState.prototype.createSpacer = function() {
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    var spacer = this.game.add.image(this.x, this.y, bitmap);
    this.zAll.add(spacer);
    return spacer;
};

// Create the selector's bitmap data.
PausedIState.prototype.createSelectorBitmap = function() {
    var d = PausedIState.SELECTOR_SIDE;
    var w = PausedIState.SELECTOR_THICKNESS;
    var bitmap = this.game.add.bitmapData(d, d);
    bitmap.context.fillStyle = this.color1.s;
    bitmap.context.strokeStyle = this.color1.s;
    bitmap.context.lineWidth = w;
    bitmap.context.strokeRect(w / 2, w / 2,
        d - w, d - w);
    return bitmap;
};

// Create the selector image from its bitmap data.
PausedIState.prototype.createSelector = function(bitmap) {
    var selector = this.game.add.image(
        this.x + (this.width / 2) - PausedIState.TEXT_Y_DELTA,
        this.y + (this.height / 2),
        bitmap);
    selector.anchor.setTo(0.5, 0.5);
    this.z.menu.add(selector);
    return selector;
};

// Create the selector's spin.
PausedIState.prototype.createSelectorTween = function(selector) {
    var tween = this.game.add.tween(selector)
    tween.to({ rotation: Math.PI / 2 },
        PausedIState.SELECTOR_QUARTER_TURN_TIME,
        Phaser.Easing.Linear.InOut, true, 0,
        Number.POSITIVE_INFINITY, false);
    return tween;
};

// Create one of our menu text options.
PausedIState.prototype.createText = function(text, index) {
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.color1.s
    };
    var textObj = game.add.text(this.x + (this.width / 2),
        this.y + (this.height / 2) + this.initialDelta +
        (this.perItemDelta * index), text, style);
    textObj.anchor.setTo(0, 0.5);
    this.z.menu.add(textObj);
    return textObj;
};

// Create our blur filter.
PausedIState.prototype.createFilter = function() {
    var myFilter = new PIXI.BlurFilter();
    myFilter.blur = 0;
    this.zAll.filters = [myFilter];
    return myFilter;
};
// Make the blur appear gradually.
PausedIState.prototype.createFilterTween = function(myFilter) {
    var tween = this.game.add.tween(myFilter);
    tween.to({ blur: PausedIState.BLUR }, PausedIState.BLUR_TIME,
        Phaser.Easing.Cubic.Out, true);
    return tween;
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
        var text = this.texts[i];
        var selected = i == this.selectedIndex;
        text.style.fill = selected ? this.color1.s :
            this.color2.rgba(PausedIState.COLOR2_ALPHA);
        text.y = this.y + (this.height / 2) +
            this.initialDelta + (this.perItemDelta * (i - index));
        text.dirty = true;
    }
};

// User tilted up.
PausedIState.prototype.setSelectedToPrevious = function() {
    var index = (this.selectedIndex + 1) % this.options.length;
    this.setSelected(index);
};

// User tilted down.
PausedIState.prototype.setSelectedToNext = function() {
    var delta = this.options.length - 1; // Modular -1!
    var index = (this.selectedIndex + delta) % this.options.length;
    this.setSelected(index);
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

// User pressed okay; fire the currently selected thing!
PausedIState.prototype.selectCurrent = function(joystick) {
    this.options[this.selectedIndex].action.call(this);
};

// User is tilting; figure out towards what, 
// and do it!
PausedIState.prototype.updateFromJoystick = function(joystick) {
    if (joystick.tilt > PausedIState.TILT_CATCH) {
        var t = this.game.time.now;
        for (var i = 0; i < this.tilts.length; i++) {
            var tilt = this.tilts[i];
            var a = Utils.getBoundedAngleDifference(
                joystick.angle, tilt.angle);
            if (a < PausedIState.ANGLE_CATCH) {
                // Set all other tilt times to 0.
                for (var j = 0; j < this.tilts.length; j++) {
                    if (i != j) {
                        var tilt2 = this.tilts[j];
                        tilt2.time = 0;
                    }
                }
                // First time, or is stick being held?
                var first = tilt.time == undefined || tilt.time == 0;
                if (first || tilt.time <= t) {
                    tilt.action.call(this);
                    var factor = first ?
                        PausedIState.TILT_HOLD_DELAY_FACTOR : 1;
                    tilt.time = t + factor * PausedIState.TILT_TIME;
                }
                return;
            }
        }
    }
    for (var i = 0; i < this.tilts.length; i++) {
        this.tilts[i].time = 0;
    }
};

// Unpause the game.
PausedIState.prototype.unpause = function() {
    this.gpad.consumeButtonEvent();
    this.chrome.destroy();
    this.selector.destroy();
    for (var i = 0; i < this.texts.length; i++) {
        this.texts[i].destroy();
    }
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    if (this.blurBackground) {
        var tween = this.game.add.tween(this.myFilter);
        tween.scope = this;
        tween.to({ blur: 0 }, PausedIState.BLUR_TIME,
            Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(function(filter, tween) {
            tween.scope.spacer.destroy();
            tween.scope.game.state.getCurrentState().zAll.filters = null;
        });
    }

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
    this.updateFromJoystick(joystick);
    if (this.gpad.justReleased(this.buttonMap.PAUSE_BUTTON) ||
        this.gpad.justReleased(this.buttonMap.CANCEL_BUTTON)) {
        this.selectContinue();
    } else if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.activateSelector();
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.selectCurrent();
    }
};
