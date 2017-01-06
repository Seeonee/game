// A reusable, customizable menu.
var IMenuState = function(name, handler, context) {
    IState.call(this, name, handler);
    this.root = new IMenuOption(this, name);
    this.current = undefined;
    this.tilts = [
        { angle: 0, action: this.setSelectedToPrevious },
        { angle: Math.PI, action: this.setSelectedToNext },
        { angle: Math.PI / 2, action: this.advanceIntoSelection },
        { angle: 3 * Math.PI / 2, action: this.retreatOutOfSelection }
    ];
    this.z = this.game.state.getCurrentState().z;
    this.tweens = [];
    this.texts = [];
    this.created = false;

    this.context = context ? context : this; // For called actions.
    this.initialIndex = 0;
    this.initialDelta = 0;
    this.perItemDelta = IMenuState.TEXT_Y_DELTA;
    this.style = IMenuState.STYLE.BAR_LEFT;
    this.colorPrimary = this.game.settings.colors.MENU_PRIMARY;
    this.colorSelection = this.game.settings.colors.MENU_SELECTION;
    this.color = this.colorPrimary;
    this.dropCloth = true;
    this.blurBackground = true;
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
IMenuState.UNSELECTED_OPTION_ALPHA = 1; // 0.25;
IMenuState.CHROME_ALPHA = 1;
IMenuState.OPTION_TRANSITION_TIME = 100; // ms
IMenuState.LEVEL_TRANSITION_TIME = 300; // ms
IMenuState.DISABLED_OPTION_ALPHA = 0.25;


// *************************
// Menu item, with possible nested subitems.
// Each action will be passed its option when called,
// as well as any bonus arguments.
// If an option is set as a cancel option, it'll be 
// the option called if the cancel button is pressed.
var IMenuOption = function(menu, text, cancel, action, args) {
    this.menu = menu;
    this.text = text;
    this.cancel = cancel;
    this.action = action;
    this.args = args ? args : [];
    this.cancelOption = undefined;
    this.parent = undefined;
    this.options = [];
    this.length = 0;
    this.index = 0;
    this.childIndex = 0;
    this.t = undefined;
    this.enabled = true;
    this.events = {}; // Others can add these.
};

// Menu item, with possible nested subitems.
// Each action will be passed its option when called,
// as well as any bonus arguments.
IMenuOption.prototype.add = function(text, action) {
    var args = Array.prototype.slice.call(arguments, 2);
    return this._add(text, false, action, args);
};

// Menu item, with possible nested subitems.
// This item will also be the one called if the cancel 
// button is pressed.
// Each action will be passed its option when called,
// as well as any bonus arguments.
IMenuOption.prototype.addCancel = function(text, action) {
    var args = Array.prototype.slice.call(arguments, 2);
    return this._add(text, true, action, args);
};

// Menu item, with possible nested subitems.
// Each action will be passed its option when called.
IMenuOption.prototype._add = function(text, cancel, action, args) {
    var option = new IMenuOption(this.menu, text, cancel, action, args);
    option.parent = this;
    option.index = this.length;
    this.options.push(option);
    this.length += 1;
    if (cancel) {
        this.cancelOption = option;
    }
    return option;
};

// Fire our action.
IMenuOption.prototype.activate = function(context) {
    var args = [this].concat(this.args);
    this.action.apply(context, args);
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


// Defines a menu option that'll invoke an associated action.
// Returns it, so that subactions can be added to it 
// via .add() or .addCancel().
// Each action will be passed its option when called,
// as well as any bonus arguments.
IMenuState.prototype.add = function(text, action) {
    var args = Array.prototype.slice.call(arguments, 2);
    return this.root._add(text, false, action, args);
};

// Defines a menu option that'll invoke an associated action.
// This option will also be the one called if the cancel 
// button is pressed.
// Returns it, so that subactions can be added to it 
// via .add() or .addCancel().
// Each action will be passed its option when called,
// as well as any bonus arguments.
IMenuState.prototype.addCancel = function(text, action) {
    var args = Array.prototype.slice.call(arguments, 2);
    return this.root._add(text, true, action, args);
};

// Called when the game is first paused.
IMenuState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.bdownlist = this.gpad.getButtonDownList();
    this.current = this.root;
    this.selectedIndex = 0;

    var view = this.game.camera.view;
    this.x = view.x;
    this.y = view.y;
    this.width = view.width;
    this.height = view.height;

    if (!this.created) {
        this.createMenu();
    } else {
        this.updateMenu();
    }
    this.show();
};

// Create EVERYTHING.
IMenuState.prototype.createMenu = function() {
    this.fullscreen = this.game.settings.fullscreen;
    this.colorPrimary = this.color;
    this.cBitmap = this.createChromeBitmap();
    this.drawChromeBitmap();
    this.chrome = this.createChrome(this.cBitmap);
    if (this.blurBackground) {
        this.spacer = this.createSpacer();
    }
    this.sBitmap = this.createSelectorBitmap();
    this.selector = this.createSelector(this.sBitmap);
    this.createTextFor(this.root);
    if (this.blurBackground) {
        this.myFilter = this.createFilter();
    }
    this.created = true;
};

// A more modest update.
IMenuState.prototype.updateMenu = function() {
    if (this.colorPrimary != this.color) {
        // Have to rebuild our chrome, and 
        // recolor our text components.
        this.colorPrimary = this.color;
        this.drawChromeBitmap();
    }
    if (this.blurBackground) {
        this.spacer = this.createSpacer();
    }
};

// Creates the menu chrome, and if asked also draws
// the blackout cloth that covers the stage.
IMenuState.prototype.createChromeBitmap = function() {
    return this.game.add.bitmapData(this.width, this.height);
};

// Creates the menu chrome, and if asked also draws
// the blackout cloth that covers the stage.
IMenuState.prototype.createChrome = function(bitmap) {
    var chrome = this.game.add.image(this.x, this.y, bitmap);
    this.z.menu.add(chrome);
    return chrome;
};

// Creates the menu chrome, and if asked also draws
// the blackout cloth that covers the stage.
IMenuState.prototype.drawChromeBitmap = function() {
    this.cBitmap.context.clearRect(0, 0, this.width, this.height);
    if (this.dropCloth) {
        this.cBitmap.context.fillStyle =
            this.game.settings.colors.BLACK.rgba(0.5);
        this.cBitmap.context.fillRect(0, 0, this.width, this.height);
    }
    if (this.style == IMenuState.STYLE.DIVIDED) {
        this.cBitmap.context.strokeStyle = this.colorPrimary.s;
        this.cBitmap.context.lineWidth = 1;
        this.cBitmap.context.beginPath();
        this.cBitmap.context.moveTo(
            this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2), 0);
        this.cBitmap.context.lineTo(
            this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2),
            this.height);
        this.cBitmap.context.stroke();
    } else {
        this.cBitmap.context.beginPath();
        this.cBitmap.context.fillStyle = this.colorPrimary.rgba(
            IMenuState.CHROME_ALPHA);
        var h = 2 * IMenuState.TEXT_Y_DELTA / 2;
        var w = this.width / 2 - (IMenuState.TEXT_Y_DELTA / 2);
        if (this.style == IMenuState.STYLE.BAR_LEFT) {
            this.cBitmap.context.fillRect(
                0, (this.height / 2) - (h / 2), w, h);
        } else if (this.style == IMenuState.STYLE.BAR_RIGHT) {
            this.cBitmap.context.fillRect(
                w, (this.height / 2) - (h / 2), this.width - w, h);
        }
    }
    this.cBitmap.dirty = true;
};

