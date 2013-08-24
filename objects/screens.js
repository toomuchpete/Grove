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
    _displayPosX: 0,
    _displayPosY: 0,

    enter: function() {
        this.startTimer();

        this._viewportHeight = Game.getDisplayHeight()-1;
        this._viewportWidth = Game.getDisplayWidth();

        Game.Map.addEntity(0,0,Game.Unit.create('worker'));

        Game.setCommandMode('select');
        Game.Map.select(0,0);
        this.centerSelectionWithinViewport();
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

       for (var screenX = 0; screenX < displayWidth; screenX++) {
            for (var screenY = 0; screenY < displayHeight; screenY++) {
                var x = screenX + offsetX;
                var y = screenY + offsetY;

                // Fetch the glyph for the tile and render it to the screen
                var tile = Game.Map.getTile(x, y);
                var entity = Game.Map.getEntity(x, y);
                var designation = Game.Map.getDesignation(x, y);

                var fg, bg, character;

                if (entity !== undefined) {
                    fg = entity.getGlyph().getForeground();
                    character = entity.getGlyph().getChar();
                } else if (designation !== undefined) {
                    fg = '#90A090';
                    character = '_';
                } else {
                    fg = '#ffffff';
                    character = ' ';
                }

                bg = tile.getGlyph().getBackground();

                display.draw(screenX, screenY, character, fg, bg);
            }
        }

        var statusText = '---';

        var cMode = Game.getCommandMode();
        
        switch (cMode) {
            case 'select':
                statusText = 'Select a tile to see information about it.';
                break;
            case 'plant':
                statusText = "Choose a type of tree to plant: Ironwood (i) or Rock Elm (r)";
                break;
            case 'build':
                statusText = "To build a workshop (10 wood required), press 'o'";
                break;
            default:
                statusText = "Command mode: " + cMode;
                break;
        }

        display.drawText(1, displayHeight, statusText, displayWidth-2);

        if (Game.Map.selection !== undefined) {
            var locationText = "(" + Game.Map.selection.x + ", " + Game.Map.selection.y + ")";
            display.drawText(displayWidth - locationText.length, 0, locationText);
        }
    },

    startTimer: function() {
        // http://stackoverflow.com/questions/2749244/javascript-setinterval-and-this-solution
        this._timer = setInterval((function(self) {         //Self-executing func which takes 'this' as self
            return function() {                             //Return a function in the context of 'self'
                Game.Map.tick();                           //Thing you wanted to run as non-window 'this'
                self.render(Game.getDisplay());
                Game.UI.render();
         }})(this), this._tickTime);
    },

    move: function(dX, dY) {
        var displayWidth = Game.getDisplayWidth();
        var displayHeight = Game.getDisplayHeight();

        this._displayPosX += dX;
        this._displayPosY += dY;
    },

    eventToPosition: function(e) {
        var pos = Game.getDisplay().eventToPosition(e);
        if (pos[0] >= 0 && pos[1] >= 0) {
            return [pos[0]+this._displayPosX, pos[1]+this._displayPosY];
        } else {
            return false;
        }
    },
    
    centerSelectionWithinViewport: function() {
        var x = Game.Map.selection.x;
        var y = Game.Map.selection.y;
        var vx = this._displayPosX;
        var vy = this._displayPosY;
        var vh = this._viewportHeight;
        var vw = this._viewportWidth;

        var targetDisplayX = x - Math.floor(vw/2);
        var targetDisplayY = y - Math.floor(vh/2);

        this.move(targetDisplayX - vx, targetDisplayY - vy);
    },

    ensureSelectionWithinViewport: function() {
        var x = Game.Map.selection.x;
        var y = Game.Map.selection.y;
        var vx = this._displayPosX;
        var vy = this._displayPosY;
        var vh = this._viewportHeight;
        var vw = this._viewportWidth;
        var margin = 5;

        if (x < vx+margin) {
            this.move(x - (vx+margin), 0);
        }

        if (x >= vx+vw-margin) {
            this.move(x - (vx+(vw-1)-(margin)), 0);
        }

        if (y < vy+margin) {
            this.move(0, y - (vy+margin));
        }

        if (y >= vy+vh-margin) {
            this.move(0, y - (vy+(vh-1)-margin));
        }
    },

    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var pos = Game.Map.selection;
            var move_magnitude = 1;
            if (inputData.shiftKey) {
                move_magnitude += 10;
            }

            // Selection Movement
            if (inputData.keyCode === ROT.VK_LEFT) {
                Game.Map.moveSelection(-1 * move_magnitude, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                Game.Map.moveSelection(move_magnitude, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                Game.Map.moveSelection(0, -1 * move_magnitude);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                Game.Map.moveSelection(0, move_magnitude);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.setCommandMode('select');
            } else if (inputData.keyCode === ROT.VK_H) {
                if (pos) {
                    if (Game.Map.getEntity(pos.x, pos.y) === undefined) {
                        Game.Sounds.error.play();
                    } else {
                        Game.TaskManager.addTask({type: 'harvest', pos: pos});
                    }
                } else {
                    Game.Sounds.error.play();
                }
            } else if (inputData.keyCode === ROT.VK_P) {
                Game.setCommandMode('plant');
            } else if (inputData.keyCode === ROT.VK_B) {
                Game.setCommandMode('build');
            } else if (inputData.keyCode === ROT.VK_M) {
                var entities = Game.Map.getEntities();
                var pos = Game.Map.selection;

                for (var i = 0; i < entities.length; i++) {
                    var e = entities[i];

                    var path = Game.Map.getRoute(e, pos.x, pos.y);
                }
            } else if (Game.getCommandMode() === 'plant') {
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

                if (seed_type && pos 
                    && Game.Map.getEntity(pos.x, pos.y) === undefined 
                    && Game.Map.getDesignation(pos.x, pos.y) === undefined
                    && Game.Inventory.getItemCount(seed_type + "_seeds") > 0) {
                        var task = {type: 'plant', plant: seed_type, pos: pos};
                        Game.Map.designate(task, pos.x, pos.y);
                        Game.TaskManager.addTask(task);
                } else {
                    Game.Sounds.error.play();
                }
            } else if (Game.getCommandMode() === 'build') {
                var building = undefined;

                switch (inputData.keyCode) {
                    case ROT.VK_O:
                        building = 'workshop';
                        break;
                }

                if (building !== undefined && pos !== undefined
                    && Game.Map.getEntity(pos.x, pos.y) === undefined 
                    && Game.Map.getDesignation(pos.x, pos.y) === undefined
                    && Game.Inventory.getItemCount('wood') >= 10) {
                        var task = {type: 'build', building: building, pos: pos};
                        Game.Map.designate(task, pos.x, pos.y);
                        Game.TaskManager.addTask(task);
                } else {
                    Game.Sounds.error.play();
                }

            }

            this.ensureSelectionWithinViewport();
        } else if (inputType === 'click') {
            var pos = this.eventToPosition(inputData);
            if (pos) {
                Game.Map.select(pos[0], pos[1]);

                if (inputData.shiftKey === true) {
                    this.centerSelectionWithinViewport();
                }
            } else {
                Game.Map.select();
            }

            Game.UI.render();
        }
    },
}
