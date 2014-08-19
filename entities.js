var Vector2d = (function () {
    function Vector2d(x, y) {
        this[0] = x || 0;
        this[1] = y || 0;
    }

    Vector2d.random = function(base){
    	base = base || 1;
    	var x = Math.random()*base-base/2;
    	var y = Math.random()*base-base/2;
    	var v = new Vector2d(x,y);
    	return v;
    };

    Vector2d.prototype.add = function (other) {
        return new Vector2d(this[0] + other[0], this[1] + other[1]);
    };

    Vector2d.prototype.doAdd = function (other) {
        this[0] += other[0];
        this[1] += other[1];
        return this;
    };

    Vector2d.prototype.substract = function (other) {
        return new Vector2d(this[0] - other[0], this[1] - other[1]);
    };

    Vector2d.prototype.doSubstract = function (other) {
        this[0] -= other[0];
        this[1] -= other[1];
        return this;
    };

    Vector2d.prototype.multiply = function (scalar) {
        return new Vector2d(this[0] * scalar, this[1] * scalar);
    };

    Vector2d.prototype.doMultiply = function (scalar) {
        this[0] *= scalar;
        this[1] *= scalar;
        return this;
    };

    Vector2d.prototype.getMagnitude = function () {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    };

    Vector2d.prototype.normalize = function (to) {
        to = to || 1;
        var m = this.getMagnitude();
        return this.doMultiply(1 / m * to);
    };

    Vector2d.prototype.copy = function(){
    	return new Vector2d(this[0],this[1]);
    };

    return Vector2d;
})();

var PhysicsBody = (function () {
    function PhysicsBody(center,corner,speed,acceleration) {
		this.center = center || new Vector2d();
		this.corner = corner || new Vector2d();
		this.speed = speed || new Vector2d();
		this.acceleration = acceleration || new Vector2d();
		this.rotation = 0;
		this.angularSpeed=0;
		this.friction = 0.05;
    }

    PhysicsBody.EPSILON = 5e-3;
	PhysicsBody.XLIMIT = 0.5;
	PhysicsBody.YLIMIT = 0.5;

    PhysicsBody.prototype.tick = function (ms) {
        this.move(this.speed.multiply(ms));
		this.rotate(this.angularSpeed*ms);
        this.speed.doAdd(this.acceleration.multiply(ms));
        this.speed.doMultiply(1 - this.friction);
        this.limitSpeed();
    };
	
	PhysicsBody.prototype.posttick = function (ms) {
        this.speed.doAdd(this.acceleration.multiply(ms));
        this.speed.doMultiply(1 - this.friction);
        this.limitSpeed();
		this.move(this.speed.multiply(ms));
    };
	
	PhysicsBody.prototype.move = function (vector) {
        this.center.doAdd(vector);
        return this;
    };
	
	PhysicsBody.prototype.applyAcceleration  = function (vector,time){
		this.speed.doAdd(vector.multiply(time));
        //this.speed.doMultiply(1 - this.friction);
        this.limitSpeed();
	};
	
	PhysicsBody.prototype.limitSpeed = function(){
		if (this.speed.getMagnitude() < PhysicsBody.EPSILON) {
            this.speed.doMultiply(0);
        } else {
        	if (Math.abs(this.speed[0]) > PhysicsBody.XLIMIT) {
                this.speed[0] = clamp(this.speed[0], -PhysicsBody.XLIMIT, PhysicsBody.XLIMIT);
            }
            if (Math.abs(this.speed[1]) > PhysicsBody.YLIMIT) {
                this.speed[1] = clamp(this.speed[1], -PhysicsBody.YLIMIT, PhysicsBody.YLIMIT);
            }
        }
		if (Math.abs(this.angularSpeed) < PhysicsBody.EPSILON) this.angularSpeed=0;
	};
	
	PhysicsBody.prototype.intersects = function (other) {
        if (Math.abs(this.center[0] - other.center[0]) > (this.corner[0] + other.corner[0])) {
			return false;
		}
        if (Math.abs(this.center[1] - other.center[1]) > (this.corner[1] + other.corner[1])) {
			return false;
		}
        return true;
    };
	
	PhysicsBody.prototype.getLTWH = function () {
        return [
			this.center[0] - this.corner[0],
			this.center[1] - this.corner[1],
			this.corner[0] * 2,
			this.corner[1] * 2];
    };
	
	PhysicsBody.prototype.rotate = function(angle){
		this.rotation+=angle;
	};

    return PhysicsBody;
})();

