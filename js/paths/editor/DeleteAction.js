// Action for deleting nodes and paths.
var DeleteAction = function(editor) {
    this.editor = editor;
    this.start = this.editor.game.time.now;
    this.threshold = 1000;
    this.editor.children[0].tint = this.editor.game.settings.colors.RED.i;
}

// Handle an update while holding the button.
DeleteAction.prototype.update = function() {
    var elapsed = Math.min(this.editor.game.time.now - this.start, this.threshold);
    var ratio = elapsed / this.threshold;
    if (ratio == 1) {
        this.editor.children[0].tint = this.editor.game.settings.colors.GREY.i;
    }
    if (this.editor.justReleased(this.editor.game.settings.buttonMap.DELETE_BUTTON)) {
        if (this.editor.point) {
            if (ratio < 1) {
                // Delete the point and its paths.
                this.editor.paths.deletePoint(this.editor.point);
            } else {
                // Delete the point, merge its paths.
                this.editor.paths.deletePointAndMerge(this.editor.point);
            }
            this.editor.point = undefined;
        } else if (this.editor.path) {
            this.editor.paths.deletePath(this.editor.path);
            this.editor.path = undefined;
        }
        this.editor.children[0].tint = this.editor.graphics.COLOR;
        this.editor.action = undefined; // We're done.
    }
};
