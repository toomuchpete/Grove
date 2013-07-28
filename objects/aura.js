Game.Aura = (function(self){
    var aura_strength = {};

    var addAura = function(name, count) {
        if (count <= 0) { return false; }

        aura_strength[name] = (aura_strength[name] || 0) + (count || 1);

        return aura_strength[name];
    }

    var mergeAuras = function(a) {
        for (var stat in a) {
            if (!a.hasOwnProperty(stat)) {
                continue;
            }

            addAura(stat, a[stat]);
        }
    }

    self.calculateAuras = function() {
        aura_strength = {};

        if (Game.getScreen()._map) {
            var e = Game.getScreen()._map._entities;

            for (var i = 0; i < Game.getScreen()._map._entities.length; i++) {
                if (e[i].getAura) {
                    mergeAuras(e[i].getAura());
                }
            }
        }
    }

    self.getAuras = function() {
        return aura_strength;
    }

    return self;
}({}));