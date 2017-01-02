// Catalog of all available levels.
// This doubles as a world representation 
// within the catalog; it can have any 
// number of child levels and/or catalog worlds.
var Catalog = function(name) {
    this.name = name;
    // These will be set by our parent,
    // if we have one.
    this.index = 0;
    this.parent = undefined;
    this.items = [];
};

Catalog.NAME = 'catalog';

// Return the next level after a given index
// without our set of levels/catalogs.
Catalog.prototype.add = function(item) {
    item.index = this.items.length;
    item.parent = this;
    this.items.push(item);
};

// Get our fully qualified name.
Catalog.prototype.getFullName = function() {
    var root = this.parent ? this.parent.getFullName() + '/' : '';
    return root + this.name.replaceAll(' ', '_');
};

// Return the next level at given index
// without our set of levels/catalogs.
Catalog.prototype.next = function(index) {
    index = index == undefined ? 0 : index;
    if (index >= this.items.length) {
        if (this.parent) {
            return this.parent.next(this.index + 1);
        } else {
            index = 0;
        }
    }
    var item = this.items[index];
    if (item instanceof Catalog) {
        return item.next(0);
    } else {
        return item;
    }
};

// Push out a JSON version of us.
Catalog.prototype.toJSON = function() {
    return {
        name: this.name,
        items: this.items
    };
};

// Load a JSON representation of a catalog.
Catalog.load = function(json) {
    if (!json.items) {
        return new CLevel(json.name);
    }
    var catalog = new Catalog(json.name);
    for (var i = 0; i < json.items.length; i++) {
        var itemObj = json.items[i];
        catalog.add(Catalog.load(itemObj));
    }
    return catalog;
};


// A level within the catalog.
var CLevel = function(name) {
    this.name = name;
    // These will be set by our catalog.
    this.index = undefined;
    this.parent = undefined;
};

// Get our fully qualified name.
CLevel.prototype.getFullName = function() {
    var root = this.parent ? this.parent.getFullName() + '/' : '';
    return root + this.name.replaceAll(' ', '_');
};

// Return the next level in sequence.
CLevel.prototype.next = function() {
    return this.parent.next(this.index + 1);
};

// Push out a JSON version of us.
CLevel.prototype.toJSON = function() {
    return { name: this.name };
};
