// A reusable, customizable menu.
var IMenuState = function(name, handler, context) {
    IState.call(this, name, handler);
    this.root = new IMenuOption();
    this.current = this.root;
    this.tilts = [
        { angle: 0, action: this.setSelectedToPrevious },
        { angle: Math.PI, action: this.setSelectedToNext }
    ];
    this.z = this.game.state.getCurrentState().z;
    this.zAll = this.game.state.getCurrentState().zAll;
    this.tweens = [];
    this.texts = [];
    this.created = false;

    this.context = context ? context : this; // For called actions.
    this.initialIndex = 0;
    this.initialDelta = 0;
    this.perItemDelta = IMenuState.TEXT_Y_DELTA;
    this.style = IMenuState.STYLE.BAR_LEFT;
    this.color1 = this.game.settings.colors.MENU1;
    this.color2 = this.game.settings.colors.MENU2;
    this.dropCloth = false;
    this.blurBackground = false;
    this.updateDuringPause = true;
    this.inputBlocked = false;
};

IMenuState.prototype = Object.create(IState.prototype);
IMenuState.prototype.constructor = IMenuState;

// Constants!
IMenuState.TEXT_Y_DELTA = 50;
IMenuState.SELECTOR_SIDE = 16;
IMenuState.SELECTOR_THICKNESS = 3;
IMenuState.SELECTOR_QUARTER_TURN_TIME = 2000; // ms
IMenuState.ANGLE_CATCH = Math.PI / 10;
IMenuState.TILT_CATCH = 0.5;
IMenuState.TILT_TIME = 300; // ms
IMenuState.TILT_HOLD_DELAY_FACTOR = 1.7;
IMenuState.BLUR = 15; // 0 is no blur.
IMenuState.BLUR_TIME = 700; // ms
IMenuState.STYLE = {
    DIVIDED: 0,
    BAR_LEFT: 1,
    BAR_RIGHT: 2
};
IMenuState.ROOT_OPTION_ALPHA = 1;
IMenuState.UNSELECTED_OPTION_ALPHA = 0.25;
IMenuState.CHROME_ALPHA = 1;
IMenuState.OPTION_TRANSITION_TIME = 100; // ms
IMenuState.LEVEL_TRANSITION_TIME = 300; // ms


// *************************
// Menu item, with possible nested subitems.
// Each action will be called with its text and index as params.
var IMenuOption = function(text, action, cancel) {
    this.text = text;
    this.action = action;
    this.cancel = cancel;
    this.cancelOption = undefined;
    this.parent = undefined;
    this.options = [];
    this.length = 0;
    this.index = 0;
    this.childIndex = 0;
    this.t = undefined;
};

// Menu item, with possible nested subitems.
// Each action will be called with its text and index as params.
IMenuOption.prototype.add = function(text, action, cancel) {
    var option = new IMenuOption(text, action, cancel);
    option.parent = this;
    option.index = this.length;
    this.options.push(option);
    this.length += 1;
    if (cancel) {
        this.cancelOption = option;
    }
    return option;
};

// Cleans up the item's display state each time 
// the menu closes.
IMenuOption.prototype.cleanUp = function() {
    if (this.t) {
        this.t.visible = false;
    }
    this.childIndex = 0;
    for (var i = 0; i < this.length; i++) {
        this.options[i].cleanUp();
    }
};
// *************************


// Defines an action.
// Returns it, so that subactions can be added to it 
// via .addSubOption().
// If cancel is true, this will also be set as the overall 
// cancel action for this menu or submenu.
// Each action will be called with its text and index as params.
IMenuState.prototype.add = function(text, action, cancel) {
    return this.root.add(text, action, cancel);
}

// Called when the game is first paused.
IMenuState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.game.paused = true;

    var view = this.game.camera.view;
    this.x = view.x;
    this.y = view.y;
    this.width = view.width;
    this.height = view.height;

    if (!this.created) {
        // Create EVERYTHING.
        this.chrome = this.createChrome(this.dropCloth);
        if (this.blurBackground) {
            this.spacer = this.createSpacer();
        }
        this.bitmap = this.createSelectorBitmap();
        this.selector = this.createSelector(this.bitmap);
        this.createTextFor(this.root);
        if (this.blurBackground) {
            this.myFilter = this.createFilter();
        }
        this.created = true;
    } else if (this.blurBackground) {
        this.spacer = this.createSpacer();
    }
    this.show();
};

