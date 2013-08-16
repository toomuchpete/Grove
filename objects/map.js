Game.Map = (function(self){
    var entities = [];
    self.tiles = [];

    self.getTile = function(x,y) {
        if (self.tiles[x] === undefined) {
            return undefined;
        }

        return self.tiles[x][y];
    };

    self.setTile = function(x, y, tile) {
        if (x < 0 || x >= self.width || y < 0 || y >= self.height) {
            console.log("Illegal tile coordinates");
        } else {
            if (self.tiles[x][y].isEntity()) {
                self.tiles[x][y]._pos = undefined;
                self.removeEntity(self.tiles[x][y]);    
            }
            
            tile._pos = [x,y];
            self.tiles[x][y] = tile;

            if (tile.isEntity()) {
                entities.push(tile);
            }

            if (this.selection !== undefined && x === this.selection.x && y === this.selection.y) {
                tile.getGlyph().selected(true);
            }
        }
    };

    self.isPassable = function(x,y) {
        var t = self.getTile(x,y);

        if (t === undefined) {
            return false;
        }

        return self.getTile(x,y).isPassable();
    };

    self.generate = function(width, height) {
        self.tiles = [];

        for (var x = 0; x < width; x++) {
            self.tiles.push([]);
            for (var y = 0; y < height; y++) {
                self.tiles[x].push(new Game.Tile.land(0));
            }
        }

        self.height = self.tiles[0].length;
        self.width  = self.tiles.length;
    };

    self.selectTile = function(x, y) {
        if (this.getSelectedTile() !== undefined) {
            this.getSelectedTile().getGlyph().selected(false);
        }

        if (x >= 0 && y >= 0) {
            self.selection = {x: x, y: y};

            this.getSelectedTile().getGlyph().selected(true);
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

        this.selectTile(newSelectedX, newSelectedY);
    };

    self.getSelectedTile = function() {
        if (self.selection === undefined) {
            return undefined;
        }

        return self.tiles[self.selection.x][self.selection.y];
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
        for (var i = 0; i < entities.length; i++) {
            entities[i].tick();
        }

        Game.Aura.calculateAuras();
    }

    return self;
}({}));
