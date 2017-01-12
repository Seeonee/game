// Trace ("recall") power.
var TracePower = function(game) {
    Power.call(this, game);

    // This one is for absolutely positioning.
    this.base = this.game.add.sprite(0, 0);
    this.base.anchor.setTo(0.5);
    this.base.visible = false;

    // Triangular sparks.
    this.sparks = [];
    for (var i = 0; i < TracePower.PARTICLES; i++) {
        var spark = new TraceSpark(this, i / TracePower.PARTICLES);
        this.sparks.push(this.base.addChild(spark));
    }

    // This is the actual diamond silhouette.
    // It bursts in and shrinks, then flickers.
    this.silhouette = new TraceSilhouette(this);
    this.silhouette.anchor.setTo(0.5);
    this.base.addChild(this.silhouette);

    // One-time flash.
    this.burst = new TraceBurst(this);
    this.base.addChild(this.burst);

    this.alive = false;
};

TracePower.TYPE = 'trace';
TracePower.prototype = Object.create(Power.prototype);
TracePower.prototype.constructor = TracePower;

Power.load.factory[TracePower.TYPE] = TracePower;

// Constants.
TracePower.PARTICLES = 15;
TracePower.REUSE_DELAY = 700; // ms


// Prepare everything again.
TracePower.prototype.layTrace = function(tier) {
    this.avatar.trace = this;

    this.alive = true;
    this.point = this.avatar.point;
    this.path = this.avatar.path;
    this.tier = tier;
    this.palette = tier.palette;
    this.x = this.avatar.x;
    this.y = this.avatar.y;
    this.z = this.game.state.getCurrentState().z;
    this._layTrace();
};

// Now that all values are written down, execute.
TracePower.prototype._layTrace = function() {
    var p = { x: this.x, y: this.y + this.avatar.keyplate.y };
    var ip = this.tier.translateGamePointToInternalPoint(p.x, p.y);
    var ap = this.tier.translateInternalPointToAnchorPoint(ip.x, ip.y);
    this.base.x = ap.x;
    this.base.y = ap.y;
    this.tier.image.addChild(this.base);
    this.silhouette.scale.setTo(0.6);

    this.burst.reset(this);
    this.silhouette.reset(this);
    for (var i = 0; i < this.sparks.length; i++) {
        this.sparks[i].reset(this);
    }
    this.base.visible = true;
};

// Shut it down.
TracePower.prototype.recall = function() {
    this.dying = true;
    this.silhouette.recall(this);
    for (var i = 0; i < this.sparks.length; i++) {
        this.sparks[i].recall();
    }
};

// Save progress.
TracePower.prototype.saveProgress = function(p) {
    if (!this.avatar) {
        return;
    }
    if (this.alive) {
        p[this.type] = {
            alive: this.alive,
            tier: this.tier,
            point: this.point,
            path: this.path,
            x: this.x,
            y: this.y
        };
    } else {
        p[this.type] = { alive: this.alive };
    }
};

// Restore progress.
TracePower.prototype.restoreProgress = function(p) {
    var myp = p[this.type];
    if (!myp) {
        return;
    }
    this.avatar.setPower(this.type);
    this.alive = myp.alive;
    if (myp.alive) {
        this.tier = myp.tier;
        this.point = myp.point;
        this.path = myp.path;
        this.x = myp.x;
        this.y = myp.y;
        this._layTrace();
    }
};

// Called when access to this power is lost.
TracePower.prototype.release = function() {
    Power.prototype.release.call(this);
    this.base.visible = false;
    this.alive = false;
    this.dying = false;
    this.silhouette.release(this);
    for (var i = 0; i < this.sparks.length; i++) {
        this.sparks[i].release();
    }
};