// Creates the menu chrome, and if asked also draws
// the blackout cloth that covers the stage.
IMenuState.prototype.createChrome = function(dropCloth) {
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    if (dropCloth) {
        bitmap.context.fillStyle = this.game.settings.colors.BLACK.rgba(0.5);
        bitmap.context.fillRect(0, 0, this.width, this.height);
    }
    if (this.style == IMenuState.STYLE.DIVIDED) {
        bitmap.context.strokeStyle = this.color2.s;
        bitmap.context.lineWidth = 1;
        bitmap.context.beginPath();
        bitmap.context.moveTo(
            this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2), 0);
        bitmap.context.lineTo(
            this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2),
            this.height);
        bitmap.context.stroke();
    } else {
        bitmap.context.beginPath();
        bitmap.context.fillStyle = this.color2.rgba(
            IMenuState.CHROME_ALPHA);
        var h = 2 * IMenuState.TEXT_Y_DELTA / 2;
        var w = this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2);
        if (this.style == IMenuState.STYLE.BAR_LEFT) {
            bitmap.context.fillRect(
                0, (this.height / 2) - (h / 2), w, h);
        } else if (this.style == IMenuState.STYLE.BAR_RIGHT) {
            bitmap.context.fillRect(
                w, (this.height / 2) - (h / 2), this.width - w, h);
        }
    }
    var chrome = this.game.add.image(this.x, this.y, bitmap);
    this.z.menu.add(chrome);
    return chrome;
};

// Create the camera view spacer that makes the blur work properly.
IMenuState.prototype.createSpacer = function() {
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    var spacer = this.game.add.image(this.x, this.y, bitmap);
    this.zAll.add(spacer);
    return spacer;
};

// Create the selector's bitmap data.
IMenuState.prototype.createSelectorBitmap = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    var bitmap = this.game.add.bitmapData(d, d);
    bitmap.context.fillStyle = this.color1.s;
    bitmap.context.strokeStyle = this.color1.s;
    bitmap.context.lineWidth = w;
    return bitmap;
};

// Create the selector image from its bitmap data.
IMenuState.prototype.createSelector = function(bitmap) {
    var selector = this.game.add.image(
        this.x + (this.width / 2) - IMenuState.TEXT_Y_DELTA,
        this.y + (this.height / 2),
        bitmap);
    selector.anchor.setTo(0.5, 0.5);
    this.z.menu.add(selector);
    return selector;
};

// Create the selector's spin.
IMenuState.prototype.createSelectorTween = function(selector) {
    var tween = this.game.add.tween(selector)
    tween.to({ rotation: Math.PI / 2 },
        IMenuState.SELECTOR_QUARTER_TURN_TIME,
        Phaser.Easing.Linear.InOut, true, 0,
        Number.POSITIVE_INFINITY, false);
    return tween;
};

// Recursively create an option's text elements.
IMenuState.prototype.createTextFor = function(option, level) {
    var level = level == undefined ? 0 : level;
    for (var i = 0; i < option.length; i++) {
        var o2 = option.options[i];
        var x = this.x + (this.width / 2);
        if (level > 0) {
            x += this.width / 2 - (0.5 * this.perItemDelta);
        }
        var y = this.y + (this.height / 2) + this.initialDelta +
            (this.perItemDelta * i);
        o2.t = this.createText(option.options[i].text, x, y);
        if (level > 0) {
            o2.t.alpha = 0;
        }
        this.createTextFor(o2, level + 1);
    }
};

// Create one of our menu text options.
IMenuState.prototype.createText = function(text, x, y) {
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.color1.s
    };
    var textObj = game.add.text(x, y, text, style);
    textObj.alpha = IMenuState.UNSELECTED_OPTION_ALPHA;
    textObj.anchor.setTo(0, 0.5);
    this.z.menu.add(textObj);
    return textObj;
};

// Recursively position text elements to their starting points.
IMenuState.prototype.positionTextFor = function(option, level) {
    var level = level == undefined ? 0 : level;
    for (var i = 0; i < option.length; i++) {
        var o2 = option.options[i];
        var x = this.x + (this.width / 2);
        if (level > 0) {
            x += this.width / 2 - (0.5 * this.perItemDelta);
        }
        var y = this.y + (this.height / 2) + this.initialDelta +
            (this.perItemDelta * i);
        o2.t.x = x;
        o2.t.y = y;
        o2.t.style.fill = this.color1.s;
        o2.t.alpha = IMenuState.UNSELECTED_OPTION_ALPHA;
        o2.t.dirty = true;
        o2.t.visible = level == 0;
        this.createTextFor(o2, level + 1);
    }
};

// Create our blur filter.
IMenuState.prototype.createFilter = function() {
    var myFilter = new PIXI.BlurFilter();
    myFilter.blur = 0;
    return myFilter;
};
// Make the blur appear gradually.
IMenuState.prototype.createFilterTween = function(myFilter) {
    var tween = this.game.add.tween(myFilter);
    tween.to({ blur: IMenuState.BLUR }, IMenuState.BLUR_TIME,
        Phaser.Easing.Cubic.Out, true);
    return tween;
};

