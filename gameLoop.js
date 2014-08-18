
var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();


var world = new World();

var heightmap = [];
for(var ix = 0; ix< 160; ix++){
	heightmap.push(randBetween(15,20,1));
}
var ground = new GroundEntity(heightmap);
world.groundElements.push(ground);

var animate = function(time) {
    // animate animatables
	world.animate(time);
};

var readInputs = function(time){

	// up
    if (readInputs.keys[38]) {
        if (anim) anim.y = (anim.y||0)-1;
    }
	// down
    if (readInputs.keys[40]) {
       if (anim) anim.y = (anim.y||0)+1;
    }
	// right
    if (readInputs.keys[39]) {
        if (anim) anim.x = (anim.x||0)+1;
    }
	// left
    if (readInputs.keys[37]) {
        if (anim) anim.x = (anim.x||0)-1;
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


var onLoaded = function(loader){
	var parrot = loader.spriteSheets["parrot"];
	anim = parrot.getAnimation(16,16,6,400,0);
	anim.x=anim.y=50;
    setInterval(function(){
        var exp = new Effects.Explosion({
            gravityFactor: [0.2,1],
            offset: new Vector2d(-0.2,0),
            collisionType:Effects.Explosion.COLLIDE_GROUND
        });

        exp.fire(anim.x+8,anim.y+8,world);
    },300);
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
	if (anim) anim.drawFrame(ctx,anim.x,anim.y, time);
    
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
    readInputs();
    animate(n-gameLoop.lastTime);
    render(n-gameLoop.lastTime);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();
