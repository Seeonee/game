// A group intended to create various subgroups for z-layers.
var ZGroup = function(game, layerNames) {
    Phaser.Group.call(this, game);
    this.layers = [];
    if (layerNames) {
        for (var i = 0; i < layerNames.length; i++) {
            this.createSubgroup(layerNames[i]);
        }
    }
};

ZGroup.prototype = Object.create(Phaser.Group.prototype);
ZGroup.prototype.constructor = ZGroup;

// Create a group for z-order rendering.
ZGroup.prototype.createSubgroup = function(name, asChild) {
    asChild = asChild == undefined ? true : asChild;
    var group = asChild ? this.game.add.group(this) : this.game.add.group();
    group.name = name;
    this.layers.push(group);
    this[name] = group;
    return group;
};

// A group intended to create various subgroups for z-layers.
// This one adds custom logic so that each layer can 
// spawn tier-specific sublayers.
var LevelZGroup = function(level, layerNames) {
    this._level = level;
    ZGroup.call(this, this._level.game, layerNames);
};

LevelZGroup.prototype = Object.create(ZGroup.prototype);
LevelZGroup.prototype.constructor = LevelZGroup;

// Create a group for z-order rendering.
// It also contains a tier() method which 
// will return (and if necessary instantiate)
// a subgroup for the currently selected tier.
LevelZGroup.prototype.createSubgroup = function(name, asChild) {
    var group = ZGroup.prototype.createSubgroup.call(this, name, asChild);
    group._level = this._level;
    group._tierSubs = {};
    group.tier = function() {
        var sub = this;
        if (this._level.tier) {
            var t = this._level.tier.name;
            sub = this._tierSubs[t];
            if (!sub) {
                sub = this.game.add.group(this);
                this._tierSubs[t] = sub;
            }
        }
        return sub;
    };
    group.setVisibleFor = function(tier, visible) {
        var sub = this._tierSubs[tier.name];
        if (sub) {
            sub.visible = visible;
        }
    };
    group.setBlurFor = function(tier, blurred) {
        var sub = this._tierSubs[tier.name];
        if (!sub || blurred == sub._blurred) {
            return;
        }
        sub._blurred = blurred;
        if (sub.tween) {
            sub.tween.stop();
        }
        if (sub.filters == null) {
            var filter = new PIXI.BlurFilter();
            sub.filters = [filter];
        } else {
            var filter = sub.filters[0];
        }
        var blur = blurred ? Tier.BLUR : 0;
        sub.tween = this.game.add.tween(filter);
        sub.tween.to({ blur: blur }, Tier.FADE_TIME,
            Phaser.Easing.Cubic.Out, true);
        if (!blurred) {
            sub.tween.sub = sub;
            sub.tween.onComplete.add(function() {
                this.filters = null;
            }, sub);
        }
    };
    return group;
};
