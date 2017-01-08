// Classes to support the menu for typing text.
var AddTextNode = function(label, char) {
    this.label = label;
    this.char = char ? char : label;
    this.children = [];
    this.parent = undefined;
    this.root = this;
    this.onSelected = new Phaser.Signal();
    this.onTextChanged = new Phaser.Signal();
};

// Constants.
AddTextNode.BUTTON_R = 65;
AddTextNode.ORBIT_R = 215;
AddTextNode.SLIDE_SCALE = 0.9;
AddTextNode.SLIDE_TIME = 200; // ms
AddTextNode.NORMAL_ALPHA = 0.6;
AddTextNode.SELECTED_ALPHA = 1;
AddTextNode.PRESSED_ALPHA = 1;
AddTextNode.PRESSED_SCALE = 0.9;
AddTextNode.CATCH_RATIO = 1;


// Bitmap painting.
AddTextNode.painter = function(bitmap) {
    var r = AddTextNode.BUTTON_R;
    Utils.resizeBitmap(bitmap, 2 * r, 2 * r);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.arc(r, r, r, 0, 2 * Math.PI, false);
    c.fill();
};

// Add a child.
AddTextNode.prototype.add = function(label, char) {
    var node = new AddTextNode(label, char);
    node.parent = this;
    node.root = this.root;
    this.children.push(node);
    return node;
};

// Create graphic.
AddTextNode.prototype.createSprite = function(backboard) {
    this.backboard = backboard;
    this.game = backboard.game;
    this.base = this.game.add.sprite(0, 0);
    this.base.anchor.setTo(0.5);
    backboard.addChild(this.base);

    var bitmap = this.game.bitmapCache.get(
        AddTextNode.painter);
    this.sprite = this.game.add.sprite(0, 0, bitmap);
    this.sprite.anchor.setTo(0.5);
    this.base.addChild(this.sprite);
    this.sprite.alpha = AddTextNode.NORMAL_ALPHA;

    var font = this.game.settings.font;
    var style = {
        font: Math.floor(2 * font.size) + 'px ' + font.name,
        fill: this.game.settings.colors.WHITE.s
    };
    this.textfield = this.game.add.text(0, 0, this.label, style);
    this.textfield.anchor.setTo(0.5);
    this.base.addChild(this.textfield);
    this.base.visible = false;

    var n = this.children.length;
    this.arc = -2 * Math.PI / (n + 1);
    var start = Math.ceil(n / 4) * this.arc;
    if (n % 2 == 0) {
        start += this.arc / 2;
    }
    for (var i = 0; i < n; i++) {
        var c = this.children[i];
        c.angle = start + i * this.arc;
        c.createSprite(backboard);
    }
    this.catch = AddTextNode.CATCH_RATIO * Math.abs(this.arc / 2);
};

// Fan out around this as the center node.
AddTextNode.prototype.layOut = function() {
    this.root.hideAll();
    this.moveTo(0, 0);
    this.base.visible = true;

    var n = this.children.length;
    for (var i = 0; i < n; i++) {
        var c = this.children[i];
        var x2 = AddTextNode.ORBIT_R * Math.sin(c.angle);
        var y2 = AddTextNode.ORBIT_R * Math.cos(c.angle);
        var x1 = AddTextNode.SLIDE_SCALE * x2;
        var y1 = AddTextNode.SLIDE_SCALE * y2;
        c.base.x = x1;
        c.base.y = y1;
        c.moveTo(x2, y2, true);
        c.base.visible = true;
    }
};

// Fan out around this as the center node.
AddTextNode.prototype.hideAll = function() {
    this.base.visible = false;
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].hideAll();
    }
};

// Fan out around this as the center node.
AddTextNode.prototype.moveTo = function(x, y, animate) {
    if (animate) {
        if (this.tween) {
            this.tween.stop();
        }
        this.tween = this.game.add.tween(this.base);
        this.tween.to({ x: x, y: y }, AddTextNode.SLIDE_TIME,
            Phaser.Easing.Sinusoidal.Out, true);
    } else {
        this.base.x = x;
        this.base.y = y;
    }
};

// Color palette.
AddTextNode.prototype.setPalette = function(palette) {
    this.root.tint = palette.c2.i;
};

// Prepare to be displayed!
AddTextNode.prototype.show = function(palette) {
    if (this.parent) {
        return;
    }
    this.buf = '';
    this.backboard.visible = true;
    this.setPalette(palette);
    this.layOut();
};

// All done; clean up.
AddTextNode.prototype.hide = function() {
    this.backboard.visible = false;
};

// Test whether a child is near a given angle.
AddTextNode.prototype.isChildForAngle = function(child, angle) {
    var da = Utils.getBoundedAngleDifference(
        angle, child.angle);
    return da < this.catch;
};

// Highlight a child node based on an angle.
AddTextNode.prototype.setInputAngle = function(angle) {
    this.inputAngle = angle;
    this.highlightedChild = undefined;
    if (angle != undefined) {
        for (var i = 0; i < this.children.length; i++) {
            var c = this.children[i];
            if (this.isChildForAngle(c, angle)) {
                this.highlightedChild = c;
                break;
            }
        }
    }
};

// Set whether the user is pressing or releasing input.
// This acts on whatever child node is currently being 
// highlighted by the input angle.
// Returns whatever node is now the active center.
AddTextNode.prototype.setPressed = function(pressed) {
    if (pressed == this.pressed) {
        return this;
    }
    this.pressed = pressed;
    if (!pressed) {
        if (this.highlightedChild) {
            return this.highlightedChild.select();
        } else if (!this.inputAngle) {
            return this.cancel();
        }
    }
    return this;
};

