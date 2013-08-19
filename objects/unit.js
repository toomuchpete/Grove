Game.Unit = (function(self){
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

        if (this.tasks.length === 0) {
            var newTask = Game.TaskManager.getTask();
            if (newTask !== undefined) {
                this.tasks.unshift(newTask);
            } else {
                return;
            }
        }

        var task = this.tasks[0];

        switch (task.type) {
            case 'harvest':
                this.harvestTick();
                break;
            case 'moveNextTo':
                this.moveNextToTick();
                break;
            case 'plant':
                this.plantTick();
                break;
        };
    };

    self.moveNextToTick = function() {
        // Can we reach the spot?
        var task = this.tasks[0];
        var myPos = this.getPos();
        var taskPos = task.pos;

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            delete this.route;
            this.tasks.shift();
        } else if (this.route === undefined) {
            this.route = Game.Map.getRoute(this, task.pos.x, task.pos.y);
        } else {
            var nextStep = this.route.shift();
            Game.Map.moveEntityTo(Game.Map.getEntity(myPos.x, myPos.y), nextStep.x, nextStep.y);
            // self.wait = 1;
        }
    };

    self.harvestTick = function() {
        var task = this.tasks[0];

        // Can we reach the spot?
        var myPos = this.getPos();
        var taskPos = task.pos;

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            if (task.ticksRemaining === undefined) {
                task.ticksRemaining = 5;
            } else if (task.ticksRemaining > 0) {
                task.ticksRemaining -= 1;
            } else {
                var harvestedEntity = Game.Map.getEntity(taskPos.x, taskPos.y);
                Game.Inventory.mergeInventory(harvestedEntity.getHarvest());
                Game.Map.removeEntity(harvestedEntity);
                Game.Sounds.harvest.play();

                this.tasks.shift();
            }
        } else {
            // We're not close enough, need to walk there first.
            this.tasks.unshift({type: 'moveNextTo', pos: taskPos});
        }
    };

    self.plantTick = function() {
        var task = this.tasks[0];

        // Can we reach the spot?
        var myPos = this.getPos();
        var taskPos = task.pos;
        var seedType = task.plant;

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            if (task.ticksRemaining === undefined) {
                task.ticksRemaining = 2;
            } else if (task.ticksRemaining > 0) {
                task.ticksRemaining -= 1;
            } else {
                if (Game.Inventory.removeItem(seedType + "_seeds") !== false) {
                    Game.Map.addEntity(taskPos.x, taskPos.y, new Game.Tile.tree(seedType));
                    Game.Sounds.plant.play();
                } else {
                    Game.Sounds.error.play();
                }

                this.tasks.shift();
            }
        } else {
            // We're not close enough, need to walk there first.
            this.tasks.unshift({type: 'moveNextTo', pos: taskPos});
        }
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

    self.create = function(type) {
        var unit;

        switch (type) {
            case 'worker':
                unit = Object.create(Game.Unit);
                unit.setGlyph(new Game.Glyph("w", "#f0f0f0", "#3B5323", "#2C3D1A"));
                break;
            default:
                return undefined;
        }

        return unit; 
    };

    return self;
}({}));