// Create the camera view spacer that makes the blur work properly.
IMenuState.prototype.createSpacer = function() {
    var bitmap = this.game.add.bitmapData(this.width, this.height);
    var spacer = this.game.add.image(this.x, this.y, bitmap);
    this.z.add(spacer);
    return spacer;
};

// Create the selector's bitmap data.
IMenuState.prototype.createSelectorBitmap = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    var bitmap = this.game.add.bitmapData(d, d);
    bitmap.context.fillStyle = this.colorSelection.s;
    bitmap.context.strokeStyle = this.colorSelection.s;
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
    selector.rotation = 0;
    var tween = this.game.add.tween(selector)
    tween.to({ rotation: Math.PI / 2 },
        IMenuState.SELECTOR_QUARTER_TURN_TIME,
        Phaser.Easing.Linear.None, true, 0,
        Number.POSITIVE_INFINITY, false);
    return tween;
};

// Recursively create an option's text elements.
IMenuState.prototype.createTextFor = function(option, level, index) {
    level = level == undefined ? -1 : level;
    index = index == undefined ? 0 : index;
    var x = this.x + (this.width / 2);
    if (level > 0) {
        x += this.width / 2 - (0.5 * this.perItemDelta);
    } else if (level < 0) {
        x -= this.width / 2 - (0.5 * this.perItemDelta);
    }
    var y = this.y + (this.height / 2) + this.initialDelta +
        (this.perItemDelta * index);
    var text = option.text;
    if (level >= 0 && text && option.length) {
        text += ' ▸';
    }
    option.t = this.createText(text, x, y);
    if (level > 0) {
        option.t.alpha = 0;
    }
    for (var i = 0; i < option.length; i++) {
        this.createTextFor(option.options[i], level + 1, i);
    }
};

