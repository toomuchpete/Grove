Game.TaskManager = (function(self){
    var q = [];

    self.getTask = function() {
        return q.shift();
    };

    self.addTask = function(task) {
        console.log("New task in queue:", task);
        return q.push(task);
    };

    self.returnTask = function(task) {
        self.addTask(task);
    };

    return self;
}({}));