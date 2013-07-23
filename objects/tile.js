Game.Tile = function(glyph) {
    this._glyph = glyph;
};

Game.Tile.prototype.getGlyph = function() {
    return this._glyph;
};

Game.Tile.land = function(chr_index) {
    chr_options = [' ', ',', '.'];

    if (chr_index == undefined || chr_index >= chr_options.length) {
        chr = chr_options.random();
    } else  {
        chr = chr_options[chr_index];
    }
    
    this._glyph = new Game.Glyph(chr, '#526F35', '#3B5323');
}

Game.Tile.land.prototype = Game.Tile.prototype;

Game.Tile.tree = function(species_name) {
    this.species = {
        'rock_elm': {
            name: 'Rock Elm',
            chr: 'R'
        },
        'ironwood': {
            name: 'Ironwood',
            chr: 'I'
        }
    };

    var chr;
    if (this.species[species_name]) {
        chr = this.species[species_name].chr;
    } else {
        chr = '?'
    }

    // Should probably only use a subset of these colors -- using all 8 makes it really, really noisy. Pick the best four?

    this.age = [0,1,2,3,4,5,6,7].random();

    var age_colors = ['#000000', '#FBEC5D', '#CECC15', '#4F4F2F', '#FFA824', '#FF3D0D', '#FFFFFF', '#CDB38B'];

    this._glyph = new Game.Glyph(chr, age_colors[this.age], '#3B5323');
}

Game.Tile.tree.prototype = Game.Tile.prototype;