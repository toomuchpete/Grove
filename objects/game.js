var Game = {
    _display: null,
    _currentScreen: null,
    _displayWidth: 100,
    _displayHeight: 35,
    _commandMode: null,
    _commandOpts: {},
    _selectedTile: null,

    init: function() {
        this._display = new ROT.Display({width: this._displayWidth, height: this._displayHeight, fontFamily: 'Ubuntu Mono'});

        var game = this;

        var bindEventToScreen = function(event, element) {
            (element || window).addEventListener(event, function(e) {
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
        bindEventToScreen('click', this._display.getContainer());
        bindEventToScreen('touchstart');
        // bindEventToScreen('keyup');
        // bindEventToScreen('keypress');

        this.setCommandMode('select');
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
    },

    setCommandMode: function(mode, options) {
        $(this._display.getContainer()).removeClass('commandMode-'+this._commandMode);

        this._commandMode = mode || 'select';
        this._commandOpts = options || {};

        $(this._display.getContainer()).addClass('commandMode-'+this._commandMode);
    },
    getCommandMode: function() {
        return this._commandMode;
    },

    selectTile: function(tile) {
        if (Game._selectedTile) {
            Game._selectedTile.getGlyph().toggleSelected();
        }

        Game._selectedTile = tile;

        if (tile) {
            tile.getGlyph().toggleSelected();
        }
    },
    getSelectedTile: function() {
        return this._selectedTile;
    }
}
