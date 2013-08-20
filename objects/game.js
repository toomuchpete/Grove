var Game = (function(self){
    var displayWidth = 100, displayHeight = 35, currentScreen, map, commandMode;
    var display = new ROT.Display({width: displayWidth, height: displayHeight, fontFamily: 'Ubuntu Mono'});

    var bindEventToScreen = function(event, element) {
        $(element || window).on(event, function(e) {
            // When an event is received, send it to the
            // screen if there is one
            var scr  = Game.getScreen();
            var disp = Game.getDisplay();
            if (scr !== null) {
                // Send the event type and data to the screen
                scr.handleInput(event, e);

                disp.clear();
                scr.render(disp);
            }
        });
    }

    bindEventToScreen('keydown');
    bindEventToScreen('click', display.getContainer());
    // bindEventToScreen('touchstart');
    // bindEventToScreen('keyup');
    // bindEventToScreen('keypress');


    self.setup = function() {
        Game.Inventory.addItem('ironwood_seeds', 2);
        Game.Inventory.addItem('rock_elm_seeds', 2);
    }

    self.setDisplayWidth = function(w) {
        displayWidth = w;
        display.setOptions({width: w});
    };

    self.getDisplayWidth = function() {
        return displayWidth;
    };

    self.getDisplayHeight = function() {
        return displayHeight;
    };

    self.getDisplay = function() {
        return display;
    };

    self.switchScreen = function(screen) {
        if (currentScreen !== undefined) {
            currentScreen.exit();
        }

        display.clear();

        currentScreen = screen;

        if (currentScreen !== undefined) {
            currentScreen.enter();
            currentScreen.render(display);
        }
    };

    self.getScreen = function() {
        return currentScreen;
    };

    self.setCommandMode = function(mode) {
        commandMode = mode;
    };

    self.getCommandMode = function() {
        return commandMode;
    }

    return self;
}({}));
