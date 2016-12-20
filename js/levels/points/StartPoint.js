// This is where you start out.
var StartPoint = function(name, x, y) {
    Point.call(this, name, x, y);
    this.drawn = false;
};

StartPoint.TYPE = 'start';
StartPoint.prototype = Object.create(Point.prototype);
StartPoint.prototype.constructor = StartPoint;

// Set up our factory.
Point.load.factory[StartPoint.TYPE] = StartPoint;


// Draw our tiny little blip.
StartPoint.prototype.draw = function(tier) {
    this.renderNeeded = false;
    if (!this.drawn) {
        this.drawn = true;
        var ap = tier.translateInternalPointToAnchorPoint(
            this.x, this.y);
        tier.image.addChild(new PNub(tier.game,
            ap.x, ap.y, tier.palette.c1.i));
    }
};

// Editor details.
StartPoint.prototype.getDetails = function() {
    return Point.prototype.getDetails.call(this) + '\n' +
        'start gate';
};

// Create a starting point.
StartPoint.load = function(game, name, json) {
    return new StartPoint(name, json.x, json.y);
};
