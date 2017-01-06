// A group intended to create various subgroups for z-layers.
var BitmapCache = function(game) {
    this.game = game;
    this.cache = {};
    this.game.scale.onFullScreenChange.add(this.gameResized, this);
    this.game.scale.onSizeChange.add(this.gameResized, this);
};


// Add an object to the cache.
BitmapCache.prototype.get = function(painter, redrawOnResize) {
    if (this.cache[painter]) {
        return this.cache[painter].bitmap;
    }
    var cbm = new BitmapCache.CachedBitmap(this.game,
        painter, redrawOnResize);
    this.cache[painter] = cbm;
    return cbm.bitmap;
};

// Notify cache objects that the game has resized.
BitmapCache.prototype.gameResized = function() {
    var keys = Object.keys(this.cache);
    for (var i = 0; i < keys.length; i++) {
        var cbm = this.cache[keys[i]];
        cbm.gameResized();
    }
};








// A cached object.
BitmapCache.CachedBitmap = function(game, painter, redrawOnResize) {
    this.painter = painter;
    this.redrawOnResize = redrawOnResize;
    this.bitmap = game.add.bitmapData(1, 1);
    this.painter.call(null, this.bitmap);
};


// A cached object.
BitmapCache.CachedBitmap.prototype.gameResized = function() {
    if (this.redrawOnResize) {
        this.bitmap.context.clearRect(0, 0,
            this.bitmap.width, this.bitmap.height);
        this.painter.call(null, this.bitmap);
    }
};
