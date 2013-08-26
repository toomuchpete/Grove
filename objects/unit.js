Game.Unit = (function(self){
    self.type = 'unit';

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
            var newTask = Game.TaskManager.getUnitTask();
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
            case 'build':
                this.buildTick();
                break;
        };
    };

    self.moveNextToTick = function() {
        // Can we reach the spot?
        // TODO: Check spots in order of distance to the worker
        var standingOptions = [[0,1], [1,0], [0,-1], [-1,0]].randomize();
        var task = this.tasks[0];
        var myPos = this.getPos();
        var taskPos = task.pos;
        var standPos = undefined;

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) === 1) {
            delete this.route;
            this.tasks.shift();
        } else if (this.route === undefined) {
            for (var i = 0; i < standingOptions.length; i++) {
                standPos = {x: taskPos.x + standingOptions[i][0], y: taskPos.y + standingOptions[i][1]};

                if (Game.Map.isPassable(standPos.x, standPos.y) && Game.Map.getDesignation(standPos.x, standPos.y) === undefined) {
                    break;
                } else {
                    standPos = undefined;
                }
            }

            if (standPos === undefined) {
                this.route = [];
            } else {
                this.route = Game.Map.getRoute(this, standPos.x, standPos.y);    
            }

            if (this.route.length === 0) {
                // TODO: This won't clear designations
                console.log("ERROR: No route available, all tasks cancelled");
                this.tasks = [];
            }
        } else {
            var lastStep = this.route[this.route.length-1];
            var nextStep = this.route.shift();

            if (!Game.Map.isPassable(nextStep.x, nextStep.y) || !Game.Map.isPassable(lastStep.x, lastStep.y) || Game.Map.getDesignation(lastStep.x, lastStep.y) !== undefined) {
                this.route = undefined;
                return;
            }

            var moved = Game.Map.moveEntityTo(Game.Map.getEntity(myPos.x, myPos.y), nextStep.x, nextStep.y);
            if (moved === true) {
                return true;
            } else if (moved === Game.Map.ERR_BLOCKED) {
                if (this.blocked === undefined) {
                    this.blocked = 2;
                }

                if (this.blocked > 0) {
                    // Retry
                    this.route.unshift(nextStep);
                    this.wait = 10;
                    this.blocked -= 1;
                } else {
                    // Bad route, try something else
                    delete this.blocked;
                    delete this.route;
                }
            }
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

        if (Game.Inventory.getItemCount(seedType + "_seeds") <= 0) {
            console.log("Plant task cancelled, no seeds left");
            Game.Map.removeDesignation(taskPos.x, taskPos.y);
            this.tasks.shift();
            return;
        }

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            if (task.ticksRemaining === undefined) {
                task.ticksRemaining = 2;
            } else if (task.ticksRemaining > 0) {
                task.ticksRemaining -= 1;
            } else {
                if (Game.Map.getEntity(taskPos.x, taskPos.y) !== undefined) {
                    // TODO: abstractify this?
                    if (this.blocked === undefined) {
                        this.blocked = 2;
                    }

                    if (this.blocked > 0) {
                        // Retry
                        this.wait = 10;
                        this.blocked -= 1;
                    } else {
                        // TODO: check if this is a worker, if so, add a task to move out of the way
                        console.log("Plant task cancelled, position blocked");
                        Game.Map.removeDesignation(taskPos.x, taskPos.y);
                        this.tasks.shift();
                    }
                }

                if (Game.Inventory.removeItem(seedType + "_seeds") !== false) {
                    Game.Map.addEntity(taskPos.x, taskPos.y, new Game.Tile.tree(seedType));
                    Game.Sounds.plant.play();
                } else {
                    Game.Sounds.error.play();
                }

                // TODO: DRY this up
                Game.Map.removeDesignation(taskPos.x, taskPos.y);
                this.tasks.shift();
            }
        } else {
            // We're not close enough, need to walk there first.
            this.tasks.unshift({type: 'moveNextTo', pos: taskPos});
        }
    };

    self.buildTick = function() {
        var task = this.tasks[0];

        // Can we reach the spot?
        var myPos = this.getPos();
        var taskPos = task.pos;
        var building = task.building;

        if (Game.Inventory.getItemCount("wood") < 10) {
            console.log("Build task cancelled, not enough wood left");
            Game.Map.removeDesignation(taskPos.x, taskPos.y);
            this.tasks.shift();
            return;
        }

        if (Game.Map.squareDistance(myPos.x, myPos.y, taskPos.x, taskPos.y) <= 1) {
            if (task.ticksRemaining === undefined) {
                task.ticksRemaining = 2;
            } else if (task.ticksRemaining > 0) {
                task.ticksRemaining -= 1;
            } else {
                if (Game.Map.getEntity(taskPos.x, taskPos.y) !== undefined) {
                    // TODO: abstractify this?
                    if (this.blocked === undefined) {
                        this.blocked = 2;
                    }

                    if (this.blocked > 0) {
                        // Retry
                        this.wait = 2;
                        this.blocked -= 1;
                    } else {
                        // TODO: check if this is a worker, if so, add a task to move out of the way
                        console.log("Build task cancelled, position blocked");
                        Game.Map.removeDesignation(taskPos.x, taskPos.y);
                        this.tasks.shift();
                    }
                }

                if (Game.Inventory.removeItem('wood', 10) !== false) {
                    Game.Map.addEntity(taskPos.x, taskPos.y, Game.Building.create(building));
                    Game.Sounds.plant.play();
                } else {
                    Game.Sounds.error.play();
                }

                // TODO: DRY this up
                Game.Map.removeDesignation(taskPos.x, taskPos.y);
                this.tasks.shift();
            }
        } else {
            // We're not close enough, need to walk there first.
            this.tasks.unshift({type: 'moveNextTo', pos: taskPos});
        }
    };

    self.handleInput = function(inputType, inputData) {
        if (inputType === 'click') {
            var pos = Game.getScreen().eventToPosition(inputData);

            if (pos) {
                this.tasks.push({type: 'moveNextTo', pos: {x: pos[0], y: pos[1]}});
                return false;
            }
        }

        return true;
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

    self.create = function(type) {
        var unit;

        switch (type) {
            case 'worker':
                unit = Object.create(Game.Unit);
                unit.setGlyph(new Game.Glyph("w", "#f0f0f0"));
                unit.subtype = 'worker';
                break;
            default:
                return undefined;
        }

        return unit; 
    };

    return self;
}({}));

Game.Unit.count = function(type) {
    var entities = Game.Map.getEntities();
    var count = 0;

    for (var id in entities) {
        if (!entities.hasOwnProperty(id)) {
            continue;
        }

        if (type === undefined || (entities[id].subtype !== undefined && entities[id].subtype === type)) {
            count += 1;
        }
    }

    return count;
};
