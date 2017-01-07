// Control the camera.
var CameraIState = function(handler) {
    IState.call(this, CameraIState.NAME, handler);
    this.free = false;

    this.game.scale.onFullScreenChange.add(this.updateDeadzone, this);
    this.game.scale.onSizeChange.add(this.updateDeadzone, this);
    this.updateDeadzone();
};

CameraIState.NAME = 'camera';
CameraIState.prototype = Object.create(IState.prototype);
CameraIState.prototype.constructor = CameraIState;

// Constants.
CameraIState.MAX_SPEED = 700;
CameraIState.SNAP_TIME = 800;
CameraIState.DEADZONE_EDGE_X = 50;
CameraIState.DEADZONE_EDGE_Y = 50;


// Update deadzones on screen size change.
CameraIState.prototype.updateDeadzone = function() {
    this.dzFree = new Phaser.Rectangle(
        CameraIState.DEADZONE_EDGE_X,
        CameraIState.DEADZONE_EDGE_Y,
        this.game.camera.width - (2 * CameraIState.DEADZONE_EDGE_X),
        this.game.camera.height - (2 * CameraIState.DEADZONE_EDGE_Y));
    this.dzSnap = {};
    this.game.camera.deadzone.copyTo(
        this.dzSnap);

    this.xbounds = {
        a: CameraIState.DEADZONE_EDGE_X,
        b: PlayLevelState.DEADZONE_EDGE_X
    };
    this.ybounds = {
        a: CameraIState.DEADZONE_EDGE_Y,
        b: PlayLevelState.DEADZONE_EDGE_Y
    };
};

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
    var br = this.getBoundsRatio(angle);
    var speed = ratio * tilt * CameraIState.MAX_SPEED;
    var vx = br.x * speed * Math.sin(angle);
    var vy = br.y * speed * Math.cos(angle);
    this.game.camera.x += vx;
    this.game.camera.y += vy;
};

// Loosen the deadzone.
CameraIState.prototype.freeCamera = function() {
    this.free = true;
    if (this.tween) {
        this.tween.stop();
        this.tween = undefined;
    }
    if (this.dzSnap == undefined) {}
    this.game.camera.deadzone.copyFrom(this.dzFree);
};

// Restrict the deadzone.
CameraIState.prototype.snapCameraBack = function() {
    this.free = false;
    if (this.tween) {
        return;
    }

    var c = this.game.camera;
    var w = c.width;
    var h = c.height;
    var x = c.target.x - c.x;
    var y = c.target.y - c.y;
    x = x > w / 2 ? w - x : x;
    y = y > w / 2 ? h - y : y;
    if (x < PlayLevelState.DEADZONE_EDGE_X) {
        var delta = x - c.deadzone.x;
        c.deadzone.x += delta;
        c.deadzone.width -= 2 * delta;
    }
    if (y < PlayLevelState.DEADZONE_EDGE_Y) {
        var delta = y - c.deadzone.y;
        c.deadzone.y += delta;
        c.deadzone.height -= 2 * delta;
    }

    this.tween = this.game.add.tween(c.deadzone);
    this.tween.to(this.dzSnap, CameraIState.SNAP_TIME,
        Phaser.Easing.Sinusoidal.InOut, true);
    this.tween.onComplete.add(function() {
        this.tween = undefined;
    }, this);
};

// Compute the taper as we reach our deadzone bounds.
CameraIState.prototype.getBoundsRatio = function(angle) {
    var ratio = { x: 1, y: 1 };
    var w = this.game.camera.width;
    var h = this.game.camera.height;

    var x = this.game.camera.target.x - this.game.camera.x;
    var a = Math.PI / 2;
    if (x > w / 2) {
        x = w - x;
        a += Math.PI;
    }
    var xangle = Utils.getBoundedAngleDifference(a, angle);
    if (xangle < Math.PI / 2) {
        ratio.x = this.applyBounds(x, this.xbounds);
    }

    var y = this.game.camera.target.y - this.game.camera.y;
    var a = 0;
    if (y > h / 2) {
        y = h - y;
        a += Math.PI;
    }
    var yangle = Utils.getBoundedAngleDifference(a, angle);
    if (yangle < Math.PI / 2) {
        ratio.y = this.applyBounds(y, this.ybounds);
    }

    ratio.x = Math.cbrt(ratio.x);
    ratio.y = Math.cbrt(ratio.y);
    return ratio;
};

// Compute the taper as we reach our deadzone bounds.
CameraIState.prototype.applyBounds = function(v, bounds) {
    return (v - bounds.a) / (bounds.b - bounds.a);
};

// Handle a render.
CameraIState.prototype.render = function() {
    return false;
};
