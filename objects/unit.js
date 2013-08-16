Game.Unit = (function(self){
    self.isEntity = function() {
        return true;
    };

    self.tick = function() {

    };

    self.getGlyph = function() {
        return this.glyph;
    };

    self.setGlyph = function(g) {
        this.glyph = g;
    };

    self.isPassable = function() {
        return true;
    };

    self.create = function(type) {
        var unit;

        switch (type) {
            case 'worker':
                unit = Object.create(Game.Unit);
                unit.setGlyph(new Game.Glyph("w", "#f0f0f0", "#3B5323", "#2C3D1A"));
                break;
            default:
                return undefined;
        }

        return unit; 
    };

    return self;
}({}));
