// Action for moving along paths.
var MoveAction = function(editor) {
    this.editor = editor;
    this.paths = this.editor.paths;
}

// Handle an update while tilting the joystick.
MoveAction.prototype.update = function() {
    var joystick = this.paths.gpad.getAngleAndTilt();
    this.editor.move(joystick.angle, joystick.tilt);
    this.editor.action = undefined;
};
