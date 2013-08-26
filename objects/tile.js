Game.Tile = function(glyph) {
    this._entity = false;
    this._glyph = glyph;
    this._passable = true;
};

Game.Tile.prototype.setPos = function(x, y) {
    this.pos = {x: x, y: y};
};

Game.Tile.prototype.getPos = function() {
    return this.pos;
};

Game.Tile.prototype.getGlyph = function() {
    return this._glyph;
};

Game.Tile.prototype.isEntity = function() {
    return this._entity;
}

Game.Tile.prototype.isPassable = function() {
    return this._passable;
}

Game.Tile.land = function(chr_index, bgcolor) {
    chr_options = [' ', ',', '.'];

    if (chr_index == undefined || chr_index >= chr_options.length) {
        chr = chr_options.random();
    } else  {
        chr = chr_options[chr_index];
    }

    var backgroundColor = bgcolor || '#3B5323';
    
    this._glyph = new Game.Glyph(chr, '#526F35', bgcolor, '#ffd46d');
}

Game.Tile.land.prototype = new Game.Tile();

Game.Tile.tree = function(species_name, initial_stage, initial_stage_age) {
    this._entity = true;
    this._passable = false;
    this.stage_list = [
        {
            name: 'Sapling',
            chr_index: 0,
            glyph_color: '#808080',
            length: 120,
            harvest: {},
            aura_strength: 0
        },
        {
            name: 'Spawn',
            chr_index: 0,
            glyph_color: '#d0d0c0',
            length: 120,
            harvest: {seeds: 2},
            aura_strength: 0
        },
        {
            name: 'Spark',
            chr_index: 1,
            glyph_color: '#FBEC5D',
            length: 120,
            harvest: {wood: 1, seeds: 1},
            aura_strength: 1
        },
        {
            name: 'Adolescent',
            chr_index: 1,
            glyph_color: '#9BBF10',
            length: 120,
            harvest: {wood: 2, resource: 1, seeds: 1},
            aura_strength: 2
        },
        {
            name: 'Adult',
            chr_index: 1,
            glyph_color: '#FF3D0D',
            length: 120,
            harvest: {wood: 1, resource: 2, seeds: 1},
            aura_strength: 4
        }
    ];

    this.species_list = {
        'rock_elm': {
            name: 'Rock Elm',
            seed_name: 'rock_elm_seeds',
            resource_name: 'stone',
            aura_stat: 'def',
            chr: ['r', 'R']
        },
        'ironwood': {
            name: 'Ironwood',
            seed_name: 'ironwood_seeds',
            resource_name: 'iron',
            aura_stat: 'str',
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

    if (this.harvestAt === this.stage_index) {
        delete this.harvestAt;
        Game.TaskManager.addUnitTask({type: 'harvest', pos: this.pos});
    }
}

Game.Tile.tree.prototype.updateGlyph = function() {
    this._glyph._char               = this.species.chr[this.stage.chr_index];
    this._glyph._foreground         = this.stage.glyph_color;
    this._glyph._background         = undefined;
    this._glyph._selectedBackground = '#ffd46d';
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

Game.Tile.tree.prototype.getHarvest = function() {
    var output = {};

    for (var p in this.stage.harvest) {
        if (!this.stage.harvest.hasOwnProperty(p)) {
            continue;
        }

        if (p == 'seeds') {
            output[this.species.seed_name] = this.stage.harvest.seeds;
        } else if (p == 'resource') {
            output[this.species.resource_name] = this.stage.harvest.resource;
        } else {
            output[p] = this.stage.harvest[p];
        }
    }

    return output;
};

Game.Tile.tree.prototype.getAura = function() {
    var aura = {}
    aura[this.species.aura_stat] = this.stage.aura_strength;
    return aura;
};

Game.Tile.tree.prototype.handleInput = function(inputType, inputData) {
    var keyCode = inputData.keyCode;
    if (inputType === 'keypress' && inputData.charCode !== undefined) {
        var character = String.fromCharCode(inputData.charCode);
    }

    if (inputType === 'click') { return; }

    if (this.mode === 'harvestAt' && character !== undefined) {
        // TODO: ParseInt()
        switch (character) {
            case '1':
                this.harvestAt = 1;
                break;
            case '2':
                this.harvestAt = 2;
                break;
            case '3':
                this.harvestAt = 3;
                break;
            case '4':
                this.harvestAt = 4;
                break;
            case '-':
                delete this.harvestAt;
                break;
        }
    } else {
        if (character === '@') {
            this.mode = 'harvestAt';
        } if (keyCode === ROT.VK_ESCAPE) {
            return false;
        }
    }

    return true;
};
