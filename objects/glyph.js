Game.Glyph = function(chr, foreground, background, selected_background) {
    // Instantiate properties to default if they weren't passed
    this._char = chr || ' ';
    this._foreground = foreground || '#FFFFFF';
    this._background = background || '#000000';
    this._selectedBackground = selected_background || '#404040';
    this._selected = false;
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function() { 
    return this._char; 
}

Game.Glyph.prototype.getBackground = function() {
    if (this._selected) {
        return this._selectedBackground;
    } else {
        return this._background;    
    }
}

Game.Glyph.prototype.getForeground = function() { 
    return this._foreground; 
}

Game.Glyph.prototype.toggleSelected = function() {
    this._selected = !this._selected;
}
