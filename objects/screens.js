String.prototype.repeat = function(n) {
    var x = this;
    var s = '';
    for (;;) {
        if (n & 1) { s += x; }
        n >>= 1;
        if (n) { x += x; } else { break; }
    }
    return s;
}

Game.Screen = {}

Game.Screen.introScreen = {
    enter: function() {
    },

    exit: function() {
    },

    render: function(display) {
        display.drawText(1,1, "%c{yellow}Welcome to Grove!");
        display.drawText(1,2, "Click or press any key to start!");
    },

    handleInput: function(inputType, inputData) {
       Game.switchScreen(Game.Screen.playScreen);
    }
}

// Define our playing screen
Game.Screen.playScreen = {
    _tickTime: 250,
    _map: null,
    _displayPosX: 0,
    _displayPosY: 0,

    enter: function() {
        if (this._map == null) {
            this._map = Game.Map.generate(200, 80, 1, 7);

            this.startTimer();
        }

        this._viewportHeight = Game.getDisplayHeight()-1;
        this._viewportWidth = Game.getDisplayWidth();

        Game.setCommandMode('select');
        this.getMap().selectTile(0,0);
    },
    
    exit: function() {
        clearInterval(this._timer);
    },
    
    render: function(display) {
        display.clear();

        var displayWidth = this._viewportWidth;
        var displayHeight = this._viewportHeight;
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

        var statusText = '---';

        var cMode = Game.getCommandMode();
        var cOpts = Game.getCommandOpts();
        
        switch (cMode) {
            case 'select':
                statusText = 'Click a tile to see information about it.';
                break;
            case 'plant':
                if (cOpts.target) {
                    statusText = "Click to plant: " + cOpts.target + " (" + Game.Inventory.getItemCount(cOpts.target + "_seeds") + " remaining)";
                } else {
                    statusText = "Choose a type of tree to plant: Ironwood (i) or Rock Elm (r)";
                }
                break;
            case 'harvest':
                statusText = 'Click a tree to harvest it.';
                break;
            default:
                statusText = "Command mode: " + cMode;
                break;
        }

        display.drawText(1, displayHeight, statusText, displayWidth-2);
    },

    startTimer: function() {
        // http://stackoverflow.com/questions/2749244/javascript-setinterval-and-this-solution
        this._timer = setInterval((function(self) {         //Self-executing func which takes 'this' as self
            return function() {                             //Return a function in the context of 'self'
                self._map.tick();                           //Thing you wanted to run as non-window 'this'
                self.render(Game.getDisplay());
                Game.UI.render();
         }})(this), this._tickTime);
    },

    move: function(dX, dY) {
        var displayWidth = Game.getDisplayWidth();
        var displayHeight = Game.getDisplayHeight();

        this._displayPosX = Math.max(0, Math.min(this._map.getWidth() - displayWidth, this._displayPosX + dX));
        this._displayPosY = Math.max(0, Math.min(this._map.getHeight() - displayHeight, this._displayPosY + dY));
    },

    eventToPosition: function(e) {
        var pos = Game.getDisplay().eventToPosition(e);
        if (pos[0] >= 0 && pos[1] >= 0) {
            return [pos[0]+this._displayPosX, pos[1]+this._displayPosY];
        } else {
            return false;
        }
    },
    
    ensureSelectionWithinViewport: function() {
        var x = this.getMap()._selectedX;
        var y = this.getMap()._selectedY;
        var vx = this._displayPosX;
        var vy = this._displayPosY;
        var vh = this._viewportHeight;
        var vw = this._viewportWidth;
        var margin = 5;

        if (x < vx+margin) {
            this.move(x - (vx+margin), 0);
        }

        if (x >= vx+vw-5) {
            this.move(x - (vx+(vw-1)-(margin)), 0);
        }

        if (y < vy) {
            this.move(0, y - (vy+margin));
        }

        if (y >= vy+vh-5) {
            this.move(0, y - (vy+(vh-1)-margin));
        }
    },

    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var pos = this.getMap().getSelectedPos();
            var move_magnitude = 1;
            if (inputData.shiftKey) {
                move_magnitude += 10;
            }

            // Selection Movement
            if (inputData.keyCode === ROT.VK_LEFT) {
                this.getMap().moveSelection(-1 * move_magnitude, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.getMap().moveSelection(move_magnitude, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.getMap().moveSelection(0, -1 * move_magnitude);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.getMap().moveSelection(0, move_magnitude);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.setCommandMode('select');
            } else if (inputData.keyCode == ROT.VK_H) {
                if (pos) {
                    if (this.getMap().getTile(pos[0], pos[1]) instanceof Game.Tile.land) {
                        Game.Sounds.error.play();
                    } else {
                        Game.Inventory.mergeInventory(this.getMap().getTile(pos[0], pos[1]).getHarvest());
                        this.getMap().setTile(pos[0], pos[1], new Game.Tile.land(0));
                        Game.Sounds.harvest.play();
                    }
                } else {
                    Game.Sounds.error.play();
                }                
            } else if (inputData.keyCode == ROT.VK_P) {
                Game.setCommandMode('plant');
            } else if (Game.getCommandMode() == 'plant') {
                var seed_type = undefined;

                switch (inputData.keyCode) {
                    case ROT.VK_I:
                        seed_type = 'ironwood';
                        break;
                    case ROT.VK_R:
                        seed_type = 'rock_elm';
                        break;
                    default:
                        break;
                }

                if (seed_type && pos && this._map.getTile(pos[0], pos[1]) instanceof Game.Tile.land) {
                    if (Game.Inventory.removeItem(seed_type + "_seeds") !== false) {
                        this._map.setTile(pos[0], pos[1], new Game.Tile.tree(seed_type));
                        Game.Sounds.plant.play();
                    } else {
                        Game.Sounds.error.play();
                    }
                }
            }

            this.ensureSelectionWithinViewport();
        } else if (inputType === 'click') {
            var pos = this.eventToPosition(inputData);

            if (pos) {
                this.getMap().selectTile(pos[0], pos[1]);
            } else {
                this.getMap().selectTile();
            }

            Game.UI.render();
        }
    },

    getMap: function() { return this._map; }
}
