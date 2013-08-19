Game.Unit = (function(self){
    self.isEntity = function() {
        return true;
    };

    self.tick = function() {
        if (self.currentTask === undefined) {
            self.currentTask = Game.TaskManager.getTask();
            if (self.currentTask) {
                console.log("Now performing new task...", self.currentTask);
            } else {
                return;
            }
        }

        var task = self.currentTask;

        if (task.type === 'harvest') {
            self.harvestTick();
        }
    };

    self.harvestTick = function() {
        var task = self.currentTask;

        if (task.type !== 'harvest' || self.getPos() === undefined) {
            console.log("Waiting...", task.type, self.getPos());
            return false;
        }

        // Can we reach the spot?
        var myPos = self.getPos();
        var taskPos = task.pos;

        if (Math.abs(myPos.x - taskPos.x) + Math.abs(myPos.y - taskPos.y) <= 1) {
            self.route = undefined;
            self.currentTask = undefined;
            console.log("We have arrived!");
        } else if (self.route === undefined) {
            console.log("\tAcquiring route...");
            self.route = Game.MotionManager.getRoute(self, task.pos.x, task.pos.y);
            console.log("\tRoute acquired. " + self.route.length + " steps.");
            console.log(self.route);
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
