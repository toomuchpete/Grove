Game.Building = (function(self){
    self.tasks = [];
    self.type = 'building';

    self.isEntity = function() {
        return true;
    };

    self.tick = function() {
    }

    self.getGlyph = function() {
        return this.glyph;
    };

    self.setGlyph = function(g) {
        this.glyph = g;
    };

    self.isPassable = function() {
        return false;
    };

    self.setPos = function(x, y) {
        this.pos = {x: x, y: y};
    };

    self.getPos = function() {
        return this.pos;
    };

    self.handleInput = function(inputData) {
        var keyCode = inputData.keyCode;

        if (this.mode === 'create') {
            if (keyCode === ROT.VK_ESCAPE) {
                delete this.mode;
            } else if (keyCode === ROT.VK_W) {
                if (Game.Unit.count('worker') < 5) {
                    this.tasks.push({type: 'createUnit', unitType: 'worker'});    
                } else {
                    console.log("ERROR: Worker limit reached.");
                }
            } else {
                Game.Sounds.error.play();
            }
        } else if (keyCode === ROT.VK_ESCAPE) {
            return false;
        } else if (keyCode === ROT.VK_C) {
            this.mode = 'create';
        } else if (keyCode === ROT.VK_SLASH) {
            console.log(this.tasks);
        }

        return true;
    }

    self.create = function(type) {
        var unit;

        switch (type) {
            case 'workshop':
                unit = Object.create(Game.Building);
                unit.setGlyph(new Game.Glyph("O", "#f0f0f0"));
                unit.subtype = 'workshop';
                break;
            default:
                return undefined;
        }

        return unit; 
    };

    return self;
}({}));
