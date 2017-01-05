// Set up a sentry.
var CreateSentryIState = function(handler, level) {
    FinalCreateIState.call(this, handler, level, Sentry, 1);
    this.showArrows = false;
};

CreateSentryIState.prototype = Object.create(FinalCreateIState.prototype);
CreateSentryIState.prototype.constructor = CreateSentryIState;


// Update loop.
CreateSentryIState.prototype.update = function() {
    this.finished(new Sentry());
};
