// Action for adding new points along paths.
var AddFromPathAction = function(editor) {
    this.editor = editor;
    this.path = this.editor.path;
    this.marks = [];
    this.near = undefined;
    this.editor.consumeButtonEvent(EditorAvatar.ADD_BUTTON);
    // Initialize bitmap for rendering.
    this.bitmap = this.editor.game.add.bitmapData(
        this.editor.game.width, this.editor.game.height);
    this.bitmap.context.fillStyle = '#D92C57';
    this.image = this.editor.game.add.image(0, 0, this.bitmap);
    this.cacheMarks();
    this.renderMarks();
};

// Render the various path marks.
AddFromPathAction.prototype.cacheMarks = function() {
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
        this.marks.push({ x: x, y: y });
    }
};
// Render the various path marks.
AddFromPathAction.prototype.renderMarks = function() {
    this.bitmap.context.clearRect(0, 0,
        this.editor.game.width, this.editor.game.height);
    for (var i = 0; i < this.marks.length; i++) {
        this.bitmap.context.beginPath();
        var mark = this.marks[i];
        var selected = mark === this.near;
        var radius = (selected) ?
            EditorAvatar.ADD_PATH_SELECTED_MARK_RADIUS :
            EditorAvatar.ADD_PATH_MARK_RADIUS;
        this.bitmap.context.arc(mark.x, mark.y, radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
};

// Move along rails.
AddFromPathAction.prototype.move = function(angle, ratio) {
    Avatar.prototype.move.call(this.editor, angle, ratio);
    var mark = this.getSelectedMark();
    if (mark !== this.near) {
        this.near = mark;
        this.renderMarks();
    }
};

// Figure out if a mark is near the "cursor".
AddFromPathAction.prototype.getSelectedMark = function() {
    var near = undefined;
    var min = EditorAvatar.ADD_SNAP_DISTANCE;
    for (var i = 0; i < this.marks.length; i++) {
        var mark = this.marks[i];
        var d = distanceBetweenPoints(mark.x, mark.y, this.editor.x, this.editor.y);
        if (d <= min) {
            near = mark;
            min = d;
        }
    }
    return near;
};

// Handle an update while holding the button.
AddFromPathAction.prototype.update = function() {
    var done = false;
    if (this.editor.justReleased(EditorAvatar.ADD_CANCEL_BUTTON)) {
        // Just finish; don't add any paths.
        done = true;
        this.editor.consumeButtonEvent(EditorAvatar.ADD_CANCEL_BUTTON);
    } else if (this.editor.justReleased(EditorAvatar.ADD_BUTTON)) {
        // New point, coming atcha!
        if (this.near) {
            var point = this.editor.paths.addPointToPathAtCoords(this.path,
                this.near.x, this.near.y);
            this.editor.path = undefined;
            this.editor.point = point;
        }
        done = true;
        this.editor.consumeButtonEvent(EditorAvatar.ADD_BUTTON);
    }
    if (done) {
        this.image.destroy();
        this.editor.action = undefined;
    } else {
        Avatar.prototype.update.call(this.editor);
    }
};

// Action for adding new points (and paths to them) from existing ones.
var AddFromPointAction = function(editor) {
    this.editor = editor;
    this.point = this.editor.point;
    this.near = undefined;
    this.valid = false; // Only allow 45 degree angles.
    this.editor.consumeButtonEvent(EditorAvatar.ADD_BUTTON);
    // Initialize bitmap for rendering.
    this.bitmap = this.editor.game.add.bitmapData(
        this.editor.game.width, this.editor.game.height);
    this.bitmap.context.lineWidth = this.editor.paths.PATH_WIDTH;
    this.bitmap.context.lineCap = this.editor.paths.LINE_CAP_STYLE;
    this.image = this.editor.game.add.image(0, 0, this.bitmap);
};

// Render the various point marks.
AddFromPointAction.prototype.renderMarks = function() {
    this.bitmap.context.clearRect(0, 0,
        this.editor.game.width, this.editor.game.height);
    if (this.near) {
        if (this.valid) {
            this.bitmap.context.fillStyle = '#D92C57';
            this.bitmap.context.strokeStyle = '#D92C57';
        } else {
            this.bitmap.context.fillStyle = '#A4A4A4';
            this.bitmap.context.strokeStyle = '#A4A4A4';
        }
        this.bitmap.context.beginPath();
        this.bitmap.context.moveTo(this.point.x, this.point.y);
        this.bitmap.context.lineTo(this.near.x, this.near.y);
        this.bitmap.context.stroke();
        this.bitmap.context.beginPath();
        var radius = EditorAvatar.ADD_PATH_SELECTED_MARK_RADIUS;
        this.bitmap.context.arc(this.near.x, this.near.y, radius, 0, 2 * Math.PI, false);
        this.bitmap.context.fill();
    }
    this.bitmap.dirty = true;
};

// Move freely, drawing where our potential point will go.
AddFromPointAction.prototype.move = function(angle, ratio) {
    // First, movement.
    var speed = ratio * EditorAvatar.FLOAT_MAX_SPEED;
    this.editor.body.velocity.x = speed * Math.sin(angle);
    this.editor.body.velocity.y = speed * Math.cos(angle);
    // Next, find and render the candidate.
    this.cacheSelectedMark();
    this.renderMarks();
};

// Figure out if a mark is near the "cursor".
AddFromPointAction.prototype.cacheSelectedMark = function() {
    var x = Math.floor(this.editor.x + 25);
    var y = Math.floor(this.editor.y + 25);
    x -= x % 50;
    y -= y % 50;
    if (x == this.point.x && y == this.point.y) {
        this.near = undefined;
        this.valid = false;
    } else {
        this.near = { x: x, y: y };
        var dx = Math.abs(this.point.x - x);
        var dy = Math.abs(this.point.y - y);
        this.valid = dx == dy || dx == 0 || dy == 0;
    }
};

// Handle an update while holding the button.
AddFromPointAction.prototype.update = function() {
    var done = false;
    if (this.editor.justReleased(EditorAvatar.ADD_CANCEL_BUTTON)) {
        // Just finish; don't add any paths.
        done = true;
        this.editor.consumeButtonEvent(EditorAvatar.ADD_CANCEL_BUTTON);
    } else if (this.editor.justReleased(EditorAvatar.ADD_BUTTON)) {
        // New point, coming atcha!
        if (this.near && this.valid) {
            // Find out if a point already exists at these coordinates.
            console.log('near: x' + this.near.x + ',y:' + this.near.y);
            var existing = undefined;
            for (var i = 0; i < this.editor.paths.points.length; i++) {
                var point = this.editor.paths.points[i];
                console.log('pnt: x' + point.x + ',y:' + point.y);
                if (point.x == this.near.x && point.y == this.near.y) {
                    existing = point;
                    break;
                }
            }
            if (existing) {
                this.editor.paths.connectPoints(this.point, existing);
                this.editor.point = existing;
            } else {
                var point = this.editor.paths.addPoint(
                    this.near.x, this.near.y, this.point);
                this.editor.point = point;
            }
        }
        done = true;
        this.editor.consumeButtonEvent(EditorAvatar.ADD_BUTTON);
    }
    if (done) {
        this.image.destroy();
        this.editor.action = undefined;
    } else {
        Avatar.prototype.update.call(this.editor);
    }
};
