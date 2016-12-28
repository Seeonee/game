// Display an overlay with various controls.
var EditControlsIState = function(handler, level) {
    IState.call(this, EditControlsIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;

    var sub = this.avatar.help.sub;
    var style = sub.style;
    this.text = this.game.add.text(
        EditControlsIState.COLUMN_X_OFFSET,
        sub.y, '', style);
    this.avatar.help.addChild(this.text);
    this.text.visible = false;
};

EditControlsIState.NAME = 'controls';
EditControlsIState.prototype = Object.create(IState.prototype);
EditControlsIState.prototype.constructor = EditControlsIState;

// Hooray for constants!
EditControlsIState.COLUMN_X_OFFSET = 120;
EditControlsIState.CURTAIN_W = 430;
EditControlsIState.CURTAIN_H = 425;
EditControlsIState.DEADZONE_X_OFFSET = 150;
EditControlsIState.DEADZONE_Y_OFFSET = 150;


// Called when we become the active state.
EditControlsIState.prototype.activated = function(prev) {
    // Update the text overlay in case buttons have changed.
    var bm = this.buttonMap;
    var c = bm.buttonName;

    var s = 'controls\n';
    s += c(bm.SELECT) + '\n';
    s += c(bm.CANCEL) + '\n';
    s += c(bm.CANCEL) + ' (hold)\n';
    s += c(bm.CANCEL) + ' (hold)\n';
    s += c(bm.EDIT_CUSTOMIZE) + '\n';
    s += c(bm.EDIT_DISABLE) + '\n';
    s += c(bm.EDIT_FLOAT) + '\n';
    s += c(bm.EDIT_STEP_UP) + '\n';
    s += c(bm.EDIT_STEP_DOWN) + '\n';
    s += c(bm.EDIT_STEP_UP) + ' (hold)\n';
    s += c(bm.EDIT_STEP_DOWN) + ' (hold)\n';
    s += c(bm.EDIT_MODE_LEFT) + c(bm.EDIT_MODE_RIGHT) + '\n';
    s += c(bm.SELECT) + ' (hold)';

    var s2 = '';
    s2 += 'add point\n';
    s2 += 'delete point\n';
    s2 += 'delete point & merge paths\n';
    s2 += '(on last point) delete tier\n';
    s2 += 'customize point\n';
    s2 += 'disable/enable point\n';
    s2 += 'toggle hover mode\n';
    s2 += 'ascend tier\n';
    s2 += 'descend tier\n';
    s2 += '(on top tier) new tier above\n';
    s2 += '(on bottom tier) new tier below\n';
    s2 += 'cycle menu options\n';
    s2 += 'activate certain menu options';
    this.text.visible = true;
    this.text.setText(s2);

    this.avatar.help.setText(EditLevelIHandler.addArrows(s));
    this.avatar.help.setCurtainDimensions(
        EditControlsIState.CURTAIN_W, EditControlsIState.CURTAIN_H);
};

// Called when we become the inactive state.
EditControlsIState.prototype.deactivated = function(next) {
    this.text.visible = false;
};

// Called on update.
EditControlsIState.prototype.update = function() {
    if (this.handler.cycle()) {
        return this.handler.state.update();
    }
    return false;
};
