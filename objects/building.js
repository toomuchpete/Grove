Game.Building = (function(self){
    self.type = 'building';

    self.isEntity = function() {
        return true;
    };

    self.tick = function() {
        if (this.tasks === undefined) {
            this.tasks = [];
        }

        if (this.wait > 0) {
            this.wait -= 1; 
            return;
        }

        if (this.tasks.length > 0) {
            var task = this.tasks[0];

            if (task.type !== undefined) {
                switch (task.type) {
                    case 'createUnit':
                        this.createUnitTick();
                        break;
                }
            }
        }
    };

    self.createUnitTick = function() {
        var task = this.tasks[0];

        if (Game.Unit.count(task.unitType) >= 5) {
            console.log("ERROR: Worker limit reached.");
            this.tasks.shift();
        }

        if (task.ticksRemaining === undefined) {
            task.ticksRemaining = 5;
            return;
        } else if (task.ticksRemaining > 0) {
            task.ticksRemaining -= 1;
            return;
        } else {
            if (!this.spawnUnit(task.unitType)) {
                console.log("spawnUnit failed");
            } else {
                // TODO: Unit cost
            }
            this.tasks.shift();
        }
    };

    self.spawnUnit = function(type) {
        for (var d = 1; d < 4; d++) {
            for (var dx = -1*d; dx <= d; dx++) {
                for (var dy = -1*d; dy <= d; dy++) {
                    var x = this.pos.x + dx;
                    var y = this.pos.y + dy;
                    if (Game.Map.getEntity(x,y) === undefined && Game.Map.getDesignation(x,y) === undefined) {
                        var newUnit = Game.Unit.create(type);
                        if (newUnit !== undefined) {
                            Game.Map.addEntity(x, y, newUnit);
                            return true;    
                        } else {
                            console.log("ERROR: Failed to create unit.");
                            return false;
                        }
                    }
                }
            }
        }

        return false;
    };

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

    self.handleInput = function(inputType, inputData) {
        var keyCode = inputData.keyCode;

        if (inputType === 'keydown') {
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
        } else if (inputType === 'click') {
            console.log("ERROR: Buildings can't move, silly!")
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
