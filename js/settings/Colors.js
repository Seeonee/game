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

// Convert a hex color int into an rgb "tuple".
Color.rgb = function(color) {
    return {
        r: (color >> 16) & 0xFF,
        g: (color >> 8) & 0xFF,
        b: (color) & 0xFF
    };
}

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

// Return an 'rgba(r, g, b, a)' string.
// If you omit alpha, it will be 1.
Shades.prototype.rgba = function(alpha) {
    return this.primary.rgba(alpha);
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

    this.GREY = new Color('A4A4A4');
    this.WHITE = new Color('FFFFFF');
    this.BLACK = new Color('000000');

    this.PURPLE = new Shades(
        ['BC7DEC', 'A452E3', '902DDC', '7D0CD4', '5E06A1']);
    var purple2 = new Color('FF932B');
    this.INDIGO = new Shades(
        ['87A1ED', '5D7FE5', '3A63DE', '1747D5', '0C33A7']);
    var indigo2 = purple2;
    this.BLUE = new Shades(
        ['7ECAEB', '51B6E1', '2DA5D9', '0994D0', '046E9C']);
    var blue2 = new Color('ED206F');
    this.GREEN = new Shades(
        ['6EE9A0', '42E082', '1DD969', '00D355', '009E40']);
    var green2 = blue2;
    this.YELLOW = new Shades(
        ['FFE597', 'FFDA6A', 'FFD246', 'FFC81F', 'DAA500']);
    var yellow2 = blue2;
    this.ORANGE = new Shades(
        ['FFAA81', 'FF8A52', 'FF6E28', 'FF5300', 'F75000']);
    var orange2 = new Color('04C7F5');
    this.RED = new Shades(
        ['FF8A81', 'FF6559', 'EA2F38', 'CB1D0F', 'A10D01']);
    var red2 = orange2;

    this.MENU_PRIMARY = this.BLUE; // Default menu chrome color.
    this.MENU_SELECTION = this.WHITE; // Default menu selector color.

    // Tier color palettes.
    this.t0 = {
        c1: this.PURPLE,
        c2: purple2
    };
    this.t1 = {
        c1: this.INDIGO,
        c2: indigo2
    };
    this.t2 = {
        c1: this.BLUE,
        c2: blue2
    };
    this.t3 = {
        c1: this.GREEN,
        c2: green2
    };
    this.t4 = {
        c1: this.YELLOW,
        c2: yellow2
    };
    this.t5 = {
        c1: this.ORANGE,
        c2: orange2
    };
    this.t6 = {
        c1: this.RED,
        c2: red2
    };
    for (var i = 0; i < 7; i++) {
        var t = this['t' + i];
        t.c3 = Colors.reduce(t.c1, Colors.BG_FACTOR);
    }
};

// Even we have constants!
Colors.BG_FACTOR = 0.15;

// Restore a JSON'd Colors object.
Colors.reduce = function(color, factor) {
    if (color.primary) {
        color = color.primary;
    }
    var r = Math.floor(color._r * factor);
    var g = Math.floor(color._g * factor);
    var b = Math.floor(color._b * factor);
    var i = (r << 16) + (g << 8) + (b);
    var s = ('000000' + i.toString(16)).slice(-6);
    return new Color(s);
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
