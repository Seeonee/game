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
    this.gpad.consumeButtonEvent(this.buttonMap.ADD_BUTTON);
    // Initialize bitmap for rendering.
    this.bitmap = this.game.add.bitmapData(
        this.game.width, this.game.height);
    this.bitmap.context.fillStyle = this.game.settings.colors.RED.s;
    this.image = this.game.add.image(0, 0, this.bitmap);
    this.game.state.getCurrentState().z.mg.add(this.image);
    this.cacheMarks();
    this.renderMarks();
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
AddFromPathIState.prototype.renderMarks = function() {
    this.bitmap.context.clearRect(0, 0,
        this.game.width, this.game.height);
    for (var i = 0; i < this.marks.length; i++) {
        this.bitmap.context.beginPath();
        var mark = this.marks[i];
        var selected = mark === this.near;
        var radius = (selected) ?
            AddFromPathIState.ADD_PATH_SELECTED_MARK_RADIUS :
            AddFromPathIState.ADD_PATH_MARK_RADIUS;
        this.bitmap.context.arc(mark.x, mark.y, radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
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
        this.renderMarks();
    }

    var done = false;
    if (this.gpad.justReleased(this.buttonMap.ADD_CANCEL_BUTTON)) {
        // Just finish; don't add any paths.
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.ADD_CANCEL_BUTTON);
    } else if (this.gpad.justReleased(this.buttonMap.ADD_BUTTON)) {
        // New point, coming atcha!
        if (this.near) {
            var ip = this.tier.translateGamePointToInternalPoint(
                this.near.x, this.near.y);
            var point = this.tier.addPointToPathAtCoords(
                this.path, ip.x, ip.y);
            this.avatar.path = undefined;
            this.avatar.point = point;
        }
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.ADD_BUTTON);
    }
    if (done) {
        this.image.destroy();
        this.activate(DefaultLevelIState.NAME);
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
    this.gpad.consumeButtonEvent(this.buttonMap.ADD_BUTTON);
    // Initialize bitmap for rendering.
    this.bitmap = this.game.add.bitmapData(
        this.game.width, this.game.height);
    this.bitmap.context.lineWidth = Tier.PATH_WIDTH;
    this.bitmap.context.lineCap = 'round';
    this.image = this.game.add.image(0, 0, this.bitmap);
    this.game.state.getCurrentState().z.mg.add(this.image);
    // Side effect of the JSON load. We need to shift slightly.
    this.offset = this.tier.points[0].x % 50;
};

// Render the various point marks.
AddFromPointIState.prototype.renderMarks = function() {
    this.bitmap.context.clearRect(0, 0,
        this.game.width, this.game.height);
    if (this.near) {
        if (this.valid) {
            this.bitmap.context.fillStyle = this.game.settings.colors.RED.s;
            this.bitmap.context.strokeStyle = this.game.settings.colors.RED.s;
        } else {
            this.bitmap.context.fillStyle = this.game.settings.colors.GREY.s;
            this.bitmap.context.strokeStyle = this.game.settings.colors.GREY.s;
        }
        this.bitmap.context.beginPath();
        var gp = this.tier.translateInternalPointToGamePoint(
            this.point.x, this.point.y);
        this.bitmap.context.moveTo(gp.x, gp.y);
        this.bitmap.context.lineTo(this.near.x, this.near.y);
        this.bitmap.context.stroke();
        this.bitmap.context.beginPath();
        var radius = AddFromPathIState.ADD_PATH_SELECTED_MARK_RADIUS;
        this.bitmap.context.arc(this.near.x, this.near.y,
            radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
};

// Figure out if a mark is near the "cursor".
AddFromPointIState.prototype.cacheSelectedMark = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    ip.x -= this.offset;
    ip.y -= this.offset;
    ip.x = Math.floor(ip.x + (25 * Math.sign(ip.x)));
    ip.y = Math.floor(ip.y + (25 * Math.sign(ip.y)));
    ip.x -= ip.x % 50;
    ip.y -= ip.y % 50;
    ip.x += this.offset;
    ip.y += this.offset;
    if (ip.x == this.point.x && ip.y == this.point.y) {
        this.near = undefined;
        this.valid = false;
    } else {
        var gp = this.tier.translateInternalPointToGamePoint(
            ip.x, ip.y);
        this.near = { x: gp.x, y: gp.y };
        var dx = Math.abs(this.point.x - ip.x);
        var dy = Math.abs(this.point.y - ip.y);
        this.valid = dx == dy || dx == 0 || dy == 0;
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
    this.renderMarks();

    var done = false;
    if (this.gpad.justReleased(this.buttonMap.ADD_CANCEL_BUTTON)) {
        // Just finish; don't add any paths.
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.ADD_CANCEL_BUTTON);
    } else if (this.gpad.justReleased(this.buttonMap.ADD_BUTTON)) {
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
            if (existing) {
                this.tier.addPath(
                    this.tier.getNewPathName(),
                    this.point, existing);
                this.avatar.point = existing;
            } else {

                var point = this.tier.addPoint(
                    this.tier.getNewPointName(),
                    ip.x, ip.y, this.point);
                this.avatar.point = point;
            }
        }
        done = true;
        this.gpad.consumeButtonEvent(this.buttonMap.ADD_BUTTON);
    }
    if (done) {
        this.image.destroy();
        this.activate(DefaultLevelIState.NAME);
    }
};