// Create one of our menu text options.
IMenuState.prototype.createText = function(text, x, y) {
    var font = this.game.settings.font;
    var style = {
        font: font.sizePx + ' ' + font.name,
        fill: this.colorPrimary.s
    };
    var textObj = game.add.text(x, y, text, style);
    textObj.alpha = IMenuState.UNSELECTED_OPTION_ALPHA;
    textObj.anchor.setTo(0, 0.5);
    this.z.menu.add(textObj);
    return textObj;
};

// Recursively position text elements to their starting points.
IMenuState.prototype.positionTextFor = function(option, level, index) {
    level = level == undefined ? -1 : level;
    index = index == undefined ? 0 : index;
    var x = this.x + (this.width / 2);
    if (level < 0) {
        x -= this.width / 2 - (0.5 * this.perItemDelta);
    } else if (level > 0) {
        x += this.width / 2 - (0.5 * this.perItemDelta);
    }
    var y = this.y + (this.height / 2) + this.initialDelta +
        (this.perItemDelta * index);
    option.t.x = x;
    option.t.y = y;
    option.t.visible = true;
    if (level < 0) {
        option.t.style.fill = this.colorSelection.s;
    } else if (level == 0 && index == this.selectedIndex) {
        option.t.style.fill = this.colorSelection.s;
    } else {
        option.t.style.fill = this.colorPrimary.s;
    }
    option.t.dirty = true;
    if (level < 0) {
        option.t.alpha = 1;
    } else if (level == 0) {
        if (index == this.selectedIndex) {
            option.t.alpha = 1;
        } else {
            option.t.alpha = IMenuState.UNSELECTED_OPTION_ALPHA;
        }
        if (!option.enabled) {
            option.t.alpha = IMenuState.DISABLED_OPTION_ALPHA;
        }
    } else {
        option.t.alpha = 0;
    }
    for (var i = 0; i < option.length; i++) {
        this.positionTextFor(option.options[i], level + 1, i);
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

// Clean up the menu so it can be rebuilt.
IMenuState.prototype.recreateMenu = function() {
    if (!this.created) {
        // Don't bother; it'll happen soon enough.
        return;
    }
    // Delete chrome.
    this.chrome.destroy();
    // Delete spacer and undo blur if they exist.
    if (this.spacer) {
        this.spacer.destroy();
        this.game.state.getCurrentState().z.filters = null;
    }
    // Delete selector.
    this.selector.destroy();
    // Delete all text recursively.
    this.deleteTextFor(this.root);
    // Rebuild the menu.
    this.created = false;
    this.activated();
};

// Recursively delete text.
IMenuState.prototype.deleteTextFor = function(option) {
    if (option.t) {
        option.t.destroy();
        option.t = undefined;
    }
    for (var i = 0; i < option.options.length; i++) {
        this.deleteTextFor(option.options[i]);
    }
};

// Redraw our selector when the button's lifted.
IMenuState.prototype.deactivateSelector = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    this.sBitmap.context.clearRect(0, 0, d, d);
    this.sBitmap.context.strokeRect(w / 2, w / 2,
        d - w, d - w);
    this.sBitmap.dirty = true;
};

// Redraw our selector when the button's depressed.
IMenuState.prototype.activateSelector = function() {
    var d = IMenuState.SELECTOR_SIDE;
    var w = IMenuState.SELECTOR_THICKNESS;
    this.sBitmap.context.clearRect(0, 0, d, d);
    this.sBitmap.context.fillRect(w, w, d - (2 * w), d - (2 * w));
    this.sBitmap.dirty = true;
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
        this.z.filters = [this.myFilter];
        this.tweens.push(this.createFilterTween(this.myFilter));
    }

    this.deactivateSelector();
    // this.setSelected(this.initialIndex);
};


