Game.Inventory = (function(self){
    var inventory_list = {};

    self.getInventory = function() {
        return inventory_list;
    }

    self.getItemCount = function(name) {
        return inventory_list[name] || 0;
    }

    self.addItem = function(name, count) {
        if (count <= 0) { return false; }

        inventory_list[name] = (inventory_list[name] || 0) + (count || 1);

        return inventory_list[name];
    }

    self.mergeInventory = function(inv) {
        for (var item in inv) {
            this.addItem(item, inv[item]);
        }
    }

    self.removeItem = function(name, count) {
        if (count <= 0) { return false; }

        if (this.getItemCount(name) - (count || 1) < 0) { return false; }

        inventory_list[name] = (inventory_list[name] || 0) - (count || 1);

        return inventory_list[name];
    }

    return self;
}({}));