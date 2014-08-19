
var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();


var world = new World();

var heightmap = [];
for(var ix = 0; ix< 160; ix++){
	heightmap.push(randBetween(15,15,1));
}
var ground = new GroundEntity(heightmap);
world.groundElements.push(ground);

var animate = function(time) {
    // animate animatables
	world.animate(time);
};

var driveVector=new Vector2d(0,0);
var readInputs = function(time){
    driveVector[0]=driveVector[1]=0;

	// up
    if (readInputs.keys[38]) {
        driveVector[1]=-0.0005;
        parrot.body.applyAcceleration(driveVector,time);
    }
	// down
    if (readInputs.keys[40]) {
        driveVector[1]=0.0005;
        parrot.body.applyAcceleration(driveVector,time);
    }
	// right
    if (readInputs.keys[39]) {
        driveVector[0]=0.0005;
        parrot.body.applyAcceleration(driveVector,time);
    }
	// left
    if (readInputs.keys[37]) {
        driveVector[0]=-0.0005;
        parrot.body.applyAcceleration(driveVector,time);
    }

    if (readInputs.keys[32]){
        var fb = new Projectiles.Fireball(parrot.body.center, [0.2,0], 4, world);
        world.addEntity(fb, World.COLLIDE_ALL, World.CENTER);
        readInputs.keys[32]=false;
    }
};

readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});

miniCanvas.onclick = function(e){
    var exp = new Effects.Explosion({
        collisionType:Effects.Explosion.COLLIDE_GROUND
    });

    exp.fire(e.offsetX,e.offsetY,world);
};

var anim;
var s = new SpriteSheet("img/parrot_spritesheet_tiny.png","parrot");


var parrot;
var onLoaded = function(loader){
	var parrotSheet = loader.spriteSheets["parrot"];
    parrot = new SpriteEntity(parrotSheet,new Vector2d(50,50),16,16,[
        [16,16,6,400,0]
        ]);
	world.addEntity(parrot,World.NO_COLLISION,World.CENTER);
    var fireEmitter = new Emitters.FireEmitter(parrot,world);
    fireEmitter.start();
    var waterEmitter = new Emitters.WaterEmitter(parrot,world);
    waterEmitter.start();
}
var loader = new SpriteSheetLoader(onLoaded);
loader.addItem(s);

loader.start(10);

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
    
    n=n || (gameLoop.lastTime||0)+1000/60; 
    if (!gameLoop.lastTime) {
        gameLoop.lastTime = n;
        r(gameLoop);
        meter.tick();
        return;
    }
    r(gameLoop);
    readInputs(n-gameLoop.lastTime);
    animate(n-gameLoop.lastTime);
    render(n-gameLoop.lastTime);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();