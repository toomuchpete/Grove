Game.Map = (function(self){
    var entities = {};
    var tiles = [];

    var entityIndex = function(x,y) { return x + "," + y; };

    // "Tiles" refer to map squares. "Entities" refer to game objects that sit on tiles.

    self.getTile = function(x,y) {
        if (tiles[x] === undefined) {
            return undefined;
        }

        return tiles[x][y];
    };

    self.getEntity = function(x,y) {
        return entities[entityIndex(x,y)];
    };

    self.getObjectAt = function(x,y) {
        return self.getEntity(x,y) || self.getTile(x,y);
    }

    self.addEntity = function(x, y, entity) {
        if (self.getEntity(x,y) !== undefined) {
            console.log("ERROR: Two entities may not occupy the same tile.");
            return false;
        }

        if (self.getTile(x,y).getGlyph().selected()) {
            self.getTile(x,y).getGlyph().selected(false);
            entity.getGlyph().selected(true);
        }

        entity.setPos(x,y);
        entities[entityIndex(x,y)] = entity;
    };

    self.setTile = function(x, y, tile) {
        if (x < 0 || x >= self.width || y < 0 || y >= self.height) {
            console.log("Illegal tile coordinates");
        } else {            
            tile.setPos(x,y);
            self.tiles[x][y] = tile;

            if (this.selection !== undefined && x === this.selection.x && y === this.selection.y) {
                tile.getGlyph().selected(true);
            }
        }
    };

    self.isPassable = function(x,y) {
        var t = self.getObjectAt(x,y);

        if (t === undefined) {
            return false;
        }

        return self.getObjectAt(x,y).isPassable();
    };

    self.generate = function(width, height) {
        tiles = [];

        for (var x = 0; x < width; x++) {
            tiles.push([]);
            for (var y = 0; y < height; y++) {
                tiles[x].push(new Game.Tile.land(0));
            }
        }

        self.height = tiles[0].length;
        self.width  = tiles.length;
    };

    self.select = function(x, y) {
        if (this.getSelected() !== undefined) {
            this.getSelected().getGlyph().selected(false);
        }

        if (x >= 0 && y >= 0) {
            self.selection = {x: x, y: y};

            this.getSelected().getGlyph().selected(true);
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

        return self.getObjectAt(self.selection.x, self.selection.y);
    };

    self.removeEntity = function(entity) {
        var i = entities.indexOf(entity);

        if (i >= 0) {
            entities.splice(i, 1);
        } else {
            return false;
        }
    };

    self.getEntities = function() {
        return entities;
    };

    self.tick = function() {
        for (var e in entities) {
            if (!entities.hasOwnProperty(e)) {
                continue;
            }
        }

        entities[e].tick();

        Game.Aura.calculateAuras();
    }

    return self;
}({}));
