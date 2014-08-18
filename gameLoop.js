var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();


var world = new World();

for(var ix = 0 ; ix< 1; ix++){
	var box = new BoxEntity(new Vector2d(randBetween(0,100,1),randBetween(0,100,1)), new Vector2d(randBetween(2,7,1), randBetween(2,7,1)), P[randBetween(0,4,1)]);
	world.entities.push(box);
}

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
	for (var i = 0; i < 30; i++){
		var center = new Vector2d(e.offsetX,e.offsetY);
		var corner = Vector2d.random(5);
		var z = new BoxEntity(center,corner,P[2]);
		z.body.speed = Vector2d.random();
		world.entities.push(z);
	}
};

var anim;
var s = new SpriteSheet("img/parrot_spritesheet_tiny.png", function(){
	anim = s.getAnimation(16,16, [5,4,3,2,1,0], 300, 0);
	anim.x=0;
	anim.y=0;
});

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