/*
var Entity = (function () {
	function Entity() {
		
	}
	return Entity;
})();
*/

var SpriteEntity = (function(){
	function SpriteEntity(spritesheet,center,w,h,animations){
		this.isVisible = true;
		this.isAlive = true;
		this.isMarked=false;
		this.animations = [];
		this.currentAnimation = 0;
		this.body = new PhysicsBody(center.copy(), new Vector2d(w/2,h/2));
		this.spritesheet = spritesheet;
		this.loadAnimations(animations);
	}

	SpriteEntity.prototype.loadAnimations = function(animations){
		for(var i = 0 ; i < animations.length; i++){
			var animation = this.spritesheet.getAnimation.apply(this.spritesheet,animations[i]);
			this.animations.push(animation);
		}
	};

	SpriteEntity.prototype.reset = function(){
		this.currentAnimation = 0;
	};

	SpriteEntity.prototype.setAnimation = function(i){
		if (!this.animations[i]) return;
		this.animations[i].reset();
		this.currentAnimation = i;
	};

	SpriteEntity.prototype.draw = function(ctx, world, time) {
		var a = this.animations[this.currentAnimation];
		var v = this.body.center.substract(this.body.corner);
		a.drawFrame(ctx,v[0],v[1],time);
	};
	
	SpriteEntity.prototype.animate = function(world,time) {
		this.body.tick(time);
	};

	SpriteEntity.prototype.collideAction = function(other){

	};

	SpriteEntity.prototype.applyGravity = function(gravityVector,time){
		
	};

	SpriteEntity.prototype.collideGround = function (other){
		
	};

	return SpriteEntity;
})();

var Particle = (function() {
	function Particle(center,size,color,life,shrink){
		this.isVisible = true;
		this.isAlive = true;
		this.isMarked = false;
		this.color = color;
		this.body = new PhysicsBody(center,new Vector2d(size/2,size/2));
		this.life = life || 300;
		this.gravityFactor = 1;
		this.shrinkage = shrink?(size/2)/this.life:0;
	}
	
	Particle.prototype.draw = function(ctx, world, time) {
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2],h=ltwh[3];
		ctx.save()
		ctx.translate(l+w/2,t+h/2);
		ctx.rotate(this.body.rotation);
	    ctx.fillStyle = this.color;
		ctx.fillRect(-w/2,-h/2,w,h);
		ctx.restore();
	};
	
	Particle.prototype.animate = function(world,time) {
		if (this.life>=0){
			this.life-=time;
			this.body.corner.doSubstract([this.shrinkage*time,this.shrinkage*time]);
			if (this.life<=0) this.isVisible = this.isAlive = !(this.isMarked=true);
			this.body.tick(time);
		}
	};

	Particle.prototype.collideAction = function(other){

	};

	Particle.prototype.applyGravity = function(gravityVector,time){
		this.body.applyAcceleration(gravityVector.multiply(this.gravityFactor),time);
	};

	Particle.prototype.collideGround = function (other){
		this.body.speed[1]*=-other.restitution;
		this.body.speed[0]*=other.restitution;
		this.body.angularSpeed*=-other.restitution;
		this.body.limitSpeed();
		if (this.body.speed.getMagnitude()==0) {this.isOnGround = true; this.body.angularSpeed=0;}
	};

	return Particle;
})();

