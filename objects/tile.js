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
    
    this._glyph = new Game.Glyph(chr, '#526F35', '#3B5323', '#2C3D1A');
}

Game.Tile.land.prototype = new Game.Tile();

Game.Tile.tree = function(species_name, initial_stage, initial_stage_age) {
    this.stage_list = [
        {
            name: 'Sapling',
            chr_index: 0,
            glyph_color: '#808080',
            length: 120
        },
        {
            name: 'Spawn',
            chr_index: 0,
            glyph_color: '#d0d0c0',
            length: 120
        },
        {
            name: 'Spark',
            chr_index: 1,
            glyph_color: '#FBEC5D',
            length: 120
        }
    ];

    this.species_list = {
        'rock_elm': {
            name: 'Rock Elm',
            chr: ['r', 'R']
        },
        'ironwood': {
            name: 'Ironwood',
            chr: ['i', 'I']
        }
    };

    this.stage_index = typeof initial_stage != 'undefined' ? initial_stage : 0;

    this.stage = this.stage_list[this.stage_index];
    this.stage.age = typeof initial_stage_age != 'undefined' ? initial_stage_age : 0;

    var chr;
    if (this.species_list[species_name]) {
        this.species = this.species_list[species_name];
        chr = this.species.chr[this.stage.chr_index];
    } else {
        chr = '?'
    }

    // Should probably only use a subset of these colors -- using all 8 makes it really, really noisy. Pick the best four?
    var age_colors = ['#000000', '#FBEC5D', '#CECC15', '#4F4F2F', '#FFA824', '#FF3D0D', '#FFFFFF', '#CDB38B'];

    this._glyph = new Game.Glyph();
    this.updateGlyph();
}

Game.Tile.tree.prototype = new Game.Tile(); // Use new here so that we get a copy of the prototype; the following function defs will not be added to Game.Tile.prototype.

Game.Tile.tree.prototype.grow = function() {
    this.stage_index += 1;
    if (this.stage_index < this.stage_list.length) {
        // Update stage
        this.stage = this.stage_list[this.stage_index];
        this.stage.age = 0;

        // Update glyph, so changes are reflected on the screen
        this.updateGlyph();
        Game.Sounds.growth.play();
    }
}

Game.Tile.tree.prototype.updateGlyph = function() {
    this._glyph._char               = this.species.chr[this.stage.chr_index];
    this._glyph._foreground         = this.stage.glyph_color;
    this._glyph._background         = '#3B5323';
    this._glyph._selectedBackground = '#2C3D1A';
}

Game.Tile.tree.prototype.stageLength = function() {
    if (this.stage < this.stages.length) {
        return this.stages[this.stage].length * 1000;
    } else {
        return null;
    }
}

Game.Tile.tree.prototype.tick = function() {
    this.stage.age++;

    if (this.stage.age > this.stage.length) {
        this.grow();
    }
}