// Redraw our selector when the button's lifted.
IMenuState.prototype.deactivateSelector = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    this.bitmap.context.clearRect(0, 0, d, d);
    this.bitmap.context.strokeRect(w / 2, w / 2,
        d - w, d - w);
    this.bitmap.dirty = true;
};

// Redraw our selector when the button's depressed.
IMenuState.prototype.activateSelector = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    this.bitmap.context.clearRect(0, 0, d, d);
    this.bitmap.context.fillRect(w, w, d - (2 * w), d - (2 * w));
    this.bitmap.dirty = true;
};

// Turn on or off input temporarily.
// Mainly used so that menu animations don't get screwed.
IMenuState.prototype.setInputBlocked = function(inputBlocked) {
    if (!inputBlocked) {
        this.gpad.consumeButtonEvent();
    }
    this.inputBlocked = inputBlocked;
};

// Resets everything to its starting position, 
// and makes it all visible again.
IMenuState.prototype.show = function() {
    this.chrome.x = this.x;
    this.chrome.y = this.y;
    this.chrome.visible = true;

    this.selector.x = this.x + (this.width / 2) - IMenuState.TEXT_Y_DELTA;
    this.selector.y = this.y + (this.height / 2);
    this.selector.visible = true;
    this.tweens.push(this.createSelectorTween(this.selector));

    this.positionTextFor(this.root);

    if (this.blurBackground) {
        this.zAll.filters = [this.myFilter];
        this.tweens.push(this.createFilterTween(this.myFilter));
    }

    this.deactivateSelector();
    this.setSelected(this.initialIndex);
};


// User opted to unpause.
IMenuState.prototype.setSelected = function(index) {
    this.setInputBlocked(true);
    this.selectedIndex = index;
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        text.style.fill = this.color2.s;
        text.dirty = true;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        var y = this.y + (this.height / 2) +
            this.initialDelta + (this.perItemDelta * (i - index));
        var tween = this.game.add.tween(text);
        tween.to({ y: y, alpha: alpha }, IMenuState.OPTION_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.scope = this;
            tween.onComplete.add(function(text, tween) {
                text.style.fill = tween.scope.color1.s;
                tween.scope.setInputBlocked(false);
                text.dirty = true;
            });
        }
        this.tweens.push(tween);
    }
};

// User tilted up.
IMenuState.prototype.setSelectedToPrevious = function() {
    var index = (this.selectedIndex + 1) % this.current.length;
    this.setSelected(index);
};

// User tilted down.
IMenuState.prototype.setSelectedToNext = function() {
    var delta = this.current.length - 1; // Modular -1!
    var index = (this.selectedIndex + delta) % this.current.length;
    this.setSelected(index);
};

// User advanced into a submenu.
IMenuState.prototype.advanceIntoSelection = function() {
    this.setInputBlocked(true);
    this.gpad.consumeButtonEvent();
    // Fade out the currently selected root item.
    var text = this.current.t;
    if (text) {
        var tween = this.game.add.tween(text);
        tween.to({ alpha: 0 }, IMenuState.OPTION_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        this.tweens.push(tween);
    }
    // Pan the current menu over to become the new root.
    // All items fade except the selected one.
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        var alpha = selected ? IMenuState.ROOT_OPTION_ALPHA : 0;
        var x = this.x + (0.5 * this.perItemDelta);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        this.tweens.push(tween);
    }
    // Pan/fade in the new items, selecting the first one.
    // It'll be colored in once it lands.
    this.current = this.current.options[this.selectedIndex];
    this.selectedIndex = this.current.childIndex;
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        text.style.fill = this.color2.s;
        text.dirty = true;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        var x = this.x + (this.width / 2);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.scope = this;
            tween.onComplete.add(function(text, tween) {
                text.style.fill = tween.scope.color1.s;
                tween.scope.setInputBlocked(false);
                text.dirty = true;
            });
        }
        this.tweens.push(tween);
    }
};

