// Control the camera.
var CameraIState = function(handler) {
    IState.call(this, CameraIState.NAME, handler);
    this.free = false;

    if (CameraIState.FREE_DEADZONE == undefined) {
        CameraIState.FREE_DEADZONE = new Phaser.Rectangle(
            CameraIState.DEADZONE_EDGE_X,
            CameraIState.DEADZONE_EDGE_Y,
            this.game.width - (2 * CameraIState.DEADZONE_EDGE_X),
            this.game.height - (2 * CameraIState.DEADZONE_EDGE_Y));
    }
};

CameraIState.NAME = 'camera';
CameraIState.prototype = Object.create(IState.prototype);
CameraIState.prototype.constructor = CameraIState;

// Constants.
CameraIState.MAX_SPEED = 500;
CameraIState.SNAP_TIME = 1500;
CameraIState.FREE_DEADZONE = undefined;
CameraIState.SNAP_DEADZONE = undefined;
CameraIState.DEADZONE_EDGE_X = 50;
CameraIState.DEADZONE_EDGE_Y = 50;


// Handle an update.
CameraIState.prototype.update = function() {
    if (this.gpad.isTilted2()) {
        var joystick = this.gpad.getAngleAndTilt2();
        if (!this.free) {
            this.freeCamera();
        }
        this.moveCamera(joystick.angle, joystick.tilt);
    } else if (this.free) {
        this.snapCameraBack();
    }
    return false;
};

// Move the camera.
CameraIState.prototype.moveCamera = function(angle, tilt) {
    var ratio = this.game.time.elapsed / 1000;
    var br = this.getBoundsRatio();
    var speed = ratio * tilt * CameraIState.MAX_SPEED;
    var vx = br.x * speed * Math.sin(angle);
    var vy = br.y * speed * Math.cos(angle);
    this.game.camera.x += vx;
    this.game.camera.y += vy;
};

// Compute the taper as we reach our deadzone bounds.
CameraIState.prototype.getBoundsRatio = function() {
    var ratio = { x: 1, y: 1 };
    var w = this.game.camera.width;
    var h = this.game.camera.height;

    var x = this.game.camera.target.x - this.game.camera.x;
    var bounds = {
        a: CameraIState.DEADZONE_EDGE_X,
        b: PlayLevelState.DEADZONE_EDGE_X
    };
    ratio.x = Math.min(ratio.x, this.applyBounds(x, bounds));
    bounds = {
        a: w - PlayLevelState.DEADZONE_EDGE_X,
        b: w - CameraIState.DEADZONE_EDGE_X
    };
    ratio.x = Math.min(ratio.x, 1 - this.applyBounds(x, bounds));

    var y = this.game.camera.target.y - this.game.camera.y;
    var bounds = {
        a: CameraIState.DEADZONE_EDGE_Y,
        b: PlayLevelState.DEADZONE_EDGE_Y
    };
    ratio.y = Math.min(ratio.y, this.applyBounds(y, bounds));
    bounds = {
        a: h - PlayLevelState.DEADZONE_EDGE_Y,
        b: h - CameraIState.DEADZONE_EDGE_Y
    };
    ratio.y = Math.min(ratio.y, 1 - this.applyBounds(y, bounds));

    ratio.x = Math.sqrt(ratio.x);
    ratio.y = Math.sqrt(ratio.y);
    return ratio;
};

// Compute the taper as we reach our deadzone bounds.
CameraIState.prototype.applyBounds = function(v, bounds) {
    return (v - bounds.a) / (bounds.b - bounds.a);
};

// Loosen the deadzone.
CameraIState.prototype.freeCamera = function() {
    this.free = true;
    if (this.tween) {
        this.tween.stop();
        this.tween = undefined;
    }
    if (CameraIState.SNAP_DEADZONE == undefined) {
        CameraIState.SNAP_DEADZONE = {};
        this.game.camera.deadzone.copyTo(
            CameraIState.SNAP_DEADZONE);
    }
    this.game.camera.deadzone.copyFrom(CameraIState.FREE_DEADZONE);
};

// Restrict the deadzone.
CameraIState.prototype.snapCameraBack = function() {
    this.free = false;
    if (this.tween) {
        return;
    }
    this.tween = this.game.add.tween(this.game.camera.deadzone);
    this.tween.to(CameraIState.SNAP_DEADZONE, CameraIState.SNAP_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
    this.tween.onComplete.add(function() {
        this.tween = undefined;
    }, this);
};

// Handle a render.
CameraIState.prototype.render = function() {
    return false;
};
