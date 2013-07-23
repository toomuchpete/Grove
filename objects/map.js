Game.Map = function(tiles) {
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
};

Game.Map.generate = function(width, height, border_size, air_buffer) {
    var map = [];
    for (var x = 0; x < width; x++) {
        map.push([]);
        for (var y = 0; y < height; y++) {
            map[x].push(0);
        }
    }

    var map_generator = new ROT.Map.Cellular(width, height, {
        born: [4,5,6,7,8],
        survive: [2,3,4,5]
    });
        map_generator.randomize(0.95);

    for (var i=29; i >= 0; i--) {
        map_generator.create(i ? null : function(x,y,val) { map[x][y] = val; });
    }

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (map[x][y] == 0) {
                map[x][y] = new Game.Tile.land(0);
            } else {
                map[x][y] = new Game.Tile.tree(['rock_elm', 'ironwood'].random());
            }
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
        return Game.Tile.air;
    } else {
        return this._tiles[x][y] || Game.Tile.air;
    }
};