// User backed out of a submenu.
IMenuState.prototype.retreatOutOfSelection = function() {
    this.setInputBlocked(true);
    this.gpad.consumeButtonEvent();
    // Pan/fade out/uncolor the current items.
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        text.style.fill = this.color2.s;
        text.dirty = true;
        var alpha = 0;
        var x = this.x + this.width - (0.5 * this.perItemDelta);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        this.tweens.push(tween);
    }
    // Fade back in the (soon to be) currently selected root item.
    this.current.childIndex = this.selectedIndex;
    this.selectedIndex = this.current.index;
    this.current = this.current.parent;
    var text = this.current.t;
    if (text) {
        var tween = this.game.add.tween(text);
        var delay = IMenuState.LEVEL_TRANSITION_TIME -
            IMenuState.OPTION_TRANSITION_TIME;
        tween.to({ alpha: IMenuState.ROOT_OPTION_ALPHA },
            IMenuState.OPTION_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true, delay);
        this.tweens.push(tween);
    }
    // Pan the current root back over to become the menu.
    // Non-selected items also fade back in.
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        var x = this.x + (this.width / 2);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.scope = this;
            tween.onComplete.add(function(text, tween) {
                tween.scope.setInputBlocked(false);
            });
        }
        this.tweens.push(tween);
    }
};

// If the user's defined cancel behavior, 
// invoke it.
IMenuState.prototype.selectCancel = function() {
    if (this.current.cancelOption && this.current.cancelOption.action) {
        this.current.cancelOption.action.call(
            this.context, this.current.cancelOption.text,
            this.current.cancelOption.index);
    } else if (this.current.parent) {
        this.gpad.consumeButtonEvent();
        this.retreatOutOfSelection();
    }
};

// User pressed okay; fire the currently selected thing!
IMenuState.prototype.selectCurrent = function(joystick) {
    var option = this.current.options[this.selectedIndex];
    if (option.length > 1) {
        this.gpad.consumeButtonEvent();
        this.advanceIntoSelection();
    } else if (option.action) {
        option.action.call(this.context,
            option.text, option.index);
    } else if (option.cancel && option.parent) {
        this.gpad.consumeButtonEvent();
        this.retreatOutOfSelection();
    }
};

// User is tilting; figure out towards what, 
// and do it!
IMenuState.prototype.updateFromJoystick = function(joystick) {
    if (joystick.tilt > IMenuState.TILT_CATCH) {
        var t = this.game.time.now;
        for (var i = 0; i < this.tilts.length; i++) {
            var tilt = this.tilts[i];
            var a = Utils.getBoundedAngleDifference(
                joystick.angle, tilt.angle);
            if (a < IMenuState.ANGLE_CATCH) {
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
                        IMenuState.TILT_HOLD_DELAY_FACTOR : 1;
                    tilt.time = t + factor * IMenuState.TILT_TIME;
                }
                return;
            }
        }
    }
    for (var i = 0; i < this.tilts.length; i++) {
        this.tilts[i].time = 0;
    }
};

// Figure out if the user's currently pressing a button 
// that we animate for.
IMenuState.prototype.updateSelector = function() {
    var cancelExists = this.current.parent != undefined ||
        this.current.cancelOption != undefined;
    var selectDown = this.gpad.justPressed(this.buttonMap.SELECT);
    var cancelDown = this.gpad.justPressed(this.buttonMap.CANCEL);
    var selectUp = this.gpad.justReleased(this.buttonMap.SELECT);
    var cancelUp = this.gpad.justReleased(this.buttonMap.CANCEL);
    if (selectDown || (cancelDown && cancelExists)) {
        this.activateSelector();
    } else if (selectUp || cancelUp) {
        this.deactivateSelector();
    }
};

// Close the menu and clean up.
IMenuState.prototype.cleanUp = function() {
    this.gpad.consumeButtonEvent();
    this.chrome.visible = false;
    this.selector.visible = false;
    this.root.cleanUp();
    for (var i = 0; i < this.tweens.length; i++) {
        this.tweens[i].stop();
    }
    if (this.blurBackground) {
        var tween = this.game.add.tween(this.myFilter);
        tween.scope = this;
        tween.to({ blur: 0 }, IMenuState.BLUR_TIME,
            Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(function(filter, tween) {
            tween.scope.spacer.destroy();
            tween.scope.game.state.getCurrentState().zAll.filters = null;
        });
    }
};

// Weed out any tweens that are no longer active.
IMenuState.prototype.cleanUpTweens = function() {
    var i = 0;
    while (i < this.tweens.length) {
        if (this.tweens[i].isRunning) {
            i += 1;
        } else {
            this.tweens.splice(i, 1);
        }
    }
};

// Handle an update while paused, if we have to.
IMenuState.prototype.pauseUpdate = function() {
    if (!this.updateDuringPause) {
        return;
    }
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
IMenuState.prototype.update = function() {
    this.cleanUpTweens();
    this.updateSelector();
    if (this.inputBlocked) {
        return;
    }
    var joystick = this.gpad.getAngleAndTilt();
    this.updateFromJoystick(joystick);
    if (this.gpad.justReleased(this.buttonMap.PAUSE) ||
        this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.selectCancel();
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.selectCurrent();
    }
};
