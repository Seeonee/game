// Melee attack power.
var SlashPower = function(game) {
    Power.call(this, game);

    // This one is for absolutely positioning.
    this.base = this.game.add.sprite(0, 0);
    this.base.anchor.setTo(0.5);

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
    this.base.slash = this;
    this.base.verify = function(hitbox) {
        return this.slash.verifySlash(hitbox);
    };

    this.arc = new SlashEffects(this);
    this.base.addChild(this.arc);

    this.armed = false;
    this.lockedOut = false;
    this.coolingDown = false;
};

SlashPower.TYPE = 'sword';
SlashPower.prototype = Object.create(Power.prototype);
SlashPower.prototype.constructor = SlashPower;

Power.load.factory[SlashPower.TYPE] = SlashPower;

// Constants.
SlashPower.RADIUS = 50;
SlashPower.CATCH = Math.PI / 6;
SlashPower.LOCKOUT = 200; // ms
SlashPower.COOLDOWN = 400; // ms


// Prepare to slash.
SlashPower.prototype.arm = function(joystick) {
    if (this.armed || this.lockedOut || this.coolingDown) {
        return;
    }
    this.armed = true;
    this.base.x = this.avatar.x;
    this.base.y = this.avatar.y;
    this.avatar.level.z.fg.add(this.base);
    this.turnTo(joystick);
    this.arc.arm(this.avatar.level.tier.palette);
};

// Change orientation.
SlashPower.prototype.turnTo = function(joystick) {
    if (joystick && joystick.tilt > 0.5) {
        this.base.rotation = -joystick.angle + Math.PI / 2;
    }
};

// Attack!
SlashPower.prototype.slash = function() {
    this.lockedOut = true;
    this.armed = false;
    this.arc.slash();

    var obstacles = this.game.state.getCurrentState().obstacles;
    obstacles.strike(this.base);
    this.game.time.events.add(SlashPower.LOCKOUT,
        this.doneSlashing, this);
};

// Test a strike's angle.
SlashPower.prototype.verifySlash = function(hitbox) {
    var a = Utils.angleBetweenPoints(
        this.base.x, this.base.y, hitbox.x, hitbox.y);
    var a2 = -this.base.rotation + Math.PI / 2;
    var delta = Utils.getBoundedAngleDifference(a, a2);
    return delta <= SlashPower.CATCH;
};

// And we're spent.
SlashPower.prototype.doneSlashing = function() {
    this.coolingDown = true;
    this.lockedOut = false;
    this.game.time.events.add(SlashPower.COOLDOWN,
        this.doneCoolingDown, this);
};

// Ready to go.
SlashPower.prototype.doneCoolingDown = function() {
    this.coolingDown = false;
};

// ...or not.
SlashPower.prototype.nevermind = function() {
    if (!this.armed && !this.lockedOut && !this.coolingDown) {
        return;
    }
    this.armed = false;
    this.lockedOut = false;
    this.coolingDown = false;
    this.arc.nevermind();
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
