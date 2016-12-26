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
    group.tierSubs = {};
    group.tier = function() {
        var sub = this;
        if (this._level.tier) {
            var t = this._level.tier.name;
            sub = this.tierSubs[t];
            if (!sub) {
                sub = this.game.add.group(this);
                this.tierSubs[t] = sub;
            }
        }
        return sub;
    };
    group.setVisibleFor = function(tier, visible) {
        var sub = this.tierSubs[tier.name];
        if (sub) {
            sub.visible = visible;
        }
    };
    return group;
};