var GroundEntity = (function(){
	function GroundEntity(heightmap, width,height){
		this.isVisible = true;
		this.isCollisionAware = true;
		this.heightmap = heightmap;
		this.color = P[2];
		this.restitution = 0.3;
		this.width = width || 160;
		this.height = height || 144;
	}
	
	GroundEntity.prototype.draw = function(ctx, world) {
		this.width = ctx.canvas.width;
		this.height = ctx.canvas.height;
		
		ctx.save();
	    ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(0, this.height);
		for(var i = 0; i < this.heightmap.length; i++){
			ctx.lineTo(i,this.height-heightmap[i]);
		}
		ctx.lineTo(this.width+1,this.height);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};
	
	GroundEntity.prototype.animate = function(world,time) {
	};

	GroundEntity.prototype.collidesWith = function(body){
		var ltwh = body.getLTWH();
		var max = this.heightmap.maxInRange(clamp(ltwh[0],0,this.width), clamp(ltwh[0]+ltwh[2],0,this.width));
		if (max+ltwh[1]+ltwh[3]>this.height) return true;
		return false;
	};
	
	return GroundEntity;
})();

var World = (function () {

    function World() {
    	this.containers = ["nonCollidingEntities","collideAllEntities", "collideGroundEntities","backgroundEntities","groundElements","entities","foregroundEntities"];
        this.entities = [];
		this.backgroundEntities=[];
		this.foregroundEntities=[];
		
        this.nonCollidingEntities = [];
        this.collideGroundEntities = [];
        this.collideAllEntities = [];

		this.groundElements = [];
        this.player = null;
        this.gravity = new Vector2d(0,1e-3);
       	this.roundCount = 0;
    }
	
	World.prototype.render = function(ctx,time){
		var theWorld = this;
		
		this.containers.slice(3).forEach(function(egName){
			var entityGroup = theWorld[egName];
			for(var i=0;i<entityGroup.length;i++){
				// for all renderable entities there should be an isVisible property and a draw function that takes (ctx,world)
				if (entityGroup[i] && entityGroup[i].isVisible) entityGroup[i].draw(ctx,theWorld,time);
			}
		});
	};
	
	World.prototype.animate = function(time){
		var theWorld = this;
		
		this.resolveCollisions(time);
		
		this.containers.slice(3).forEach(function(egName){
			var entityGroup = theWorld[egName];
			for(var i=0;i<entityGroup.length;i++){
				var E = entityGroup[i];
				// for all entities that need be animated there should be properties:
				// isAlive, isMaked, isOnGround, animate(world,time) and applyGravity(vector,time) functions
				E.isAlive && E.animate(theWorld,time);
				E.isOnGround || (E.applyGravity && E.applyGravity(theWorld.gravity,time));
			}
		});

		if(this.roundCount++>200){
			this.clear();
		}
	};
	

	World.prototype.clear = function(){
		this.roundCount=0;
		var theWorld = this;

		this.containers.forEach(function(egName){
			var entityGroup = theWorld[egName];
			for(var i=0;i<entityGroup.length;i++){
				if (entityGroup[i] && entityGroup[i].isMarked) delete entityGroup[i];
			}
			theWorld[egName] = entityGroup.filter(noop);
		});
	};

	World.prototype.resolveCollisions = function(time){
		var ents = this.collideGroundEntities,
		lt = ents.length,
		gents = this.groundElements,
		glt = gents.length,
		ei,ej;
		for(var i =0 ; i < lt; i++){
			ei = ents[i];
			if (!ei) continue;
			for(j=0;j<glt;j++){
				ej = gents[j];
				if(!ei.isOnGround && ej.collidesWith(ei.body)) ei.collideGround(ej);
			}
		}

		ents = this.collideAllEntities;
		lt = ents.length;
		for(var i =0 ; i < lt; i++){
			ei = ents[i];
			if (!ei) continue;
			for(j=i+1;j<lt;j++){
				ej = ents[j];
				if(ei.body.intersects(ej.body)) {ei.collideAction(ej); ej.collideAction(ei);}
			}
		}
	};

	World.prototype.addEntity = function(e,collisionType,zIndex){
		switch (collisionType){
			case 0:
				this.nonCollidingEntities.push(e);
				break;
			case 1:
				this.collideGroundEntities.push(e);
				break;
			case 2:
				this.collideAllEntities.push(e);
				break;
			default:
				this.nonCollidingEntities.push(e);
				break;
		}
		
		switch (zIndex){
			case 1:
				this.backgroundEntities.push(e);
				break;
			case 0:
				this.entities.push(e);
				break;
			case 2:
				this.foregroundEntities.push(e);
				break;
			default:
				this.entities.push(e);
				break;
		}
	}
	
	World.NO_COLLISION = 0;
	World.COLLIDE_GROUND = 1;
	World.COLLIDE_ALL = 2;

	World.FOREGROUND = 2;
	World.CENTER = 0;
	World.BACKGROUND = 1;
	
    return World;
})();

