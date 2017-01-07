// Handle obstacle editing.
var ObstacleEditorIState = function(handler, level) {
    IState.call(this, ObstacleEditorIState.NAME, handler);
    this.level = level;
    this.avatar = level.avatar;
};

ObstacleEditorIState.NAME = 'objects';
ObstacleEditorIState.prototype = Object.create(IState.prototype);
ObstacleEditorIState.prototype.constructor = ObstacleEditorIState;

// Constants.
ObstacleEditorIState.GRID_UNIT = 50;


// Called when we become the active state.
ObstacleEditorIState.prototype.activated = function(prev) {
    this.tier = this.level.tier;
    if (!this.indicator) {
        this.indicator = this.game.add.sprite(0, 0, 'smoke');
        this.game.state.getCurrentState().z.mg.add(this.indicator);
        this.indicator.anchor.setTo(0.5, 0);
    }
    this.indicator.visible = true;
    this.indicator.tint = this.tier.palette.c2.i;
    this.marker = undefined;
    this.updateMarkerAndObstacle();
};

// Called when we deactivate.
ObstacleEditorIState.prototype.deactivated = function(next) {
    this.indicator.visible = false;
    this.avatar.velocity.x = 0;
    this.avatar.velocity.y = 0;
};

// Handle an update.
ObstacleEditorIState.prototype.update = function() {
    if (this.handler.cycle()) {
        // We're no longer active; it's k.
        // Go ahead and snap back onto the paths.
        var p = Utils.findClosestPointToAvatar(
            this.tier, this.avatar);
        var point = this.tier.pointMap[p];
        this.avatar.point = point;
        this.avatar.x = point.gx;
        this.avatar.y = point.gy;
        this.avatar.updateAttachment();
    } else {
        // Move freely.
        var joystick = this.gpad.getAngleAndTilt();
        var angle = joystick.angle;
        var tilt = joystick.tilt;
        var speed = tilt * FloatIState.FLOAT_MAX_SPEED;
        this.avatar.velocity.x = speed * Math.sin(angle);
        this.avatar.velocity.y = speed * Math.cos(angle);
        this.updateMarkerAndObstacle();

        if (this.gpad.justReleased(this.buttonMap.EDIT_ADD) ||
            this.gpad.justReleased(this.buttonMap.EDIT_CUSTOMIZE)) {
            this.gpad.consumeButtonEvent();
            if (!this.obstacle) {
                this.activate(AddObstacleIState.NAME);
            }
        } else if (this.gpad.justPressed(this.buttonMap.EDIT_DELETE)) {
            this.gpad.consumeButtonEvent();
            if (this.obstacle) {
                this.activate(DeleteObstacleIState.NAME);
            }
        } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_UP)) {
            this.activate(StepUpIState.NAME);
        } else if (this.gpad.justPressed(this.buttonMap.EDIT_STEP_DOWN)) {
            this.activate(StepDownIState.NAME);
        }
    }
    if (!this.isActive()) {
        return this.handler.state.update();
    }
};

// Recalculate.
ObstacleEditorIState.prototype.updateMarkerAndObstacle = function() {
    var oldMarker = this.marker;
    this.marker = this.findMarker();
    if (this.marker == oldMarker) {
        return;
    }
    this.repositionMarker();
    this.obstacle = this.findNearbyObstacle();
    this.updateHelpText();
};

// Figure out the new marker position.
ObstacleEditorIState.prototype.findMarker = function() {
    var u = ObstacleEditorIState.GRID_UNIT;
    if (this.gpad.isDown(this.buttonMap.EDIT_FLOAT)) {
        u /= 2;
    }
    var ip = { x: this.avatar.x, y: this.avatar.y };
    ip.x = Math.floor(ip.x + ((u / 2) * Math.sign(ip.x)));
    ip.y = Math.floor(ip.y + ((u / 2) * Math.sign(ip.y)));
    ip.x -= ip.x % u;
    ip.y -= ip.y % u;
    return ip;
};

// Move the marker gfx.
ObstacleEditorIState.prototype.repositionMarker = function() {
    this.indicator.x = this.marker.x;
    this.indicator.y = this.marker.y;
};

// Find an obstacle near the marker, if there is one.
ObstacleEditorIState.prototype.findNearbyObstacle = function() {
    var coords = Point.coords(this.marker.x, this.marker.y);
    return this.tier.obstacleCoords[coords];
};

// Show what the avatar's attached to.
ObstacleEditorIState.prototype.updateHelpText = function() {
    if (!this.isActive()) {
        return;
    }
    if (!this.obstacle) {
        var s = 'objects (' + this.marker.x + ',' + this.marker.y + ')';
        this.avatar.htext.setText(EditLevelIHandler.addArrows(s));
        return;
    }
    var s = 'objects ' + ' / ' + this.obstacle.name;
    if (this.obstacle.getDetails) {
        s += this.obstacle.getDetails();
    }
    this.avatar.htext.setText(EditLevelIHandler.addArrows(s));
};
