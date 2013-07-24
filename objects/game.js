var Game = {
    _display: null,
    _currentScreen: null,
    _displayWidth: 100,
    _displayHeight: 35,

    init: function() {
        this._display = new ROT.Display({width: this._displayWidth, height: this._displayHeight});

        var game = this;

        var bindEventToScreen = function(event) {
            addEventListener(event, function(e) {
                // When an event is received, send it to the
                // screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e);

                    game.getDisplay().clear();
                    game._currentScreen.render(game.getDisplay());
                }
            });
        }

        bindEventToScreen('keydown');
        bindEventToScreen('click');
        bindEventToScreen('touchstart');
        // bindEventToScreen('keyup');
        // bindEventToScreen('keypress');
    },

    getDisplay: function() {
        return this._display
    },
    setDisplayWidth: function(w) {
        this._displayWidth = w;
        this._display.setOptions({width: w});
    },
    getDisplayWidth: function() {
        return this._displayWidth;
    },
    getDisplayHeight: function() {
        return this._displayHeight;
    },

    switchScreen: function(screen) {
        // If we had a screen before, notify it that we exited
        if (this._currentScreen !== null) {
            this._currentScreen.exit();
        }
        // Clear the display
        this.getDisplay().clear();
        // Update our current screen, notify it we entered
        // and then render it
        this._currentScreen = screen;
        if (!this._currentScreen !== null) {
            this._currentScreen.enter();
            this._currentScreen.render(this._display);
        }
    }
}
