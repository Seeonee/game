// This state is responsible for the title menu.
// Eventually it'll allow a host of options:
// change settings, select levels, load/save, etc.
var TitleMenuState = function(game) {};

// The color palette to use.
TitleMenuState.prototype.init = function(palette) {
    this.palette = palette;
};

// Load our catalog.
TitleMenuState.prototype.preload = function() {
    this.game.load.json(Catalog.NAME, 'assets/catalog.json');
};

// Create the title state.
TitleMenuState.prototype.create = function() {
    this.catalog = Catalog.load(this.game.cache.getJSON(Catalog.NAME));
    this.game.input.gamepad.start();
    this.gpad = new GPad(this.game, this.game.input.gamepad.pad1);

    this.z = new ZGroup(this.game, ['bg', 'mg', 'fg']);
    this.z.createSubgroup('menu', false);

    this.menuhandler = new TitleMenuIHandler(
        this.game, this.gpad, this.palette.c1);

    this.cascader = new Cascader(this.game,
        this.z.fg, this.palette.c1.i);

    Utils.prepFullscreen(this.game);
};

// Update loop.
TitleMenuState.prototype.update = function() {
    this.cascader.update();
    this.menuhandler.update();
};

// Render loop.
TitleMenuState.prototype.render = function() {
    this.menuhandler.render();
};








// Sprite pool that automatically cascades squares 
// down the screen.
var Cascader = function(game, zgroup, color) {
    SpritePool.call(this, game, TSquare);
    this.zgroup = zgroup;
    this.color = color;
    this.time = 0;
};

Cascader.prototype = Object.create(SpritePool.prototype);
Cascader.prototype.constructor = Cascader;

// Even we get constants.
Cascader.MIN_DELAY = 1000; // ms
Cascader.VARIANCE = 100; // ms


// Spawn squares as needed.
Cascader.prototype.update = function() {
    t = this.game.time.now;
    if (t > this.time) {
        this.make(this.game).cascade(
            this.zgroup, this.color);
        var chance = Math.random();
        chance *= chance;
        var ratio = 800 / this.game.camera.width;
        this.time = t + ratio * Cascader.MIN_DELAY +
            chance * Cascader.VARIANCE;
    }
};
