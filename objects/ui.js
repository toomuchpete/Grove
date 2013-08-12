Game.UI = {
    render: function() {
        if (this.elements.inspect) {
            var mode = Game.getCommandMode();
            if (mode == 'select') {
                var tile = null;

                if (Game.getScreen().getMap()) {
                    tile = Game.getScreen().getMap().getSelectedTile();
                }

                if (tile) {
                     if (tile instanceof Game.Tile.land) {
                        this.elements.inspect.html("Just a fertile pile of dirt.");
                     } else if (tile instanceof Game.Tile.tree) {
                        progress_pct = Math.floor(tile.stage.age/tile.stage.length*100);
                        var template = '<div><strong>Species:</strong> %s [<span style="color: %s; font-family: \'Ubuntu Mono\'">%s</span>]</div><div><strong>Growth Stage:</strong> %s</div>';
                        template += '<div class="progress progress-striped"><div class="bar bar-success" style="width: %s%; text-align: left; overflow: off;"></div></div>';
                        this.elements.inspect.html(template.format(
                            tile.species.name,
                            tile.getGlyph().getForeground(),
                            tile.getGlyph().getChar(),
                            tile.stage.name,
                            progress_pct
                        ));
                     }
                } else {
                    this.elements.inspect.html("Click a tile to see its stats.");
                }
            } else if (mode == 'harvest') {
                this.elements.inspect.html("<strong>Harvesting</strong>: Press escape to return to inspect mode.");
            } else if (mode == 'plant') {
                this.elements.inspect.html("<strong>Planting</strong>: Press escape to return to inspect mode.");
            }
        }

        var inv = Game.Inventory.getInventory();
        var obj_types = Object.keys(inv);
        var inv_counters = '.inventory_count';
        var aura_counters = '.aura_count';

        $(inv_counters + ',' + aura_counters).html("0");

        for (i = 0; i < obj_types.length; i++) {
            var counter = inv_counters + '.' + obj_types[i] + '_count';

            $(counter).html(inv[obj_types[i]]);
        }

        var auras = Game.Aura.getAuras();

        for (var stat in auras) {
            if (!auras.hasOwnProperty(stat)) {
                continue;
            }

            var counter = aura_counters + '.' + stat + '_count';

            $(counter).html(auras[stat]);
        }
    }
}
