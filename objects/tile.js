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
