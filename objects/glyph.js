Game.Glyph = function(chr, foreground, background, selected_background) {
    // Instantiate properties to default if they weren't passed
    this._char = chr || ' ';
    this._foreground = foreground || '#FFFFFF';
    this._background = background || '#000000';
    this._selected = false;
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function() { 
    return this._char; 
};

Game.Glyph.prototype.getBackground = function() {
    return this._background;    
};

Game.Glyph.prototype.getForeground = function() { 
    return this._foreground; 
};
