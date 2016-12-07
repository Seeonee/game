// Base utils class.
var Utils = function() {
    // Initialize constants here.
};

// Global methods.

// Basic angle function.
Utils.angleBetweenPoints = function(x1, y1, x2, y2) {
    return Math.atan2(x2 - x1, y2 - y1);
}

// Basic distance function.
Utils.distanceBetweenPoints = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Get the angle between two angles, restricted to 
// the range [0, Math.PI].
Utils.getBoundedAngleDifference = function(a1, a2) {
    return Math.abs(((a1 - a2 + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI);
}

// Color objects for widespread reuse.
var COLOR = function(s) {
    if (Array.isArray(s)) {
        this.s = '#' + s[2];
        this.i = parseInt(s[2], 16);
        this.l = new COLOR(s[0]);
        this.ll = new COLOR(s[1]);
        this.d = new COLOR(s[3]);
        this.dd = new COLOR(s[4]);
    } else {
        this.s = '#' + s;
        this.i = parseInt(s, 16);
        this.l = this;
        this.ll = this;
        this.d = this;
        this.dd = this;
    }
};
COLOR.BLUE = new COLOR('2CABD9');
COLOR.RED = new COLOR('D92C57');
COLOR.GREY = new COLOR('A4A4A4');
COLOR.WHITE = new COLOR('FFFFFF');

// COLOR.GREEN2 = new COLOR(['7BEFAE', '4DE890', '26E278', '00DA5F', '00B04D']);
// COLOR.BLUE2 = new COLOR(['7ECAEB', '51B6E1', '2DA5D9', '0994D0', '046E9C']);
// COLOR.YELLOW2 = new COLOR(['FFC483', 'FFAE54', 'FF9B2B', 'FF8700', 'F78200']);
// COLOR.RED2 = new COLOR(['FF9D83', 'FF7854', 'FF572B', 'FF3500', 'F73300']);
