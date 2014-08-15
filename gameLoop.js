var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();


var world = new World();
//var box = new BoxEntity(new Vector2d(50,50),new Vector2d(5,6),P[2]);

for(var ix = 0 ; ix< 15; ix++){
	var box = new BoxEntity(new Vector2d(randBetween(0,100,1),randBetween(0,100,1)), new Vector2d(randBetween(2,7,1), randBetween(2,7,1)), P[randBetween(0,4,1)]);
	world.entities.push(box);
}

var heightmap = [];
for(var ix = 0; ix< 160; ix++){
	heightmap.push(randBetween(15,20,1));
}
var ground = new GroundEntity(heightmap);
world.entities.push(ground);

var animate = function(time) {
    // animate animatables
	world.animate(time);
};

var readInputs = function(time){
    /*
	box.acceleration[0] = box.acceleration[1] = 0;
    if (readInputs.keys[38]) {
        box.acceleration[1]=-1e-3;
    }
    if (readInputs.keys[40]) {
        box.acceleration[1]=1e-3;
    }
    if (readInputs.keys[39]) {
        box.acceleration[0]=1e-3;
    }
    if (readInputs.keys[37]) {
        box.acceleration[0]=-1e-3;
    }
	*/
};

readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});

var render = function(time) {
    // render renderables to mini canvas (GB sized)
    // then olivize and  
    // miniCanvas.olivize();
    var ctx = miniCanvas.getContext("2d");
    ctx.fillStyle = P[0];
    ctx.fillRect(0,0,miniCanvas.width,miniCanvas.height);
	
	world.render(ctx,time);
    
    maxiCanvas.copyFrom(miniCanvas);
};


var meter = new FPSMeter();
var gameLoop = function(n) {
    meter.tickStart();
    
    n=n||60/1000;
    if (!gameLoop.lastTime) {
        gameLoop.lastTime = n;
        r(gameLoop);
        meter.tick();
        return;
    }
    r(gameLoop);
    readInputs();
    animate(n-gameLoop.lastTime);
    render(n-gameLoop.lastTime);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();
