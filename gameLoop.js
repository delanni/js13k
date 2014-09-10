var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();

(screen.msLockOrientation&& screen.msLockOrientation("landscape-primary"))||(screen.mozLockOrientation&& screen.mozLockOrientation("landscape-primary"));

/// SETUP ONCE
var driveVector= new Vector2d(0,0), topV = new Vector2d(30,24), mid = new Vector2d(30,73), bottom = new Vector2d(30,118);

readInputs = function(){};
readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});


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
	Function("btn","able([btn],false);setTimeout(function(){CMD[7](btn)},10e3);timefactor=.25"),
	// normalmo
	Function("btn","timefactor=1;setTimeout(function(){able([btn],true)},10e3)")
],
command = function(id,caller){
	if (!caller.classList.contains("disabled"))
	CMD[id](caller);
}

var allButtons = Array.prototype.slice.call(document.getElementsByClassName("button"));
allButtons.forEach(function(button){
    button.onmousedown = button.ontouchstart = function(evt){
        command(+this.id[0],this);
        evt.preventDefault();
        evt.handled = true;
        return false;
    }
});
var ableAll = function(en){able(allButtons,en)};

/// SETUP EVERYTIME

var s = new SpriteSheet("img/atlas.png","atlas");
var parrot, world, atlas, ground,targetVector;
var tree;
var loadGameEntities = function(loader){

	atlas = loader.spriteSheets["atlas"];
	world = new World();
	ground = new GroundEntity(15,3000);
	world.groundElements.push(ground);
    parrot = new SpriteEntity(atlas,new Vector2d(0,73),16,12,[
        [16,12,6,400,[27,0]]
        ]);
	parrot.collideAction = function(other){
		if (other.kind<10){
			this.markForRemoval();
		}
	}
	parrot.onRemove = function(){	
		var chunks = new Explosion({
			colors: B,
			size: [1,5],
			count: [10,20],
			strength: .5,
			offset: this.body.speed.multiply(2),
			center: this.body.center,
			collisionType: World.COLLIDE_GROUND,
			zIndex: World.FOREGROUND
		}).fire(this.body.center, world);
		chunks = chunks.filter(function(EL){return EL.body.corner[0]>1.5});
		for(var i =0; i< chunks.length; i++){
			var chunk  = chunks[i];
			chunk.restitution = .9;
			chunk.tracer = new Explosion({
            gravityFactor: 0,
            collisionType: World.NO_COLLISION,
			life:[200,500],
			count:[0,2],
			strength: 0.01,
			size:1,
			shrink:0,
			colors: B.slice(2)
			});
			chunk.onAnimate = function(){
				this.tracer.fire(this.body.center,world);
			}
		}
		var checkDead = function(){
			setTimeout(function(){
				if(chunks.every(function(e){return !e.isAlive;})) gameOver();
				else checkDead();
			},100);
		}
		checkDead();
	}
	
	targetVector=mid;

    var treeCollideAction = function(other){
        var _thetree = this;
        if (other.kind == EntityKind.FIREBALL){
            if (!this.resources.length || this.resources.every(function(E){return E.kind != EntityKind.FIREEMITTER})){
                var fireEmitter = new Emitters.FireEmitter(_thetree,world);
                fireEmitter.params.size = [4,6];
                fireEmitter.params.strength*=1.5;
                _thetree.resources.push(fireEmitter);
                _thetree.life = 750;
            }
        }
    }
	
	// populate trees
    for(var i=0; i < 30; i++){
        tree = new SpriteEntity(atlas,new Vector2d(130,123),9,12,[
            [9,12,3,800,0]
            ]);
        tree.collideAction = treeCollideAction;
		tree.kind = EntityKind.FIRETARGET;
        tree.onRemove = function(){
		/*
            var s = new Collectible(this.body.center, 4, T.random(), Bubble);
            s.body.speed = this.body.speed;
            s.body.friction = 0;
            world.addEntity(s,World.NO_COLLISION, World.FOREGROUND);*/
        };
        tree.body.center[0]= randBetween(50,3000,true);
        world.addEntity(tree, World.COLLIDE_ALL, World.CENTER);
    }
	
	// populate enemigos
	//for(var i = 0; i<
	
	world.addEntity(parrot,World.COLLIDE_ALL, World.CENTER);
	startGame();
}

var loader = new SpriteSheetLoader(loadGameEntities);
loader.addItem(s);
loader.start(10);

var gameOver = function(){
	animate = noop;
	loadGameEntities(loader);
	startGame();
};
var startGame = function(){
	ableAll(true);
	timefactor = 1;
	animate = function(time) {
	parrot.body.speed[1] = (targetVector[1]-parrot.body.center[1])*Math.max(time,16)/3000;
	parrot.body.speed[0]= 0.05;
	world.animate(time);
	parrot.body.center[1] = clamp(parrot.body.center[1],topV[1],bottom[1]);
	};
};

// SETUP LOOP+FUNCTIONS
var animate = noop;

var ctx = miniCanvas.getContext("2d");
ctx.webkitImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
translation = 0;
var render = function(time) {
	if (parrot && world){
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
	}
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
