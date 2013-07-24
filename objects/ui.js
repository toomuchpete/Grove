Game.UI = {
    render: function() {
        if (this.elements.inspect) {
            if (Game.selected) {
                 if (Game.selected instanceof Game.Tile.land) {
                    this.elements.inspect.html("Just a fertile pile of dirt.");
                 } else if (Game.selected instanceof Game.Tile.tree) {
                    progress_pct = Math.floor(Game.selected.stage.age/Game.selected.stage.length*100);
                    var template = '<div><strong>Species:</strong> %s [<span style="color: %s;">%s</span>]</div><div><strong>Growth Stage:</strong> %s</div>';
                    template += '<div class="progress progress-striped"><div class="bar bar-success" style="width: %s%; text-align: left; overflow: off;"></div></div>';
                    this.elements.inspect.html(template.format(
                        Game.selected.species.name,
                        Game.selected.getGlyph().getForeground(),
                        Game.selected.getGlyph().getChar(),
                        Game.selected.stage.name,
                        progress_pct
                    ));
                 }
            } else {
                this.elements.inspect.html("Click a tile to see its stats.");
            }
        }
    }
}
