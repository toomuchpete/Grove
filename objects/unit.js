Game.Unit = (function(self){
    self.tasks = [];
    self.wait = 0;

    self.isEntity = function() {
        return true;
    };

    self.tick = function() {
        if (self.wait > 0) {
            self.wait -= 1; 
            return;
        }

        if (self.tasks[0] === undefined) {
            self.tasks[0] = Game.TaskManager.getTask();
            if (self.tasks[0] === undefined) {
                return;
            }
        }

        var task = self.tasks[0];

        switch (task.type) {
            case 'harvest':
                self.harvestTick();
                break;
            case 'moveNextTo':
                self.moveNextToTick();
                break;
        };
    };

    self.moveNextToTick = function() {
        // Can we reach the spot?
        var task = self.tasks[0];
        var myPos = self.getPos();
        var taskPos = task.pos;

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            self.route = undefined;
            self.tasks.shift();
        } else if (self.route === undefined) {
            self.route = Game.Map.getRoute(self, task.pos.x, task.pos.y);
        } else {
            var nextStep = self.route.shift();
            Game.Map.moveEntityTo(Game.Map.getEntity(myPos.x, myPos.y), nextStep.x, nextStep.y);
            // self.wait = 1;
        }
    };

    self.harvestTick = function() {
        var task = self.tasks[0];

        // Can we reach the spot?
        var myPos = self.getPos();
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

                self.tasks.shift();
            }
        } else {
            // We're not close enough, need to walk there first.
            self.tasks.unshift({type: 'moveNextTo', pos: taskPos});
        }        
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
        self.pos = {x: x, y: y};
    };

    self.getPos = function() {
        return self.pos;
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
