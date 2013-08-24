Game.TaskManager = (function(self){
    var unitQueue = [];
    var buildingQueue = [];

    self.getUnitTask = function() {
        return unitQueue.shift();
    };

    self.addUnitTask = function(task) {
        return unitQueue.push(task);
    };

    self.getBuildingTask = function() {
        return buildingQueue.shift();
    };

    self.addBuildingTask = function(task) {
        return buildingQueue.push(task);
    }

    return self;
}({}));