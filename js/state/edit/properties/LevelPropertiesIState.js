// A state where you can press X to bring up an 
// action which edits level properties.
var LevelPropertiesIState = function(handler, level) {
    IState.call(this, LevelPropertiesIState.NAME, handler);
    this.level = level;
    this.avatar = this.level.avatar;
    new SetPropertyIState(handler, level);
};

LevelPropertiesIState.NAME = 'level properties';
LevelPropertiesIState.prototype = Object.create(IState.prototype);
LevelPropertiesIState.prototype.constructor = LevelPropertiesIState;


// Called when we become the active state.
LevelPropertiesIState.prototype.activated = function(prev) {
    this.gpad.consumeButtonEvent();
    this.avatar.htext.setText(EditLevelIHandler.addArrows('properties'));
    this.chargedTime = -1;
};

// Called when we become the inactive state.
LevelPropertiesIState.prototype.deactivated = function(next) {
    if (this.image) {
        this.image.destroy();
    }
};

// Called on update.
LevelPropertiesIState.prototype.update = function() {
    if (this.chargedTime < 0 && this.handler.cycle()) {
        return this.handler.state.update();
    }
    if (this.gpad.justPressed(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.chargedTime = this.game.time.now + EditCharge.TIME;
        this.image = new EditCharge(this.game,
            this.avatar.x, this.avatar.y,
            this.level.tier.palette, true);
        this.game.state.getCurrentState().z.mg.tier().add(this.image);
    } else if (this.gpad.justReleased(this.buttonMap.SELECT)) {
        this.gpad.consumeButtonEvent();
        this.image.destroy();
        if (this.game.time.now > this.chargedTime) {
            this.activate(SetPropertyIState.NAME);
        }
        this.chargedTime = -1;
    } else {
        return false;
    }
};








// Set a property.
var SetPropertyIState = function(handler, level) {
    this.props = {};
    this.props.mask = MaskItem.ALL_TYPES.concat([
        { text: 'none', value: false }
    ]);

    optionName = 'property';
    options = Object.keys(this.props);
    OptionSetGathererIState.call(this, handler, level, SetPropertyIState, 0,
        optionName, options);
    new SetProperty2IState(handler, level, this.props);
    new SetProperty3IState(handler, level);
};

SetPropertyIState.TYPE = 'set property';
SetPropertyIState.NAME = BaseCustomizeIState.getName(SetPropertyIState, 0);
SetPropertyIState.prototype = Object.create(OptionSetGathererIState.prototype);
SetPropertyIState.prototype.constructor = SetPropertyIState;








// Set a property.
var SetProperty2IState = function(handler, level, props) {
    this.props = props;
    var optionName = 'value';
    var options = [];
    OptionSetGathererIState.call(this, handler, level, SetPropertyIState, 1,
        optionName, options);
};

SetProperty2IState.prototype = Object.create(OptionSetGathererIState.prototype);
SetProperty2IState.prototype.constructor = SetProperty2IState;

// Set up our options.
SetProperty2IState.prototype.activated = function(prev) {
    var chosen = prev.gatherOptions().property;
    var options = ['default'];
    var possibilities = this.props[chosen];
    for (var i = 0; i < possibilities.length; i++) {
        options.push(possibilities[i]);
    }
    this.setOptions(options);
    OptionSetGathererIState.prototype.activated.call(this, prev);
};








// Set a property.
var SetProperty3IState = function(handler, level) {
    BaseCustomizeIState.call(this, handler, level, SetPropertyIState, 2);
    this.showArrows = false;
};

SetProperty3IState.prototype = Object.create(BaseCustomizeIState.prototype);
SetProperty3IState.prototype.constructor = SetProperty3IState;


// Update loop.
SetProperty3IState.prototype.update = function() {
    var options = this.prev.gatherOptions();
    var name = options.property;
    var value = options.value;
    if (value == 'default') {
        delete this.level.properties[name];
    } else {
        this.level.properties[name] = value;
    }
    this.finished();
};
