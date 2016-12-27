// Handle point addition to an existing path.
var AddFromPathIState = function(handler, level) {
    IState.call(this, AddFromPathIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

AddFromPathIState.NAME = 'addFromPath';
AddFromPathIState.prototype = Object.create(IState.prototype);
AddFromPathIState.prototype.constructor = AddFromPathIState;

// Constants.
AddFromPathIState.ADD_PATH_MARK_RADIUS = 5;
AddFromPathIState.ADD_PATH_SELECTED_MARK_RADIUS = 8;
AddFromPathIState.ADD_SNAP_DISTANCE = 15;

// Action for adding new points along paths.
AddFromPathIState.prototype.activated = function(prev) {
    this.tier = this.level.tier;
    this.path = this.avatar.path;
    this.marks = [];
    this.near = undefined;
    var view = this.game.camera.view;
    this.x = view.x;
    this.y = view.y;
    this.w = view.width;
    this.h = view.height;
    this.gpad.consumeButtonEvent(this.buttonMap.EDIT_ADD);
    // Initialize bitmap for rendering.
    this.bitmap = this.game.add.bitmapData(this.w, this.h);
    this.bitmap.context.fillStyle = this.level.tier.palette.c2.s;
    this.image = this.game.add.image(this.x, this.y, this.bitmap);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    this.cacheMarks();
    this.renderNeeded = true;

    var newName = this.tier.getNewPointName();
    var select = this.game.settings.buttonMap.buttonName(
        this.game.settings.buttonMap.SELECT);
    var cancel = this.game.settings.buttonMap.buttonName(
        this.game.settings.buttonMap.CANCEL);
    this.avatar.help.setText('add ' + newName + ' to ' +
        this.path.name + '\n  ' + select + ' to confirm\n  ' +
        cancel + ' to cancel');
};

// Translate a game coordinate point so that it can 
// be drawn onto our image.
AddFromPathIState.prototype.translateGamePointToImagePoint = function(x, y) {
    return { x: x + this.x, y: y + this.y };
};

// Translate an image coordinate point so that it maps 
// back to a point in the game world.
AddFromPathIState.prototype.translateGamePointToImagePoint = function(x, y) {
    return { x: x - this.x, y: y - this.y };
};

// Render the various path marks.
AddFromPathIState.prototype.cacheMarks = function() {
    // Figure out where to draw our marks.
    var xlen = this.path.p2.x - this.path.p1.x;
    var ylen = this.path.p2.y - this.path.p1.y;
    var dx = (xlen) ? Math.sign(xlen) * 50 : 0;
    var dy = (ylen) ? Math.sign(ylen) * 50 : 0;
    var max = Math.max(
        Math.floor((Math.abs(xlen) - 1) / 50),
        Math.floor((Math.abs(ylen) - 1) / 50));
    for (var i = 0; i < max; i++) {
        var x = this.path.p1.x + (dx * (1 + i));
        var y = this.path.p1.y + (dy * (1 + i));
        var gp = this.tier.translateInternalPointToGamePoint(
            x, y);
        this.marks.push(gp);
    }
};

// Render the various path marks.
AddFromPathIState.prototype.render = function() {
    if (!this.renderNeeded) {
        return;
    }
    this.bitmap.context.clearRect(0, 0, this.w, this.h);
    for (var i = 0; i < this.marks.length; i++) {
        this.bitmap.context.beginPath();
        var mark = this.marks[i];
        var selected = mark === this.near;
        var radius = (selected) ?
            AddFromPathIState.ADD_PATH_SELECTED_MARK_RADIUS :
            AddFromPathIState.ADD_PATH_MARK_RADIUS;
        var ip = this.translateGamePointToImagePoint(mark.x, mark.y);
        this.bitmap.context.arc(ip.x, ip.y, radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
    this.renderNeeded = false;
};

// Figure out if a mark is near the "cursor".
AddFromPathIState.prototype.getSelectedMark = function() {
    var near = undefined;
    var min = AddFromPathIState.ADD_SNAP_DISTANCE;
    for (var i = 0; i < this.marks.length; i++) {
        var mark = this.marks[i];
        var d = Utils.distanceBetweenPoints(mark.x, mark.y, this.avatar.x, this.avatar.y);
        if (d <= min) {
            near = mark;
            min = d;
        }
    }
    return near;
};

// Handle an update while holding the button.
AddFromPathIState.prototype.update = function() {
    // Move along rails.
    var joystick = this.gpad.getAngleAndTilt();
    this.avatar.move(joystick.angle, joystick.tilt);
    var mark = this.getSelectedMark();
    if (mark !== this.near) {
        this.near = mark;
        this.renderNeeded = true;
    }

    var done = false;
    if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        // Just finish; don't add any paths.
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.CANCEL);
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
        // New point, coming atcha!
        if (this.near) {
            var point = this.tier.addPointToPathAtCoords(
                this.path, this.near.x, this.near.y);
            this.avatar.path = undefined;
            this.avatar.point = point;
        }
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.EDIT_ADD);
    }
    if (done) {
        this.image.destroy();
        this.activate(GeneralEditIState.NAME);
    }
};








// Handle point + path addition to a starting point.
var AddFromPointIState = function(handler, level) {
    IState.call(this, AddFromPointIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

AddFromPointIState.NAME = 'addFromPoint';
AddFromPointIState.prototype = Object.create(IState.prototype);
AddFromPointIState.prototype.constructor = AddFromPointIState;

// No new constants; we use our partner add state's.

// Action for adding new points (and paths to them) from existing ones.
AddFromPointIState.prototype.activated = function(prev) {
    this.tier = this.level.tier;
    this.point = this.avatar.point;
    this.near = undefined;
    this.valid = false; // Only allow 45 degree angles.
    var view = this.game.camera.view;
    this.x = view.x - (view.width / 2);
    this.y = view.y - (view.height / 2);
    this.w = 2 * view.width;
    this.h = 2 * view.height;
    this.gpad.consumeButtonEvent(this.buttonMap.EDIT_ADD);
    // Initialize bitmap for rendering.
    this.bitmap = this.game.add.bitmapData(this.w, this.h);
    this.bitmap.context.lineWidth = Tier.PATH_WIDTH;
    this.bitmap.context.lineCap = 'round';
    this.image = this.game.add.image(this.x, this.y, this.bitmap);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    this.renderNeeded = false;


    var newPointName = this.tier.getNewPointName();
    var newPathName = this.tier.getNewPathName();
    var select = this.game.settings.buttonMap.buttonName(
        this.game.settings.buttonMap.SELECT);
    var cancel = this.game.settings.buttonMap.buttonName(
        this.game.settings.buttonMap.CANCEL);
    this.helptext = 'add ' + newPointName + ' to ' + this.point.name +
        '\n  ' + select + ' to confirm\n  ' + cancel + ' to cancel';
    this.avatar.help.setText(this.helptext);
};

// Translate a game coordinate point so that it can 
// be drawn onto our image.
AddFromPointIState.prototype.translateGamePointToImagePoint = function(x, y) {
    return { x: x + this.x, y: y + this.y };
};

// Translate an image coordinate point so that it maps 
// back to a point in the game world.
AddFromPointIState.prototype.translateGamePointToImagePoint = function(x, y) {
    return { x: x - this.x, y: y - this.y };
};

// Render the various point marks.
AddFromPointIState.prototype.render = function() {
    if (!this.renderNeeded) {
        return;
    }
    this.bitmap.context.clearRect(0, 0, this.w, this.h);
    if (this.near) {
        var ip = this.translateGamePointToImagePoint(
            this.near.x, this.near.y);
        if (this.valid) {
            this.bitmap.context.fillStyle = this.level.tier.palette.c2.s;
            this.bitmap.context.strokeStyle = this.level.tier.palette.c2.s;
        } else {
            this.bitmap.context.fillStyle = this.game.settings.colors.GREY.s;
            this.bitmap.context.strokeStyle = this.game.settings.colors.GREY.s;
        }
        this.bitmap.context.beginPath();
        var gp = this.tier.translateInternalPointToGamePoint(
            this.point.x, this.point.y);
        var ip2 = this.translateGamePointToImagePoint(gp.x, gp.y);
        this.bitmap.context.moveTo(ip2.x, ip2.y);
        this.bitmap.context.lineTo(ip.x, ip.y);
        this.bitmap.context.stroke();
        this.bitmap.context.beginPath();
        var radius = AddFromPathIState.ADD_PATH_SELECTED_MARK_RADIUS;
        this.bitmap.context.arc(ip.x, ip.y,
            radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
    this.renderNeeded = false;
};

// Figure out if a mark is near the "cursor".
AddFromPointIState.prototype.cacheSelectedMark = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    ip.x -= Tier.PADDING;
    ip.y -= Tier.PADDING;
    ip.x = Math.floor(ip.x + (25 * Math.sign(ip.x)));
    ip.y = Math.floor(ip.y + (25 * Math.sign(ip.y)));
    ip.x -= ip.x % 50;
    ip.y -= ip.y % 50;
    ip.x += Tier.PADDING;
    ip.y += Tier.PADDING;
    var old = this.near;
    if (ip.x == this.point.x && ip.y == this.point.y) {
        this.near = undefined;
        this.valid = false;
    } else {
        var gp = this.tier.translateInternalPointToGamePoint(
            ip.x, ip.y);
        var near = { x: gp.x, y: gp.y };
        if (!old || old.x != near.x || old.y != near.y) {
            this.near = near;
        }
        var dx = Math.abs(this.point.x - ip.x);
        var dy = Math.abs(this.point.y - ip.y);
        this.valid = dx == dy || dx == 0 || dy == 0;
    }
    if (old !== this.near) {
        this.renderNeeded = true;
    }
};

// Handle an update while holding the button.
AddFromPointIState.prototype.update = function() {
    // First, movement.
    var joystick = this.gpad.getAngleAndTilt();
    var angle = joystick.angle;
    var ratio = joystick.tilt;
    var speed = ratio * FloatIState.FLOAT_MAX_SPEED;
    this.avatar.body.velocity.x = speed * Math.sin(angle);
    this.avatar.body.velocity.y = speed * Math.cos(angle);
    // Next, find and render the candidate.
    this.cacheSelectedMark();

    var done = false;
    if (this.gpad.justReleased(this.buttonMap.CANCEL)) {
        this.gpad.consumeButtonEvent();
        // Just finish; don't add any paths.
        done = true;
    } else if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
        this.gpad.consumeButtonEvent();
        // New point, coming atcha!
        if (this.near && this.valid) {
            // Find out if a point already exists at these coordinates.
            var ip = this.tier.translateGamePointToInternalPoint(
                this.near.x, this.near.y);
            var existing = undefined;
            for (var i = 0; i < this.tier.points.length; i++) {
                var point = this.tier.points[i];
                if (point.x == ip.x && point.y == ip.y) {
                    existing = point;
                    break;
                }
            }
            // Make sure we're not overlapping earlier stuff.
            if (this.isOverlapping(existing)) {
                this.avatar.help.setText(
                    'failed to add (overlap)', true);
                this.avatar.help.setText(this.helptext);
                return;
            }
            if (existing) {
                this.tier.addPath(
                    this.tier.getNewPathName(),
                    this.point, existing);
                this.avatar.point = existing;
            } else {
                var point = this.tier.addPoint(
                    this.tier.getNewPointName(),
                    this.near.x, this.near.y, this.point);
                this.avatar.point = point;
            }
        }
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.EDIT_ADD);
    }
    if (done) {
        this.image.destroy();
        this.activate(GeneralEditIState.NAME);
    }
};

// Are any existing points already occupying spots that our new 
// path and/or point will want?
AddFromPointIState.prototype.isOverlapping = function(existing) {
    var x1 = this.avatar.point.gx;
    var y1 = this.avatar.point.gy;
    var x2 = this.near.x;
    var y2 = this.near.y;
    var coords = Path.coords(x1, y1, x2, y2);
    if (!existing) {
        coords.push(Point.coords(x2, y2));
    }
    for (var i = 0; i < coords.length; i++) {
        if (this.level.tier.coords[coords[i]]) {
            return true;
        }
    }
    return false;
};








// Handle point addition in the vast unknown.
var AddFromFloatIState = function(handler, level) {
    IState.call(this, AddFromFloatIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
    this.image = new EditCharge(this.game, 0, 0,
        this.level.tiers[0].palette, true);
    this.image.kill();
};

AddFromFloatIState.NAME = 'addFromFloat';
AddFromFloatIState.prototype = Object.create(IState.prototype);
AddFromFloatIState.prototype.constructor = AddFromFloatIState;

// Charge up a point add in the middle of nowhere.
AddFromFloatIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.tier = this.level.tier;
    // Find a mark is near the "cursor".
    var ap = { x: this.avatar.x, y: this.avatar.y };
    ap.x = Math.floor(ap.x + (25 * Math.sign(ap.x)));
    ap.y = Math.floor(ap.y + (25 * Math.sign(ap.y)));
    ap.x -= ap.x % 50;
    ap.y -= ap.y % 50;
    this.near = ap;
    this.image.revive();
    this.image.setColor(this.tier.palette);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    this.image.x = ap.x;
    this.image.y = ap.y;
    this.image.restart();

    this.chargeTime = this.game.time.now + EditCharge.TIME;
    this.newPoint = this.tier.getNewPointName();
    this.details = '(' + ap.x + ',' + ap.y + ')';
    this.avatar.help.setText('add point ' + this.newPoint +
        ' ' + this.details + '?' + '\nhold to confirm');
};

// We're adding a point!
AddFromFloatIState.prototype.update = function() {
    var charged = this.game.time.now > this.chargeTime;
    if (charged) {
        this.avatar.help.setText('add point ' + this.newPoint +
            ' ' + this.details + '?\nok');
    }
    if (this.gpad.justReleased(this.buttonMap.EDIT_ADD)) {
        this.gpad.consumeButtonEvent();
        var prev = FloatIState.NAME;
        if (charged) {
            // Make sure we're not overlapping earlier stuff.
            if (this.isOverlapping()) {
                this.avatar.help.setText(
                    'failed to add (overlap)', true);
            } else {
                var p = this.tier.addPoint(this.newPoint,
                    this.near.x, this.near.y);
                this.avatar.help.setText('added point ' + this.newPoint +
                    ' ' + this.details, true);
                this.avatar.x = p.gx;
                this.avatar.y = p.gy;
                this.avatar.body.velocity.x = 0;
                this.avatar.body.velocity.y = 0;
                this.avatar.point = p;
                this.avatar.path = undefined;
                prev = GeneralEditIState.NAME;
            }
        }
        this.image.kill();
        this.chargeTime = -1;
        this.activate(prev);
    }
};

// Does our point clobber any existing ones (or paths)?
AddFromFloatIState.prototype.isOverlapping = function() {
    var coords = Point.coords(this.near.x, this.near.y);
    return this.level.tier.coords[coords];
};
