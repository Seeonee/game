// A color object for widespread reuse.
// Accepts a single hex string color value.
// You get an object with .s (#hex string) and 
// .i (int) representations of the color's RGB value.
var Color = function(shade) {
    this.s = '#' + shade;
    this.i = parseInt(shade, 16);
    this._r = (this.i >> 16) & 0xFF;
    this._g = (this.i >> 8) & 0xFF;
    this._b = (this.i) & 0xFF;
};

// Return an 'rgba(r, g, b, a)' string.
// If you omit alpha, it will be 1.
Color.prototype.rgba = function(alpha) {
    alpha = alpha == undefined ? 1 : alpha;
    return 'rgba(' +
        this._r + ', ' +
        this._g + ', ' +
        this._b + ', ' +
        alpha + ')';
};

// Restore a JSON'd Color object.
Color.load = function(json) {
    var shade = json.s.substring(1);
    return new Color(shade);
}

// A color shades object for widespread reuse.
// Takes an array of 5 shades, and represents the middle shade.
// Supports .l/.d for lighter/darker colors.
var Shades = function(shades) {
    this.ll = new Color(shades[0]);
    this.l = new Color(shades[1]);
    this.primary = new Color(shades[2]);
    this.d = new Color(shades[3]);
    this.dd = new Color(shades[4]);
    // Make our primary directly accessible.
    this.s = this.primary.s;
    this.i = this.primary.i;
};


// Restore a JSON'd Shades object.
Shades.load = function(json) {
    var shades = [];
    shades.push(json.ll.s.substring(1));
    shades.push(json.l.s.substring(1));
    shades.push(json.primary.s.substring(1));
    shades.push(json.d.s.substring(1));
    shades.push(json.dd.s.substring(1));
    return new Shades(shades);
}

// Initialize a container for all of our 
// defined color constants.
var Colors = function() {
    this.BACKGROUND = new Color('272822');

    this.BLUE = new Color('2CABD9');
    this.RED = new Color('D92C57');
    this.GREY = new Color('A4A4A4');
    this.WHITE = new Color('FFFFFF');
    this.BLACK = new Color('000000');

    // this.GREEN2 = new Shades(
    // ['7BEFAE', '4DE890', '26E278', '00DA5F', '00B04D']);
    // this.BLUE2 = new Shades(
    // ['7ECAEB', '51B6E1', '2DA5D9', '0994D0', '046E9C']);
    // this.YELLOW2 = new Shades(
    // ['FFC483', 'FFAE54', 'FF9B2B', 'FF8700', 'F78200']);
    // this.RED2 = new Shades(
    // ['FF9D83', 'FF7854', 'FF572B', 'FF3500', 'F73300']);

    this.PATH_COLOR = this.BLUE;
    this.DEBUG_COLOR = this.RED;
    this.MENU1 = this.WHITE; // Default menu selector color.
    this.MENU2 = this.BLUE; // Default menu chrome color.
};

// Restore a JSON'd Colors object.
Colors.load = function(json) {
    var colors = new Colors();
    var keys = Object.keys(json);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var obj = json[key];
        if (obj.primary) {
            colors[key] = Shades.load(obj);
        } else {
            colors[key] = Color.load(obj);
        }
    }
    return colors;
};

// To store your Colors object as JSON, 
// just call JSON.stringify() on it.
