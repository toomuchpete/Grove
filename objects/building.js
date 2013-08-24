Game.Building = (function(self){
    self.type = 'building';

    self.isEntity = function() {
        return true;
    };

    self.tick = function() {
    }

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
            case 'workshop':
                unit = Object.create(Game.Building);
                unit.setGlyph(new Game.Glyph("O", "#f0f0f0"));
                unit.subtype = 'workshop';
                break;
            default:
                return undefined;
        }

        return unit; 
    };

    return self;
}({}));
