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

        var entities = Game.Map.getEntities();
        for (var e in entities) {
            if (!entities.hasOwnProperty(e)) {
                continue;
            }

            if (entities[e].getAura) {
                console.log("++");
                mergeAuras(entities[e].getAura());
            }
        }
    }

    self.getAuras = function() {
        return aura_strength;
    }

    return self;
}({}));
