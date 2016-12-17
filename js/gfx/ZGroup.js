// A group intended to create various subgroups for z-layers.
var ZGroup = function(level, layerNames) {
    this.level = level;
    Phaser.Group.call(this, this.level.game);
    // this.game.add.existing(this);
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
// It also contains a tier() method which 
// will return (and if necessary instantiate)
// a subgroup for the currently selected tier.
ZGroup.prototype.createSubgroup = function(name, asChild) {
    asChild = asChild == undefined ? true : asChild;
    var group = asChild ? this.game.add.group(this) : this.game.add.group();
    group.level = this.level;
    group.tierSubs = {};
    group.tier = function() {
        var sub = this;
        if (this.level.tier) {
            var t = this.level.tier.name;
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
    this.layers.push(group);
    this[name] = group;
};
