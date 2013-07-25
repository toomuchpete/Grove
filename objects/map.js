Game.Map = function(tiles) {
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
    this._entities = [];
};

Game.Map.generate = function(width, height, border_size, air_buffer) {
    var map = [];
    for (var x = 0; x < width; x++) {
        map.push([]);
        for (var y = 0; y < height; y++) {
            map[x].push(new Game.Tile.land(0));
        }
    }

    return new Game.Map(map);
}

// Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};
Game.Map.prototype.getHeight = function() {
    return this._height;
};

// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y) {
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return null;
    } else {
        return this._tiles[x][y];
    }
};

Game.Map.prototype.setTile = function(x, y, tile, addEntity) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        console.log("Illegal tile coordinates");
    } else {
        if (this._tiles[x][y].isEntity()) {
            this.removeEntity(this._tiles[x][y]);    
        }
        
        this._tiles[x][y] = tile;

        if (tile.isEntity()) {
            this.addEntity(x,y,tile);    
        }
    }
}

Game.Map.prototype.removeEntity = function(entity) {
    var i = this._entities.indexOf(entity);

    if (i >= 0) {
        this._entities.splice(i, 1);
    } else {
        return false;
    }
}

Game.Map.prototype.addEntity = function(x,y,entity) {
    this._tiles[x][y] = entity;
    this._entities.push(entity);
}

Game.Map.prototype.tick = function() {
    for (var i = 0; i < this._entities.length; i++) {
        this._entities[i].tick();
    }
};
