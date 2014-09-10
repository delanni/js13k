
var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();

(screen.msLockOrientation&& screen.msLockOrientation("landscape-primary"))||(screen.mozLockOrientation&& screen.mozLockOrientation("landscape-primary"));

/// SETUP INPUTS
var driveVector= new Vector2d(0,0), topV = new Vector2d(30,24), mid = new Vector2d(30,73), bottom = new Vector2d(30,118);
var targetVector = mid;

readInputs = function(){};
readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});

miniCanvas.onclick = function(){crisp = !crisp}

var shoot = function(kind){
	world.addEntity(new kind(parrot.body.center,world), World.COLLIDE_ALL, World.CENTER);
}
CMD = [
	//up
	Function("targetVector=targetVector==bottom?mid:topV;"),
	//down
	Function("targetVector=targetVector==topV?mid:bottom"),
	// fire
	Function("shoot(Projectiles.Fireball)"),
	// water
	Function("shoot(Projectiles.Waterbolt)"),
	// poison
	Function("shoot(Projectiles.Poisonball)"),
	// lightning
	Function("shoot(Projectiles.Lightningbolt)"),
	// slowmo
	Function("btn","disable(btn);setTimeout(function(){CMD[7](btn)},10e3);timefactor=.25"),
	// normalmo
	Function("btn","timefactor=1;setTimeout(function(){enable(btn)},10e3)")
],
command = function(id,caller){
	if (!caller.classList.contains("disabled"))
	CMD[id](caller);
}
Array.prototype.slice.call(document.getElementsByClassName("button")).forEach(function(button){
    button.onmousedown = button.ontouchstart = function(evt){
        command(+this.id[0],this);
        evt.preventDefault();
        evt.handled = true;
        return false;
    }
});

/// SETUP ENTITIES
var world = new World();

var ground = new GroundEntity(15,3000);
world.groundElements.push(ground);

var anim;
var s = new SpriteSheet("img/atlas.png","atlas");
var parrot;
var tree;
var onLoaded = function(loader){
	var atlas = loader.spriteSheets["atlas"];
    // SpriteEntity(spritesheet,center,w,h,animations)
    // getAnimation = function(tileWidth,tileHeight, frames, time, start, animwidth?)
    parrot = new SpriteEntity(atlas,new Vector2d(0,0),16,12,[
        [16,12,6,400,[27,0]]
        ]);

    var treeCollideAction = function(other){
        var _thetree = this;
        if (other.kind == EntityKind.FIREBALL){
            if (!this.resources.length || this.resources.every(function(E){return E.kind != EntityKind.FIREEMITTER})){
                var fireEmitter = new Emitters.FireEmitter(_thetree,world);
                fireEmitter.params.size = [4,6];
                fireEmitter.params.strength*=1.5;
                _thetree.resources.push(fireEmitter);
                _thetree.life = 1000;
            }
        }
    }
    for(var i=0; i < 47; i++){
        tree = new SpriteEntity(atlas,new Vector2d(130,144-15-6),9,12,[
            [9,12,3,800,0]
            ]);
        tree.collideAction = treeCollideAction;
        tree.onRemove = function(){
            var s = new Collectible(this.body.center, 4, T.random(), Bubble);
            s.body.speed = this.body.speed;
            s.body.friction = 0;
            world.addEntity(s,World.NO_COLLISION, World.FOREGROUND);
        };
        tree.body.speed[0]=0;
        tree.body.friction = 0;
        tree.body.center[0]= i * 100;
        world.addEntity(tree, World.COLLIDE_ALL, World.CENTER);
    }

	world.addEntity(parrot,World.NO_COLLISION,World.CENTER);
}
var loader = new SpriteSheetLoader(onLoaded);
loader.addItem(s);
loader.start(10);

// SETUP LOOP+FUNCTIONS
var animate = function(time) {
    // animate animatables
	parrot.body.speed[1] = (targetVector[1]-parrot.body.center[1])*Math.max(time,16)/3000;
    //parrot.body.gravitateTo(targetVector,time);
	parrot.body.speed[0]= 0.05;
    world.animate(time);
	parrot.body.center[1] = clamp(parrot.body.center[1],topV[1],bottom[1]);
};

var ctx = miniCanvas.getContext("2d");
ctx.webkitImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
translation = 0;
var render = function(time) {
	translation = -parrot.body.center[0]+30;
	ctx.save();
	ctx.tr(translation,0);
    ctx.fillStyle = P[0];
	if (timefactor>0.9)
	// because the position of this does not move -translation is needed
    ctx.fr(-translation,0,miniCanvas.width,miniCanvas.height);
	
	world.render(ctx,time);
    //maxiCanvas.copyFrom(miniCanvas);
	ctx.restore();
};

var timefactor = 1;
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
    var time = Math.min((n-gameLoop.lastTime),70)*timefactor;
    r(gameLoop);
    readInputs(time);
    animate(time);
    render(time);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();
