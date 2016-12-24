// Set up a portal point.
var CustomizePortalPointIState = function(handler, level) {
    var optionName = 'start enabled';
    var options = [true, false];
    OptionSetGathererIState.call(this, handler, level, PortalPoint, 1,
        optionName, options);
    new CustomizePortalPoint2IState(handler, level);
    new CustomizePortalPoint3IState(handler, level);
    new CustomizePortalPoint4IState(handler, level);
};

CustomizePortalPointIState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePortalPointIState.prototype.constructor = CustomizePortalPointIState;

// Update loop.
CustomizePortalPointIState.prototype.update = function() {
    if (this.level.tiers.length == 1) {
        this.avatar.help.setText('create portal failed\n' +
            'add tiers first', true);
        this.finish();
        return;
    }
    return OptionSetGathererIState.prototype.update.call(this);
};








// Set up a portal point.
var CustomizePortalPoint2IState = function(handler, level) {
    var optionName = 'synchronize';
    var options = [true, false];
    OptionSetGathererIState.call(this, handler, level, PortalPoint, 2,
        optionName, options);
};

CustomizePortalPoint2IState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePortalPoint2IState.prototype.constructor = CustomizePortalPoint2IState;








// Set up a portal point.
var CustomizePortalPoint3IState = function(handler, level) {
    var optionName = 'destination';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, PortalPoint, 3,
        optionName, options);
};

CustomizePortalPoint3IState.prototype = Object.create(OptionSetGathererIState.prototype);
CustomizePortalPoint3IState.prototype.constructor = CustomizePortalPoint3IState;


// Called when activated.
CustomizePortalPoint3IState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.point = this.avatar.point;
    this.coords = '(' + this.point.gx + ',' + this.point.gy + ')';
    var minIndex = 0;
    var maxIndex = this.level.tiers.length - 1;
    var index = this.level.tiers.indexOf(this.level.tier);

    // Find a candidate in the tier above us.
    this.options = [];
    if (this.level.tiers.indexOf(this.level.tier) < maxIndex) {
        var increment = 1;
        var word = 'up';
        var option = this.createOption(index, increment, word);
    } else {
        var option = { text: 'up (n/a)', value: undefined };
    }
    this.options.push(option);

    // Now find one below us.
    if (this.level.tiers.indexOf(this.level.tier) > minIndex) {
        var increment = -1;
        var word = 'down';
        var option = this.createOption(index, increment, word);
    } else {
        var option = { text: 'down (n/a)', value: undefined };
    }
    this.options.push(option);

    OptionSetGathererIState.prototype.activated.call(this, prev);
};

// Advance only if we're on a valid target.
CustomizePortalPoint3IState.prototype.advance = function() {
    if (this.getOptionValue()) {
        return OptionGathererIState.prototype.advance.call(this);
    }
};

// Create an option for one direction we can go to.
CustomizePortalPoint3IState.prototype.createOption = function(
    index, increment, word) {
    var option = {};
    var tier = this.level.tiers[index + increment];
    option.text = word + '\ntier: ' + tier.name + '\npoint: ';
    option.value = { d: increment, t: tier };
    var point = this.findCounterpoint(tier);
    if (point) {
        if (point instanceof StartPoint) {
            option.text += 'n/a - start';
            option.value = undefined;
        } else if (point instanceof EndPoint) {
            option.text += 'n/a - end';
            option.value = undefined;
        } else {
            option.text += point.name;
            option.value.p = point.name;
        }
    } else {
        var name = tier.getNewPointName();
        option.text += name;
        option.value.p = name;
    }
    return option;
};

// Find a point we can connect to.
CustomizePortalPoint3IState.prototype.findCounterpoint = function(tier) {
    var x = this.point.gx;
    var y = this.point.gy;
    for (var i = 0; i < tier.points.length; i++) {
        var p = tier.points[i];
        if (p.gx == x && p.gy == y) {
            return p;
        }
    }
    return undefined;
};







// Set up a portal point.
var CustomizePortalPoint4IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, PortalPoint, 4);
    this.showArrows = false;
};

CustomizePortalPoint4IState.prototype = Object.create(BaseCustomizeIState.prototype);
CustomizePortalPoint4IState.prototype.constructor = CustomizePortalPoint4IState;


// Update loop.
CustomizePortalPoint4IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var tier = options.destination.t;
    var p = options.destination.p;

    // Set up the first portal point.
    var portal1 = new PortalPoint();
    portal1.enabled = options['start enabled'];
    portal1.direction = options.destination.d;
    portal1.to = p;
    portal1.synchronize = options.synchronize;

    // Set up the second portal.
    var portal2 = new PortalPoint();
    portal2.enabled = portal1.enabled;
    portal2.direction = -1 * portal1.direction;
    portal2.to = this.point.name;
    portal2.synchronize = portal1.synchronize;

    // Go ahead and link them.
    portal1.toPoint = portal2;
    portal2.toPoint = portal1;

    if (tier.pointMap[p]) {
        tier.replacePoint(tier.pointMap[p], portal2);
    } else {
        portal2.name = p;
        portal2.x = this.point.gx;
        portal2.y = this.point.gy;
        portal2.gx = this.point.gx;
        portal2.gy = this.point.gy;
        tier._addPoint(portal2);
    }
    this.finished(portal1); // Activates previous.
};
