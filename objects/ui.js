Game.UI = {
    render: function() {
        if (this.element) {
            if (Game.selected) {
                 if (Game.selected instanceof Game.Tile.land) {
                    this.element.html("Just a fertile pile of dirt.");
                 } else if (Game.selected instanceof Game.Tile.tree) {
                    var template = "<strong>Species:</strong> %s | <strong>Growth Stage:</strong> %s | <strong>Time in this stage:</strong> %s / %s";
                    this.element.html(template.format(Game.selected.species.name, Game.selected.stage.name, Game.selected.stage.age, Game.selected.stage.length));
                 }
            } else {
                this.element.html("Click a tile to see its stats.");
            }
        }
    }
}
