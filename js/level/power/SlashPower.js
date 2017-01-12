// Melee attack power.
var SlashPower = function(game) {
    Power.call(this, game);

    // This one is for absolutely positioning.
    this.base = this.game.add.sprite(0, 0);
    this.base.anchor.setTo(0.5);
    this.base.visible = false;

    this.game.physics.enable(this.base, Phaser.Physics.ARCADE);
    var side = SlashPower.RADIUS * 2;
    var w = this.base.body.width;
    var h = this.base.body.height;
    this.base.body.setSize(side, side,
        w / 2 - side / 2, h / 2 - side / 2);
    this.base.body.setCircle(side / 2);
    // this.base.update = function() {
    //     this.game.debug.body(this);
    //     this.game.debug.spriteCoords(this);
    // };

    var bitmap = this.game.bitmapCache.get(
        SlashPower.painter);
    this.arc = this.game.add.sprite(0, 0, bitmap);
    this.base.addChild(this.arc);
    this.arc.anchor.setTo(0, 0.5);

    this.armed = false;
    this.slashing = false;
};

SlashPower.TYPE = 'sword';
SlashPower.prototype = Object.create(Power.prototype);
SlashPower.prototype.constructor = SlashPower;

Power.load.factory[SlashPower.TYPE] = SlashPower;

// Constants.
SlashPower.RADIUS = 50;


// Paint our bitmap.
SlashPower.painter = function(bitmap) {
    var r = SlashPower.RADIUS;
    Utils.resizeBitmap(bitmap, r, r);
    var c = bitmap.context;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, r, r);
};

// Prepare to slash.
SlashPower.prototype.arm = function(joystick) {
    if (this.armed && this.slashing) {
        return;
    }
    this.armed = true;
    this.base.x = this.avatar.x;
    this.base.y = this.avatar.y;
    this.avatar.level.z.fg.add(this.base);
    this.turnTo(joystick);
    this.base.visible = true;
};

// Change orientation.
SlashPower.prototype.turnTo = function(joystick) {
    if (joystick && joystick.tilt > 0.5) {
        this.base.rotation = -joystick.angle + Math.PI / 2;
    }
};

// Attack!
SlashPower.prototype.slash = function(callback, context) {
    this.slashing = true;
    this.armed = false;

    var obstacles = this.game.state.getCurrentState().obstacles;
    obstacles.strike(this.base);


    this.game.time.events.add(200, this.doneSlashing, this,
        callback, context);
};

// And we're spent.
SlashPower.prototype.doneSlashing = function(callback, context) {
    this.slashing = false;
    this.base.visible = false;
    callback.call(context);
};

// ...or not.
SlashPower.prototype.nevermind = function() {
    if (!this.armed && !this.slashing) {
        return;
    }
    this.armed = false;
    this.slashing = false;
    this.base.visible = false;
};

// Save progress.
SlashPower.prototype.saveProgress = function(p) {
    if (!this.avatar) {
        return;
    }
    p[this.type] = {};
};

// Restore progress.
SlashPower.prototype.restoreProgress = function(p) {
    var myp = p[this.type];
    if (!myp) {
        return;
    }
    this.avatar.setPower(this.type);
};

// Called when access to this power is lost.
SlashPower.prototype.release = function() {
    Power.prototype.release.call(this);
    this.nevermind();
};
