// Set up a warp point.
var CustomizeWarpPointIState = function(handler, level) {
    var optionName = 'start enabled';
    var options = [true, false];
    OptionSetGathererIState.call(this, handler, level, WarpPoint, 1,
        optionName, options);
    new CustomizeWarpPoint2IState(handler, level);
    new CustomizeWarpPoint3IState(handler, level);
};

CustomizeWarpPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizeWarpPointIState.prototype.constructor = CustomizeWarpPointIState;








// Set up a warp point.
var CustomizeWarpPoint2IState = function(handler, level) {
    var optionName = 'destination';
    OptionGathererIState.call(this, handler, level, WarpPoint, 2,
        optionName);
};

CustomizeWarpPoint2IState.prototype = Object.create(OptionGathererIState.prototype);
CustomizeWarpPoint2IState.prototype.constructor = CustomizeWarpPoint2IState;


// Called when activated.
CustomizeWarpPoint2IState.prototype.activated = function(prev) {
    this.avatar.body.enable = true;
    this.gpad.consumeButtonEvent();
    this.target = this.point;
    this.tier = this.level.tier;
    OptionGathererIState.prototype.activated.call(this, prev);

    this.image = new EditCharge(this.game,
        this.point.gx, this.point.gy, this.level.tier.palette);
    this.game.state.getCurrentState().z.mg.tier().add(this.image);
    this.image.visible = false;
};

// Called when deactivated.
CustomizeWarpPoint2IState.prototype.deactivated = function(next) {
    this.image.kill();
    OptionGathererIState.prototype.deactivated.call(this, next);
};

// Called on update.
CustomizeWarpPoint2IState.prototype.update = function() {
    // Move freely.
    var joystick = this.gpad.getAngleAndTilt();
    var angle = joystick.angle;
    var tilt = joystick.tilt;
    var speed = tilt * FloatIState.FLOAT_MAX_SPEED;
    this.avatar.body.velocity.x = speed * Math.sin(angle);
    this.avatar.body.velocity.y = speed * Math.cos(angle);
    var target = this.findNearbyPoint();
    if (target != this.target) {
        // TODO: Move gfx indicator
        this.target = target;
        if (!this.target || this.target == this.point) {
            this.image.visible = false;
        } else {
            this.image.x = this.target.gx;
            this.image.y = this.target.gy;
            this.image.visible = true;
        }
        this.updateHelp();
    }
    return OptionGathererIState.prototype.update.call(this);
};

// What option do we display?
CustomizeWarpPoint2IState.prototype.getOptionText = function() {
    var s = this.getOptionValue();
    return s ? s : 'select a point';
};

// What option do we represent?
CustomizeWarpPoint2IState.prototype.getOptionValue = function() {
    if (this.target && this.target != this.point) {
        return this.target.name;
    }
    return undefined;
};

// Advance only if we're on a valid target.
CustomizeWarpPoint2IState.prototype.advance = function() {
    if (this.getOptionValue()) {
        return OptionGathererIState.prototype.advance.call(this);
    }
};

// Return a nearby point, or undefined if none are found.
CustomizeWarpPoint2IState.prototype.findNearbyPoint = function() {
    var ip = this.tier.translateGamePointToInternalPoint(
        this.avatar.x, this.avatar.y);
    var min = FloatIState.FLOAT_SNAP_DISTANCE * 1.5;
    var found = undefined;
    for (var i = 0; i < this.tier.points.length; i++) {
        var point = this.tier.points[i];
        var d = Utils.distanceBetweenPoints(
            ip.x, ip.y, point.x, point.y);
        if (d <= min) {
            found = point;
            min = d;
        }
    }
    return found;
};









// Set up a warp point.
var CustomizeWarpPoint3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, WarpPoint, 3);
    this.showArrows = false;
};

CustomizeWarpPoint3IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizeWarpPoint3IState.prototype.constructor = CustomizeWarpPoint3IState;


// Update loop.
CustomizeWarpPoint3IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var point = new WarpPoint();
    point.enabled = options['start enabled'];
    point.startEnabled = point.enabled;
    point.to = options['destination'];
    this.finished(point); // Activates previous.
};
