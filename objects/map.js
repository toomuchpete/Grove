/**
    to do:
        - plant designations
        - return task if you can't find a path
        - Make sure proper checks are done for planting.
**/

Game.Map = (function(self){
    self.ERR_BLOCKED = 1;
    self.ERR_BIG_STEP = 2;

    var noiseGenerator = new ROT.Noise.Simplex();
    var entities = {};
    var designations = {};

    self.height = 100;
    self.width = 100;

    var entityIndex = function(x,y) { return x + "," + y; };

    // "Tiles" refer to map squares. "Entities" refer to game objects that sit on tiles.

    self.getTile = function(x,y) {
        var bgColors = {r: [72,80], g: [85,100], b: [35,50]};

        var noise = noiseGenerator.get(x/40,y/40);
        var r = Math.floor(bgColors.r[0] + Math.abs(noise)*(bgColors.r[1]-bgColors.r[0]));
        var g = Math.floor(bgColors.g[0] + Math.abs(noise)*(bgColors.g[1]-bgColors.g[0])); 
        var b = Math.floor(bgColors.b[0] + Math.abs(noise)*(bgColors.b[1]-bgColors.b[0]));
        var color = "rgb(" + r + "," + g + "," + b + ")";
    
        if (self.selection && self.selection.x === x && self.selection.y === y) {
            color = '#004000';
        }

        return new Game.Tile.land(0, color);
    };

    self.getEntity = function(x,y) {
        return entities[entityIndex(x,y)];
    };

    self.addEntity = function(x, y, entity) {
        if (self.getEntity(x,y) !== undefined) {
            console.log("ERROR: Two entities may not occupy the same tile.");
            return Game.Map.ERR_BLOCKED;
        }

        entity.setPos(x,y);
        entities[entityIndex(x,y)] = entity;
    };

    self.isPassable = function(x,y) {
        var t = self.getEntity(x,y);

        if (t === undefined) {
            return true;
        }

        return t.isPassable();
    };

    self.select = function(x, y) {
        if (x >= 0 && y >= 0) {
            self.selection = {x: x, y: y};
        } else {
            this.selection = undefined;
        }
    };

    self.moveSelection = function(dx, dy) {
        var width = self.width;
        var height = self.height;

        if (this.selection === undefined) {
            return false;
        }

        var newSelectedX = this.selection.x + dx;

        if (newSelectedX >= width) {
            newSelectedX = width-1;
        } else if (newSelectedX < 0) {
            newSelectedX = 0;
        }

        var newSelectedY = this.selection.y + dy;

        if (newSelectedY >= height) {
            newSelectedY = height-1;
        } else if (newSelectedY < 0) {
            newSelectedY = 0;
        }

        this.select(newSelectedX, newSelectedY);
    };

    self.getSelected = function() {
        if (self.selection === undefined) {
            return undefined;
        }

        var x = self.selection.x;
        var y = self.selection.y;

        return self.getEntity(x,y) || self.getTile(x,y);
    };

    self.removeEntity = function(entity) {
        var entityPos = entity.getPos();
        var entityIdx = entityIndex(entityPos.x, entityPos.y);

        delete entities[entityIdx];
        entity.setPos();
    };

    self.getEntities = function() {
        return entities;
    };

    self.tick = function() {
        for (var e in entities) {
            if (!entities.hasOwnProperty(e)) {
                continue;
            }

            entities[e].tick();
        }

        Game.Aura.calculateAuras();
    }

    // Motion Manager:
    self.getRoute = function(fromEntity, targetX, targetY) {
        if (fromEntity === undefined || fromEntity.getPos() === undefined || fromEntity.getPos().x === undefined || fromEntity.getPos().y === undefined) {
            return undefined;
        };

        var path = [];

        var pf = new ROT.Path.Dijkstra(targetX, targetY, function(x,y) {
            if (x === fromEntity.pos.x && y === fromEntity.pos.y) {
                return true;
            }

            return Game.Map.isPassable(x,y);
        }, {topology: 4});

        var entityPos = fromEntity.getPos();

        pf.compute(entityPos.x, entityPos.y, function(x,y){
            if (x === entityPos.x && y === entityPos.y) {
                return;
            }

            path.push({x: x, y: y});
        });

        return path;
    };

    self.moveEntityTo = function(entity, targetX, targetY) {
        var newIndex = entityIndex(targetX,targetY);
        var e = entity;
        var entityPos = e.getPos();
        var oldIndex = entityIndex(entityPos.x,entityPos.y);

        if (self.squareDistance(entityPos.x, entityPos.y, targetX, targetY) > 1) {
            console.log("ERROR: too big of a step!");
            return Game.Map.ERR_BIG_STEP;
        }

        if (entities[newIndex] !== undefined) {
            return Game.Map.ERR_BLOCKED;
        }

        self.removeEntity(e);
        self.addEntity(targetX,targetY,e);
        return true;
    };

    self.getDesignation = function(x, y) {
        return designations[entityIndex(x,y)];
    };

    self.removeDesignation = function(x, y) {
        delete designations[entityIndex(x,y)];
    }

    self.designate = function(object, x, y) {
        if (self.getDesignation(x,y) === undefined) {
            designations[entityIndex(x,y)] = object;
        } else {
            return false;
        }
    };

    self.squareDistance = function(x1,y1,x2,y2) {
        return (Math.abs(x1 - x2) + Math.abs(y1 - y2));
    }

    return self;
}({}));
