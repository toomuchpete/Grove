Game.TaskManager = (function(self){
    var q = [];

    self.getTask = function() {
        return q.shift();
    };

    self.addTask = function(task) {
        return q.push(task);
    };

    self.returnTask = function(task) {
        self.addTask(task);
    };

    return self;
}({}));