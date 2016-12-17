// Title menu input handling.
var TitleMenuIHandler = function(game, gpad, color) {
    IHandler.call(this, game, gpad);
    new PressStartIState(this);
    new TitleMenuIState(this, color);

    // Set our starting state.
    this.activate(PressStartIState.NAME);
};

TitleMenuIHandler.prototype = Object.create(IHandler.prototype);
TitleMenuIHandler.prototype.constructor = TitleMenuIHandler;
