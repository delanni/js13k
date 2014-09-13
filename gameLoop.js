var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();

(screen.msLockOrientation&& screen.msLockOrientation("landscape-primary"))||(screen.mozLockOrientation&& screen.mozLockOrientation("landscape-primary"));

/// SETUP ONCE
window.smb = document.getElementById("32slowmo");
var driveVector= new Vector2d(0,0), topV = new Vector2d(30,24), mid = new Vector2d(30,73), bottom = new Vector2d(30,118), slots=[topV,mid,bottom];

var shoot = function(kind){
	if (parrot.isAlive)	{
        world.addEntity(new kind(parrot.body.center,world), World.COLLIDE_ALL, World.CENTER)
        addPoints(-1);
    };
}
CMD = {
	//up
	87:Function("targetVector=targetVector==bottom?mid:topV;"),
	//down
	83:Function("targetVector=targetVector==topV?mid:bottom"),
	// fire
	72:Function("shoot(Projectiles.Fireball)"),
	// water
	74:Function("shoot(Projectiles.Waterbolt)"),
	// poison
	75:Function("shoot(Projectiles.Poisonball)"),
	// lightning
	76:Function("shoot(Projectiles.Lightningbolt)"),
	// slowmo
	32:Function("able([window.smb],false); window.timeout = setTimeout(function(){CMD[7](window.smb)},10e3);timefactor=.25"),
	// normalmo
	7:Function("btn","timefactor=1;window.timeout = setTimeout(function(){able([btn],true)},10e3)")
},
command = function(id,caller){
	if (window.gamerunning) if (caller && (!caller.classList || !caller.classList.contains("disabled"))) CMD[id](caller);
}

allButtons.forEach(function(button){
    button.onmousedown = button.ontouchstart = function(evt){
        command(parseInt(this.id),this);
        evt.preventDefault();
        evt.handled = true;
        return false;
    }
});

var ableAll = function(en){able(allButtons,en)};

window.pts = 0;
window.hiscore = parseInt(localStorage.getItem("hiscore")) || 0;
points.textContent = "High score: " + window.hiscore;
window.postfix = "";
var addPoints = function(pts){
    window.pts+=pts;
    switch(Math.floor(window.pts/50)){
        case 0: window.postfix = ""; break;
        case 1: window.postfix = "!"; break;
        case 2: window.postfix = "!!"; break;
        case 3: window.postfix = "!1"; break;
        case 4: window.postfix = ", holy sh1t!"; break;
        default: window.postfix = ", ERMAGHERD!!2"; break;
    }
    points.textContent = "Points: " + window.pts + postfix;
},
toggleVeil = function(onoff){
    veil.style.display = onoff?"block":"none";
},
switchGraphics = function(){
    window.crisp = !window.crisp;
    localStorage.setItem("crisp",window.crisp);
    crispbutton.textContent = "Graphics: " + (window.crisp?"Low":"High");
},
readInputs = function(){
	for(var i  in readInputs.keys){
		if (+i && (i in CMD)){
			command(+i,readInputs.keys[i]);
			delete readInputs.keys[i];
		}
	}
},
gameOver = function(){
	window.gamerunning = false;
    window.hiscore = Math.max(window.hiscore,window.pts);
    localStorage.setItem("hiscore",window.hiscore);
    points.textContent = "High score: " + window.hiscore;
    animate = noop;
    loadGameEntities(loader);
    toggleVeil(true);
},
startGame = function(){
	window.gamerunning = true;
    if(window.timeout) clearTimeout(window.timeout);
    window.pts = 0;
    toggleVeil(false);
    ableAll(true);
    timefactor = 1;
    animate = function(time) {
    parrot.body.speed[1] = (targetVector[1]-parrot.body.center[1])*Math.max(time,16)/3000;
    parrot.body.speed[0]= 0.05;
    world.animate(time);
    parrot.body.center[1] = clamp(parrot.body.center[1],topV[1],bottom[1]);
    };
};
startbutton.onclick = startGame;
crispbutton.onclick = switchGraphics;
readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});

/// SETUP EVERYTIME

var s = new SpriteSheet("img/atlas2.png","atlas");
var parrot, world, atlas, ground,targetVector;
var tree,enemy;
var loadGameEntities = function(loader){
	atlas = loader.spriteSheets["atlas"];
	world = new World();
	ground = new GroundEntity(15,3000);
	world.groundElement=ground;
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
    /*for(var i=0; i < 20; i++){
        tree = new SpriteEntity(atlas,new Vector2d(130,123),9,12,[
            [9,12,3,800,0]
            ]);
        tree.collideAction = treeCollideAction;
		tree.kind = EntityKind.FIRETARGET;
        tree.onRemove = function(){
        };
        tree.body.center[0]= randBetween(1,100,true)*30 + 100;
        world.addEntity(tree, World.COLLIDE_ALL, World.CENTER);
    }*/
	
	var enemyCollideAction = function(other){
		if(other.kind-40==this.kind){
			this.markForRemoval();
		}
	};

	var addEnemyTo = function(x,y){
		enemy = new Target(atlas,[x,y[1]],randBetween(0,4,true));
        enemy.collideAction = enemyCollideAction;
		world.addEntity(enemy,World.COLLIDE_ALL, World.CENTER);
	};
	
	// populate enemigos
	for(var i =0, inc = 100, intensity=1; intensity<5;){
		switch(intensity){
			case 1:
				addEnemyTo(100+i,slots.random());
				if (i>=1000) intensity++;
			break;
			case 2:
				var p1 = randBetween(0,3,true);
				var p2 = (p1+1)%3;
				addEnemyTo(100+i,slots[p1]);
				addEnemyTo(100+i,slots[p2]);
				if (i>=2000) intensity++;
			break;
			case 3:
				addEnemyTo(100+i,slots[0]);
				addEnemyTo(100+i,slots[1]);
				addEnemyTo(100+i,slots[2]);
				inc = Math.max(10,inc-5);
				if (i>=3000) intensity++;
			break;
			default:
				var cx = new Collectible([i+500,mid[1]], 6, B[4], Bubble);
				cx.kind = -666;
			    cx.collideAction = function(other){addPoints(50); other.markForRemoval()};
			    world.addEntity(cx,World.NO_COLLISION, World.FOREGROUND);
			    intensity++;
		}
		
		i+=inc;
	}
	
	world.addEntity(parrot,World.COLLIDE_ALL, World.CENTER);
}

var loader = new SpriteSheetLoader(loadGameEntities);
loader.addItem(s);
loader.start(10);

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
	if (timefactor>0.9){
		ctx.fillStyle = P[0];
	    ctx.fr(-translation,0,miniCanvas.width,miniCanvas.height-15);
	}
	
	world.render(ctx,time);
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
