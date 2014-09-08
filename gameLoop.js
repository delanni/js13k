
var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();

(screen.msLockOrientation&& screen.msLockOrientation("landscape-primary"))||(screen.mozLockOrientation&& screen.mozLockOrientation("landscape-primary"));

/// SETUP INPUTS
var driveVector= new Vector2d(0,0), topV = new Vector2d(30,24), mid = new Vector2d(30,73), bottom = new Vector2d(30,118);
var targetVector = mid;
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
        var fb = new Projectiles.Fireball(parrot.body.center, [0.2,0], 3, world);
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
Array.prototype.slice.call(document.getElementsByClassName("button")).forEach(function(button){
    button.onmousedown = button.ontouchstart = function(evt){
        switch(+this.id[0]){
            case 0:
                targetVector = topV;
            break;
            case 1:
                targetVector = mid;
            break;
            case 2:
                targetVector = bottom;
            break;
            case 3:
                var proj = new Projectiles.Fireball(parrot.body.center, [0.2,0], 4, world);
                world.addEntity(proj, World.COLLIDE_ALL, World.CENTER);
            break;
            case 4:
				var proj = new Projectiles.Waterbolt(parrot.body.center, [0.2,0], 3, world);
                world.addEntity(proj, World.COLLIDE_ALL, World.CENTER);
            break;
            case 5:
				var proj = new Projectiles.Poisonball(parrot.body.center, [0.2,0], 2, world);
                world.addEntity(proj, World.COLLIDE_ALL, World.CENTER);
            break;
            case 6:
            break;
        }
        evt.preventDefault();
        evt.handled = true;
        return false;
    }
});

maxiCanvas.addEventListener("mousedown",function(e){
    var exp = new Effects.Explosion({
        collisionType:Effects.Explosion.COLLIDE_GROUND
    });

    exp.fire(new Vector2d(e.offsetX/zoom,e.offsetY/zoom),world);
});

/// SETUP ENTITIES
var world = new World();

var heightmap = 15;
var ground = new GroundEntity(heightmap);
world.groundElements.push(ground);

var anim;
var s = new SpriteSheet("img/atlas.png","atlas");
var parrot;
var tree;
var onLoaded = function(loader){
	var atlas = loader.spriteSheets["atlas"];
    // SpriteEntity(spritesheet,center,w,h,animations)
    // getAnimation = function(tileWidth,tileHeight, frames, time, start, animwidth?)
    parrot = new SpriteEntity(atlas,new Vector2d(50,50),16,12,[
        [16,12,6,400,[27,0]]
        ]);
    tree = new SpriteEntity(atlas,new Vector2d(130,144-15-6),9,12,[
        [9,12,3,800,0]
        ]);
    tree2 = new SpriteEntity(atlas,new Vector2d(130,144-15-6),9,12,[
        [9,12,3,800,0]
        ]);
    tree.collideAction = tree2.collideAction = function(other){
        var _thetree = this;
        if (other.kind == EntityKind.FIREBALL){
            if (!this.resources.length || this.resources.every(function(E){return E.kind != EntityKind.FIREEMITTER})){
                var fireEmitter = new Emitters.FireEmitter(_thetree,world);
                fireEmitter.params.size = [4,6];
                fireEmitter.params.strength*=1.5;
                _thetree.resources.push(fireEmitter);
                _thetree.life = 3000;
            }
        }
    }

    tree2.body.center[0]-=50;

	world.addEntity(parrot,World.NO_COLLISION,World.CENTER);
    world.addEntity(tree, World.COLLIDE_ALL, World.CENTER);
    world.addEntity(tree2, World.COLLIDE_ALL, World.CENTER);
}
var loader = new SpriteSheetLoader(onLoaded);
loader.addItem(s);
loader.start(10);

// SETUP LOOP+FUNCTIONS
var animate = function(time) {
    // animate animatables
    parrot.body.gravitateTo(targetVector,time);
    world.animate(time);
};

var ctx = miniCanvas.getContext("2d");
ctx.webkitImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
maxiCanvas.getContext("2d").imageSmoothingEnabled = false;
maxiCanvas.getContext("2d").webkitImageSmoothingEnabled = false;
var render = function(time) {
    ctx.fillStyle = P[0];
    ctx.fillRect(0,0,miniCanvas.width,miniCanvas.height);
	
	world.render(ctx,time);
    maxiCanvas.copyFrom(miniCanvas);
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
    var time = (n-gameLoop.lastTime)*timefactor;
    r(gameLoop);
    readInputs(time);
    animate(time);
    render(time);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();
