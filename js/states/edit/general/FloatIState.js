// Default state for handling gamepad input during a level.
var FloatIState = function(handler, level) {
    IState.call(this, FloatIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
};

FloatIState.NAME = 'float';
FloatIState.prototype = Object.create(IState.prototype);
FloatIState.prototype.constructor = FloatIState;

// Some constants.
FloatIState.FLOAT_MAX_SPEED = 200;
FloatIState.FLOAT_SNAP_DISTANCE = 25;

// Called when we become the active state.
FloatIState.prototype.activated = function(prev) {
    if (prev instanceof GeneralEditIState ||
        prev instanceof WireEditorIState) {
        this.prev = prev;
    }
    this.gpad.consumeButtonEvent();
    var attach = this.game.settings.buttonMap.buttonName(
        this.game.settings.buttonMap.EDIT_FLOAT);
    this.info = '\n' + attach + ' to land';
    this.avatar.help.setText('hover' + this.info);
    this.tier = this.level.tier;
    this.points = this.tier.points;
    this.paths = this.tier.paths;
    this.x = this.avatar.x;
    this.y = this.avatar.y;
    this.point = undefined;
    this.path = undefined;
};

// Called when we deactivate.
FloatIState.prototype.deactivated = function(next) {
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
};

// Called on update.
FloatIState.prototype.update = function() {
    // Move freely.
    var joystick = this.gpad.getAngleAndTilt();
    var angle = joystick.angle;
    var tilt = joystick.tilt;
    var speed = tilt * FloatIState.FLOAT_MAX_SPEED;
    this.avatar.body.velocity.x = speed * Math.sin(angle);
    this.avatar.body.velocity.y = speed * Math.cos(angle);
    this.point = this.findNearbyPoint();
    this.path = (this.point) ? undefined : this.findNearbyPath();
    if (this.point) {
        this.avatar.help.setText('hover / ' + this.point.name +
            this.info);
    } else if (this.path) {
        this.avatar.help.setText('hover / ' + this.path.name +
            this.info);
    } else {
        this.updateHoverText();
    }

    // Has the player released the button?
    if (this.gpad.justPressed(this.buttonMap.EDIT_FLOAT)) {
        this.gpad.consumeButtonEvent();
        if (this.point) {
            this.snapToPoint(this.point);
        } else if (this.path) {
            this.snapToPath(this.path);
        } else if (this.avatar.point || this.avatar.path) {
            this.snapToStartingValues();
        } else {
            // Don't stop the hover.
            return;
        }
        this.activate(this.prev.name);
        return;
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_UP)) {
        this.activate(StepUpIState.NAME);
    } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_DOWN)) {
        this.activate(StepDownIState.NAME);
    } else if (this.prev instanceof GeneralEditIState) {
        if (this.gpad.justPressed(this.buttonMap.EDIT_ADD)) {
            if (!this.point && !this.path) {
                this.activate(AddFromFloatIState.NAME);
            }
        } else if (this.gpad.justPressed(this.buttonMap.EDIT_DELETE)) {
            if (this.point || this.path) {
                this.activate(DeleteIState.NAME);
            }
        } else if (this.gpad.justPressed(this.buttonMap.EDIT_CUSTOMIZE)) {
            if (this.point) {
                this.activate(CustomizePointIState.NAME);
            }
        }
    }
}

// Return a nearby point, or undefined if none are found.
FloatIState.prototype.findNearbyPoint = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    var min = FloatIState.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var d = Utils.distanceBetweenPoints(
            ip.x, ip.y, point.x, point.y);
        if (d <= min) {
            found = point;
            min = d;
        }
    }
    return found;
};

// Return a nearby path, or undefined if none are found.
FloatIState.prototype.findNearbyPath = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    var min = FloatIState.FLOAT_SNAP_DISTANCE;
    var found = undefined;
    for (var i = 0; i < this.paths.length; i++) {
        var path = this.paths[i];
        var d = Utils.distanceBetweenPoints(
            path.p1.x, path.p1.y, ip.x, ip.y);
        var a1 = Utils.angleBetweenPoints(
            path.p1.x, path.p1.y, ip.x, ip.y);
        var a2 = path.angleForward;
        var a3 = Utils.getBoundedAngleDifference(a1, a2);
        var offset = d * Math.sin(a3);
        var length = d * Math.cos(a3);
        if (length < -FloatIState.FLOAT_SNAP_DISTANCE ||
            length > path.length + FloatIState.FLOAT_SNAP_DISTANCE) {
            continue;
        }
        if (offset <= min) {
            found = path;
            min = offset;
        }
    }
    return found;
};

// Snap onto a point.
FloatIState.prototype.snapToPoint = function(point) {
    var gp = this.tier.translateInternalPointToGamePoint(
        point.x, point.y);
    this.avatar.x = gp.x;
    this.avatar.y = gp.y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    this.avatar.point = point;
    this.avatar.path = undefined;
};

// Snap onto a path.
FloatIState.prototype.snapToPath = function(path) {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    var d = Utils.distanceBetweenPoints(
        path.p1.x, path.p1.y, ip.x, ip.y);
    var dx = d * Math.sin(path.angleForward);
    var dy = d * Math.cos(path.angleForward);
    var x = path.p1.x + dx;
    var y = path.p1.y + dy;
    var gp = this.tier.translateInternalPointToGamePoint(x, y);
    this.avatar.x = gp.x;
    this.avatar.y = gp.y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
    this.avatar.path = path;
    this.avatar.point = undefined;
};

// Snap back to our starting values.
FloatIState.prototype.snapToStartingValues = function() {
    this.avatar.x = this.x;
    this.avatar.y = this.y;
    this.avatar.body.velocity.x = 0;
    this.avatar.body.velocity.y = 0;
};

// Display our (internal) coords.
FloatIState.prototype.updateHoverText = function() {
    var gp = { x: this.avatar.x, y: this.avatar.y };
    this.avatar.help.setText('hover / (' +
        Math.floor(gp.x) + ',' + Math.floor(gp.y) + ')' +
        this.info);
};
