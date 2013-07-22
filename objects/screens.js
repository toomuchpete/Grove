Game.Screen = {}

Game.Screen.introScreen = {
    enter: function() {
        console.log("Entered start screen.");
    },

    exit: function() {
        console.log("Left start screen.");
    },

    render: function(display) {
        display.drawText(1,1, "%c{yellow}Welcome to Grove!");
        display.drawText(1,2, "Press [Enter] to start!");
    },

    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}

// Define our playing screen
Game.Screen.playScreen = {
    _map: null,
    _displayPosX: 0,
    _displayPosY: 0,

    enter: function() {
        console.log("Entered play screen."); 

        if (this._map == null) {
            this._map = Game.Map.generate(200, 80, 1, 7);
        }
    },
    
    exit: function() {
        console.log("Exited play screen.");
    },
    
    render: function(display) {
        var displayWidth = Game.getDisplayWidth();
        var displayHeight = Game.getDisplayHeight();
        var offsetX = this._displayPosX;
        var offsetY = this._displayPosY

       for (var x = 0; x < displayWidth; x++) {
            for (var y = 0; y < displayHeight; y++) {
                // Fetch the glyph for the tile and render it to the screen
                var glyph = this._map.getTile(x+offsetX, y+offsetY).getGlyph();
                display.draw(x, y,
                    glyph.getChar(), 
                    glyph.getForeground(), 
                    glyph.getBackground());
            }
        }
    },

    move: function(dX, dY) {
        var displayWidth = Game.getDisplayWidth();
        var displayHeight = Game.getDisplayHeight();

        this._displayPosX = Math.max(0, Math.min(this._map.getWidth() - displayWidth, this._displayPosX + dX));
        this._displayPosY = Math.max(0, Math.min(this._map.getHeight() - displayHeight, this._displayPosY + dY));
    },
    
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // Movement
            if (inputData.keyCode === ROT.VK_LEFT) {
                this.move(-1, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.move(1, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.move(0, -1);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1);
            }
        }    
    }
}