var Effects = (function(){
	function Explosion(params){
		var o = this;
		params = params || {};
		params.mixin({
			count:[15,35],
			size:[1,4],
			strength:.3,
			offset:new Vector2d(0,0),
			colors:P.slice(0,4),
			center: (o.center = new Vector2d(0,0)),
			life: [400,800],
			collisionType: World.NO_COLLISION,
			zIndex: World.BACKGROUND,
			gravityFactor: 1,
			shrink:false
		});

		this.zIndex = params.zIndex;
		this.collisionType = params.collisionType;
		this.particles = [];

		var count = params.count;
		if (count instanceof Array) count = randBetween(count[0],count[1]);
		for(var i=0;i<count;i++){
			var part = new Particle(params.center.copy(),
				randBetween(params.size),
				params.colors.random(),
				randBetween(params.life),
				params.shrink);
			part.body.speed = Vector2d.random(params.strength).doAdd(params.offset);
			part.gravityFactor = randBetween(params.gravityFactor);
			this.particles.push(part);
		}
	}

	Explosion.prototype.fire = function(x,y,world){
		for(var i = 0 ; i < this.particles.length; i++){
			var part = this.particles[i];
			part.body.center[0]=x;
			part.body.center[1]=y;
			world.addEntity(part,this.collisionType,this.zIndex);
		}
	};

	return {
		Explosion: Explosion
	};
})();

var Emitters = (function(){
	function FireEmitter(entity, world){
		this.intervalId = 0;
		this.interval = 50;
		this.entity = entity;
		this.world = world;
	}

	FireEmitter.prototype.start = function(){
		this.intervalId = setInterval(this.iterate,this.interval,this);
	};

	FireEmitter.prototype.iterate = function(emitter){
        var exp = new Effects.Explosion({
            gravityFactor: [-0.4,-0.1],
            collisionType: World.NO_COLLISION,
			life:[600,1000],
			count:[0,2],
			strength: 0.1,
			size:8,
			shrink:true,
			colors: F
        });
        exp.fire(emitter.entity.body.center[0],emitter.entity.body.center[1],emitter.world);
    };

    function WaterEmitter(entity,world){
    	this.intervalId = 0;
		this.interval = 50;
		this.entity = entity;
		this.world = world;
    }

    WaterEmitter.prototype.start = function(){
		this.intervalId = setInterval(this.iterate,this.interval,this);
	};

	WaterEmitter.prototype.iterate = function(emitter){
        var exp = new Effects.Explosion({
            gravityFactor: [0.1,0.4],
            collisionType: World.COLLIDE_GROUND,
			life:[600,1000],
			count:[0,2],
			offset: new Vector2d(0.1,0),
			strength: 0.01,
			size:4,
			shrink:true,
			colors: W
        });
        exp.fire(emitter.entity.body.center[0],emitter.entity.body.center[1],emitter.world);
    };

	return {
		FireEmitter:FireEmitter,
		WaterEmitter:WaterEmitter
	}
})();