// Control the camera.
var CameraIState = function(handler) {
    IState.call(this, CameraIState.NAME, handler);
};

CameraIState.NAME = 'camera';
CameraIState.prototype = Object.create(IState.prototype);
CameraIState.prototype.constructor = CameraIState;

// Constants.
CameraIState.MAX_SPEED = 400;


// Handle an update.
CameraIState.prototype.update = function() {
    if (this.gpad.isTilted2()) {
        var joystick = this.gpad.getAngleAndTilt2();
        this.moveCamera(joystick.angle, joystick.tilt);
    }
    return false;
};

// Move the camera
CameraIState.prototype.moveCamera = function(angle, tilt) {
    var ratio = this.game.time.elapsed / 1000;
    var speed = ratio * tilt * CameraIState.MAX_SPEED;
    var vx = speed * Math.sin(angle);
    var vy = speed * Math.cos(angle);
    this.game.camera.x += vx;
    this.game.camera.y += vy;
};

// Handle a render.
CameraIState.prototype.render = function() {
    return false;
};
