Game.MotionManager = (function(self){

    self.getRoute = function(fromEntity, targetX, targetY) {
        console.log("Calculating route...", fromEntity, targetX, targetY);
        if (fromEntity === undefined || fromEntity.getPos() === undefined || fromEntity.getPos().x === undefined || fromEntity.getPos().y === undefined) {
            return undefined;
        };

        var path = [];

        var pf = new ROT.Path.Dijkstra(targetX, targetY, function(x,y) {
            if (x === fromEntity.pos.x && y === fromEntity.pos.y) {
                return true;
            }

            return Game.Map.isPassable(x,y);
        }, {topology: 4});
        console.log("Pathfinder initialized");

        var entityPos = fromEntity.getPos();

        pf.compute(entityPos.x, entityPos.y, function(x,y){
            if (x === entityPos.x && y === entityPos.y) {
                return;
            }

            path.push({x: x, y: y});
        });
        console.log("Path computed", path);

        return path;
    };

    return self;
}({}));