// Set whether the user is pressing or releasing input.
// This acts on whatever child node is currently being 
// highlighted by the input angle.
AddTextNode.prototype.update = function() {
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        var highlighted = c === this.highlightedChild;
        this.updateNode(c, highlighted, this.pressed);
    }
    var highlighted = !this.inputAngle && !this.highlightedChild;
    this.updateNode(this, highlighted, this.pressed);
};

// Set whether the user is pressing or releasing input.
// This acts on whatever child node is currently being 
// highlighted by the input angle.
AddTextNode.prototype.updateNode = function(c,
    highlighted, pressed) {
    if (highlighted) {
        c.sprite.tint = this.root.tint;
        c.textfield.tint = this.game.settings.colors.WHITE.i;
        if (pressed) {
            c.sprite.alpha = AddTextNode.PRESSED_ALPHA;
            c.base.scale.setTo(AddTextNode.PRESSED_SCALE);
        } else {
            c.sprite.alpha = AddTextNode.SELECTED_ALPHA;
            c.base.scale.setTo(1);
        }
    } else {
        c.sprite.tint = this.game.settings.colors.WHITE.i;
        c.textfield.tint = this.root.tint;
        c.sprite.alpha = AddTextNode.NORMAL_ALPHA;
        c.base.scale.setTo(1);
    }
};

// Called when we're clicked on.
// Returns whatever node has become the new center.
AddTextNode.prototype.select = function() {
    if (this.parent && this.base.x == 0 && this.base.y == 0) {
        return this.cancel();
    } else if (this.children.length) {
        this.layOut();
        return this;
    } else {
        if (this.onSelected.getNumListeners()) {
            this.onSelected.dispatch(this);
        } else {
            this.defaultSelect();
        }
        this.root.layOut();
        return this.root;
    }
};

// By default, we just add our character to the root.
AddTextNode.prototype.defaultSelect = function() {
    if (this.parent) {
        this.root.addToBuffer(this.char);
    }
};

// Attempts to return to our parent.
AddTextNode.prototype.cancel = function() {
    if (this.parent) {
        this.parent.layOut();
        return this.parent;
    }
    return this;
};

// By default, we just add our character to the root.
AddTextNode.prototype.addToBuffer = function(char) {
    if (!this.buf) {
        this.buf = '';
    }
    if (char == '\b') {
        this.buf = this.buf.substring(0, this.buf.length - 1);
    } else {
        this.buf += char;
    }
    this.onTextChanged.dispatch(this);
};

// Update our case.
AddTextNode.prototype.setUppercase = function(uppercase) {
    this.label = uppercase ? this.label.toUpperCase() :
        this.label.toLowerCase();
    this.char = uppercase ? this.char.toUpperCase() :
        this.char.toLowerCase();
    if (this.textfield) {
        this.textfield.setText(this.label);
    }
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setUppercase(uppercase);
    }
};









// Factory method to build a tree of nodes.
// Found lots of useful arrow symbols here: 
// http://character-code.com/arrows-html-codes.php
AddTextNode.create = function(game) {
    var root = new AddTextNode('✓');

    var abcde = root.add('A-E');
    var fghij = root.add('F-J');
    var klmno = root.add('K-O');
    var pqrst = root.add('P-T');
    var uvwxyz = root.add('U-Z');
    var punctuation = root.add('…');
    var changecase = root.add('⇕');
    var backspace = root.add('↶', '\b');

    var lettera = abcde.add('A');
    var letterb = abcde.add('B');
    var letterc = abcde.add('C');
    var letterd = abcde.add('D');
    var lettere = abcde.add('E');

    var letterf = fghij.add('F');
    var letterg = fghij.add('G');
    var letterh = fghij.add('H');
    var letteri = fghij.add('I');
    var letterj = fghij.add('J');

    var letterk = klmno.add('K');
    var letterl = klmno.add('L');
    var letterm = klmno.add('M');
    var lettern = klmno.add('N');
    var lettero = klmno.add('O');

    var letterp = pqrst.add('P');
    var letterq = pqrst.add('Q');
    var letterr = pqrst.add('R');
    var letters = pqrst.add('S');
    var lettert = pqrst.add('T');

    var letteru = uvwxyz.add('U');
    var letterv = uvwxyz.add('V');
    var letterw = uvwxyz.add('W');
    var letterx = uvwxyz.add('X');
    var lettery = uvwxyz.add('Y');
    var letterz = uvwxyz.add('Z');

    var comma = punctuation.add('_', ' ');
    var comma = punctuation.add(',');
    var period = punctuation.add('.');
    var question = punctuation.add('?');
    var exclamation = punctuation.add('!');
    var exclamation = punctuation.add('\'');
    var exclamation = punctuation.add('"');
    var newline = punctuation.add('↩', '\n');

    var uppercase = changecase.add('⇧');
    uppercase.onSelected.add(function(node) {
        node.root.setUppercase(true);
    });
    var lowercase = changecase.add('⇩');
    lowercase.onSelected.add(function(node) {
        node.root.setUppercase(false);
    });

    // Create a fixed, centered sprite to attach to.
    var backboard = game.add.sprite(0, 0);
    backboard.anchor.setTo(0.5);
    game.state.getCurrentState().z.fg.add(backboard);
    backboard.visible = false;

    backboard.fixedToCamera = true;
    backboard.updateSize = function() {
        if (this.game == null) {
            game.scale.onSizeChange.remove(this.updateSize, this);
            game.scale.onFullScreenChange.remove(this.updateSize, this);
            return;
        }
        var w = this.game.width / 2;
        var h = this.game.height / 2;
        this.cameraOffset.setTo(w, h);
    };
    backboard.updateSize();
    game.scale.onSizeChange.add(backboard.updateSize, backboard);
    game.scale.onFullScreenChange.add(backboard.updateSize, backboard);

    root.createSprite(backboard);
    return root;
};
