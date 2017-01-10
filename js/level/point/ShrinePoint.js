// Checkpoint to save progress.
var ShrinePoint = function(name, x, y) {
    Point.call(this, name, x, y);
    this.visited = false;
    this.broken = false;
};

ShrinePoint.TYPE = 'shrine';
ShrinePoint.prototype = Object.create(Point.prototype);
ShrinePoint.prototype.constructor = ShrinePoint;

// Set up our factory.
Point.load.factory[ShrinePoint.TYPE] = ShrinePoint;


// During our first draw, we create the actual key.
ShrinePoint.prototype.draw = function(tier) {
    Point.prototype.draw.call(this, tier);
    if (!this.drawn) {
        this.drawn = true;
        this.game = tier.game;
        this.level = tier.level;
        this.level.events.onShrineVisit.add(this.notifyVisit, this);

        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        this.shrine = new ShrineRing(this.game, ap.x, ap.y,
            tier.palette);
        tier.image.addBackgroundChild(this.shrine);
    } else {
        this.shrine.updatePalette(tier.palette);
    }
};

// Called when the avatar visits.
ShrinePoint.prototype.notifyAttached = function(avatar, prev) {
    Point.prototype.notifyAttached.call(this, avatar, prev);
    if (!this.visited) {
        this.level.visitShrine(this);
    }
};

// Called whenever any shrine is visited.
ShrinePoint.prototype.notifyVisit = function(shrine) {
    if (shrine === this) {
        if (!this.visited) {
            this.visited = true;
            this.shrine.close();
        }
    } else {
        if (this.visited) {
            this.broken = true;
            this.shrine.break();
        }
    }
};

// Save progress.
ShrinePoint.prototype.saveProgress = function(p) {
    if (this.visited) {
        p[this.name] = {
            visited: this.visited,
            broken: this.broken
        };
    }
};

// Restore progress.
ShrinePoint.prototype.restoreProgress = function(p) {
    if (!this.visited) {
        if (this.shrine) {
            this.shrine.startSpinner();
        }
        return;
    }

    var myp = p[this.name];
    var visited = myp && myp.visited ? myp.visited : false;
    var broken = myp && myp.broken ? myp.broken : false;
    this.visited = visited;
    this.broken = broken;
    if (!broken) {
        if (this.shrine) {
            this.shrine.startSpinner();
        }
        if (this.visited) {
            if (this.shrine) {
                this.shrine.resetVisited();
            }
        }
        if (!this.visited) {
            if (this.shrine) {
                this.shrine.resetUnvisited();
            }
        }
    }
};

// Delete our gfx.
ShrinePoint.prototype.delete = function() {
    Point.prototype.delete.call(this);
    if (this.shrine) {
        Utils.destroy(this.shrine);
        this.shrine = undefined;
    }
};

// Editor details.
ShrinePoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'shrine';
};

// JSON conversion.
ShrinePoint.prototype.toJSON = function() {
    var result = Point.prototype.toJSON.call(this);
    delete result.enabled;
    return result;
};

// JSON conversion.
ShrinePoint.load = function(game, name, json) {
    return new ShrinePoint(name, json.x, json.y);
};
