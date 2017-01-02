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
TracePower.prototype.reset = function(avatar, tier) {
    this.avatar = avatar;
    this.avatar.trace = this;

    this.alive = true;
    this.point = avatar.point;
    this.path = avatar.path;
    this.tier = tier;
    this.palette = tier.palette;
    this.x = avatar.x;
    this.y = avatar.y;
    this.z = this.game.state.getCurrentState().z;

    var p = { x: this.x, y: this.y + avatar.keyplate.y };
    var ip = tier.translateGamePointToInternalPoint(p.x, p.y);
    var ap = tier.translateInternalPointToAnchorPoint(ip.x, ip.y);
    this.base.x = ap.x;
    this.base.y = ap.y;
    tier.image.addBackgroundChild(this.base);
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