// Input gathering.
IMenuState.prototype.justPressed = function(buttonCode) {
    return this.gpad.justPressed(buttonCode);
};

// Input gathering.
IMenuState.prototype.justReleased = function(buttonCode) {
    var result = this.gpad.justReleased(buttonCode);
    if (result && this.bdownlist[buttonCode]) {
        this.gpad.clearButtonDown(buttonCode);
        this.bdownlist.splice(buttonCode, 1);
        result = false;
    }
    return result;
};

// Update which item in the current list is selected.
IMenuState.prototype.setSelected = function(index) {
    if (this.selectedIndex == index) {
        return;
    }
    this.setInputBlocked(true);
    this.selectedIndex = index;
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        text.style.fill = this.colorPrimary.s;
        text.dirty = true;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        if (!this.current.options[i].enabled) {
            alpha = IMenuState.DISABLED_OPTION_ALPHA;
        }
        var y = this.y + (this.height / 2) +
            this.initialDelta + (this.perItemDelta * (i - index));
        var tween = this.game.add.tween(text);
        tween.to({ y: y, alpha: alpha }, IMenuState.OPTION_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.onComplete.add(function(text, tween) {
                text.style.fill = this.colorSelection.s;
                this.setInputBlocked(false);
                text.dirty = true;
            }, this);
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
    // Make sure we have children to dive into.
    if (!this.current.options[this.selectedIndex].length) {
        return;
    }
    this.setInputBlocked(true);
    this.gpad.consumeButtonEvent();
    // Fade out the currently selected root item.
    var text = this.current.t;
    if (text) {
        var tween = this.game.add.tween(text);
        tween.to({ alpha: 0 }, IMenuState.LEVEL_TRANSITION_TIME,
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
        text.style.fill = this.colorPrimary.s;
        text.dirty = true;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        if (!this.current.options[i].enabled) {
            alpha = IMenuState.DISABLED_OPTION_ALPHA;
        }
        var x = this.x + (this.width / 2);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.onComplete.add(function(text, tween) {
                text.style.fill = this.colorSelection.s;
                this.setInputBlocked(false);
                text.dirty = true;
            }, this);
        }
        this.tweens.push(tween);
    }
};

// User backed out of a submenu.
IMenuState.prototype.retreatOutOfSelection = function() {
    // Make sure we have a parent to back out to.
    if (!this.current.parent) {
        return;
    }
    this.setInputBlocked(true);
    this.gpad.consumeButtonEvent();
    // Pan/fade out/uncolor the current items.
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        text.style.fill = this.colorPrimary.s;
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
        tween.to({ alpha: IMenuState.ROOT_OPTION_ALPHA },
            IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        this.tweens.push(tween);
    }
    // Pan the current root back over to become the menu.
    // Non-selected items also fade back in.
    for (var i = 0; i < this.current.length; i++) {
        var text = this.current.options[i].t;
        var selected = i == this.selectedIndex;
        var alpha = selected ? 1 : IMenuState.UNSELECTED_OPTION_ALPHA;
        if (!this.current.options[i].enabled) {
            alpha = IMenuState.DISABLED_OPTION_ALPHA;
        }
        var x = this.x + (this.width / 2);
        var tween = this.game.add.tween(text);
        tween.to({ x: x, alpha: alpha }, IMenuState.LEVEL_TRANSITION_TIME,
            Phaser.Easing.Sinusoidal.InOut, true);
        if (selected) {
            tween.onComplete.add(function(text, tween) {
                this.setInputBlocked(false);
            }, this);
        }
        this.tweens.push(tween);
    }
};

// If the user's defined cancel behavior, 
// invoke it.
IMenuState.prototype.selectCancel = function() {
    var cancel = this.current.cancelOption;
    if (cancel && cancel.action) {
        cancel.activate(this.context);
    } else if (this.current.parent) {
        this.gpad.consumeButtonEvent();
        this.retreatOutOfSelection();
    }
};

// If the user's defined top-level cancel behavior, 
// invoke it.
IMenuState.prototype.selectClose = function() {
    var close = this.root.cancelOption;
    if (close && close.action) {
        close.activate(this.context);
    }
};

// User pressed okay; fire the currently selected thing!
IMenuState.prototype.selectCurrent = function(joystick) {
    this.gpad.consumeButtonEvent();
    var option = this.current.options[this.selectedIndex];
    if (!option.enabled) {
        return;
    } else if (option.length > 0) {
        this.advanceIntoSelection();
    } else if (option.action) {
        option.activate(this.context);
    } else if (option.cancel && option.parent) {
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

// Propagate any settings changes.
IMenuState.prototype.updateSettings = function(settings) {
    IState.prototype.updateSettings.call(this, settings);
    if (settings.fullscreen != this.fullscreen) {
        this.recreateNeeded = true;
    }
};

// Figure out if the user's currently pressing a button 
// that we animate for.
IMenuState.prototype.updateSelector = function() {
    var cancelExists = this.current.parent != undefined ||
        this.current.cancelOption != undefined;
    var closeExists = this.root.cancelOption != undefined;
    var selectDown = this.justPressed(this.buttonMap.SELECT);
    var cancelDown = this.justPressed(this.buttonMap.CANCEL);
    var closeDown = this.justPressed(this.buttonMap.START);
    var selectUp = this.justReleased(this.buttonMap.SELECT);
    var cancelUp = this.justReleased(this.buttonMap.CANCEL);
    var closeUp = this.justReleased(this.buttonMap.START);
    if (selectDown || (cancelDown && cancelExists) ||
        (closeDown && closeExists)) {
        this.activateSelector();
    } else if (selectUp || cancelUp || closeUp) {
        this.deactivateSelector();
    }
};

// Close the menu and clean up. Just an alias for cleanUp().
IMenuState.prototype.close = function() {
    this.cleanUp();
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
        tween.to({ blur: 0 }, IMenuState.BLUR_TIME,
            Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(function(filter, tween) {
            this.spacer.destroy();
            this.game.state.getCurrentState().z.filters = null;
        }, this);
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
    if (this.sBitmap.dirty) {
        this.sBitmap.render();
    }
    if (this.cBitmap.dirty) {
        this.cBitmap.render();
    }
    this.update();
};

// Handle an update.
IMenuState.prototype.update = function() {
    this.cleanUpTweens();
    this.updateSelector();
    if (this.recreateNeeded) {
        this.recreateNeeded = false;
        this.recreateMenu();
    }
    if (this.inputBlocked) {
        return;
    }
    var joystick = this.gpad.getAngleAndTilt();
    this.updateFromJoystick(joystick);
    if (this.justReleased(this.buttonMap.START)) {
        this.selectClose();
    } else if (this.justReleased(this.buttonMap.CANCEL)) {
        this.selectCancel();
    } else if (this.justReleased(this.buttonMap.SELECT)) {
        this.selectCurrent();
    }
};
