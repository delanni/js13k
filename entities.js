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

    Vector2d.prototype.set = function(loc){
    	this[0]=loc[0];
    	this[1]=loc[1];
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
		this.friction = 0.006;
    }

    PhysicsBody.EPSILON = 5e-3;
	PhysicsBody.XLIMIT = 0.5;
	PhysicsBody.YLIMIT = 0.5;

    PhysicsBody.prototype.tick = function (ms) {
        this.move(this.speed.multiply(ms));
		this.rotate(this.angularSpeed*ms);
        this.speed.doAdd(this.acceleration.multiply(ms));
        this.speed.doMultiply(1 - this.friction*ms);
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
        this.limitSpeed();
	};
	
	PhysicsBody.prototype.limitSpeed = function(){
		var mag = this.speed.getMagnitude();
		if (mag!=0){
			if (mag < PhysicsBody.EPSILON) {
	            this.speed.doMultiply(0);
	        } else {
	        	if (Math.abs(this.speed[0]) > PhysicsBody.XLIMIT) {
	                this.speed[0] = clamp(this.speed[0], -PhysicsBody.XLIMIT, PhysicsBody.XLIMIT);
	            }
	            if (Math.abs(this.speed[1]) > PhysicsBody.YLIMIT) {
	                this.speed[1] = clamp(this.speed[1], -PhysicsBody.YLIMIT, PhysicsBody.YLIMIT);
	            }
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

	PhysicsBody.prototype.gravitateTo = function (location,time){
		time = Math.min(time,77);
		this.speed = (location.substract(this.center).multiply(time/3000));
	};

    return PhysicsBody;
})();


var Entity = (function () {
	function Entity() {
		this.resources = [];
	}
	
	Entity.prototype.kind = -1;
	Entity.prototype.isVisible = true;
	Entity.prototype.isAlive = true;
	Entity.prototype.isOnGround = false;
	Entity.prototype.isMarked=false;
	Entity.prototype.life = Infinity;
	Entity.prototype.draw = noop;
	Entity.prototype.collideAction = noop;
	Entity.prototype.applyGravity = noop;
	Entity.prototype.collideGround = noop;
	
	Entity.prototype.animate = function(world,time) {
		if (!this.isAlive) return;
		this.body.tick(time);
		if (this.onAnimate) this.onAnimate(world,time);
		if (this.resources) this.resources.forEach(function(e){e.tick(world,time);});
		this.life-=time;
		if (this.life<0 || this.life > this._life) this.markForRemoval();
	};

	return Entity;
})();

var EntityKind = {
	POISONBALL: 13,
	BUBBLE: 12,
	PARTICLE : 11,
	FIREBALL :1,
	PLAYER : 0,
	SPRITE : 10,
	FIREEMITTER: 2,
	WATEREMITTER:3,
	WATERBOLT: 4,
	THUNDERBOLT : 5,
	EARTHBOMB: 6
}

var SpriteEntity = (function(_super){
	__extends(SpriteEntity, _super);

	function SpriteEntity(spritesheet,center,w,h,animations){	
		_super.call(this);
		this.kind = EntityKind.SPRITE;
		this.animations = [];
		this.currentAnimation = 0;
		this.body = new PhysicsBody(center.copy(), new Vector2d(w/2,h/2));
		this.spritesheet = spritesheet;
		this.scale = [1,1];
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
		a.drawFrame(ctx,time,v[0],v[1],this.scale[0], this.scale[1]);
	};

	return SpriteEntity;
})(Entity);

var Particle = (function(_super) {
	__extends(Particle,_super);

	function Particle(center,size,color,life,shrink){
		this.fill.apply(this, arguments);
	}

	Particle.prototype.fill = function(center,size,color,life,shrink){
		this.kind = EntityKind.PARTICLE;
		this.color = color;
		this.body = new PhysicsBody(center,new Vector2d(size/2,size/2));
		this.life = this._life = life || 300;
		this.gravityFactor = 1;
		this.shrinkage = (shrink?(size/2)/this.life:0)*shrink;
	}
	
	Particle.prototype.draw = function(ctx, world, time) {
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2],h=ltwh[3];
		ctx.save();
		ctx.translate(l+w/2,t+h/2);
		ctx.rotate(this.body.rotation);
	    ctx.fillStyle = this.color;
		ctx.fillRect(-w/2,-h/2,w,h);
		ctx.restore();
	};
	
	Particle.prototype.onAnimate = function(world,time) {
			this.body.corner.doSubstract([this.shrinkage*time,this.shrinkage*time]);
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
})(Entity);

var Bubble = (function(_super) {
	__extends(Bubble,_super);

	function Bubble(center,size,color,life,shrink){
		this.fill.apply(this, arguments);
	}

	Bubble.prototype.fill = function(center,size,color,life,shrink){
		this.kind = EntityKind.BUBBLE;
		this.color = color;
		this.body = new PhysicsBody(center,new Vector2d(size/2,size/2));
		this.life = this._life = life || 300;
		this.gravityFactor = 1;
		this.shrinkage = (shrink?(size/2)/this.life:0)*shrink;
	}
	
	Bubble.prototype.draw = function(ctx, world, time) {
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2],h=ltwh[3];
		ctx.save();
		ctx.translate(l+w/2,t+h/2);
		ctx.rotate(this.body.rotation);
	    ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(0,0 ,this.body.corner.getMagnitude(), 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.restore();
	};
	
	Bubble.prototype.onAnimate = function(world,time) {
			this.body.corner.doAdd([this.shrinkage*time,this.shrinkage*time]);
	};

	Bubble.prototype.applyGravity = function(gravityVector,time){
		this.body.applyAcceleration(gravityVector.multiply(this.gravityFactor),time);
	};

	Bubble.prototype.collideGround = function (other){
		this.markForRemoval();
		new Effects.Explosion({
			colors:[this.color],
			shrink:1,
			count:[5,7],
			strength:.15,
			offset: new Vector2d(0,-0.1),
			center: this.body.center,
			gravityFactor :1,
			life:200
		}).fire(this.body.center,World.instance);
	};

	return Bubble;
})(Entity);

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
		/*for(var i = 0; i < this.heightmap.length; i++){
			if (i!=0&& this.heightmap[i]==this.heightmap[i+1]) continue;
			ctx.lineTo(i,this.height-heightmap[i]);
		}
		*/
		ctx.lineTo(0,this.height-heightmap);
		ctx.lineTo(this.width,this.height-heightmap);
		ctx.lineTo(this.width+1,this.height);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};
	
	GroundEntity.prototype.animate = noop;

	GroundEntity.prototype.collidesWith = function(body){
		var ltwh = body.getLTWH();
		//var max = this.heightmap.maxInRange(clamp(ltwh[0],0,this.width), clamp(ltwh[0]+ltwh[2],0,this.width));
		var max = this.heightmap;
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

       	this.pool = [];
		World.instance = this;
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

		if(this.roundCount++>30) this.clear();
	};
	

	World.prototype.clear = function(){
		this.roundCount=0;
		var theWorld = this;

		this.containers.forEach(function(egName){
			var entityGroup = theWorld[egName];
			if (theWorld.containers.indexOf(egName)<3){
				theWorld[egName] = entityGroup.filter(function(en){
					if (en && en.isMarked){
						if (en.kind == EntityKind.PARTICLE) theWorld.pool.push(en);
						return false;
					}
					return true;
				});
			} else {
				theWorld[egName] = entityGroup.filter(function(en){
					if (en && en.isMarked){
						return false;
					}
					return true;
				});
			}
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
			if (!ei || ei.isMarked) continue;
			for(j=0;j<glt;j++){
				ej = gents[j];
				if(!ei.isOnGround && ej.collidesWith(ei.body)) ei.collideGround(ej);
			}
		}

		ents = this.collideAllEntities;
		lt = ents.length;
		for(var i =0 ; i < lt; i++){
			ei = ents[i];
			if (!ei || ei.isMarked || !ei.isAlive) continue;
			for(j=i+1;j<lt;j++){
				ej = ents[j];
				if (!ej || ej.isMarked || !ej.isAlive) continue;
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
	function Explosion(params, timeFactor){
		var tf = (timeFactor / 16.666)||1;
		var o = this;
		this.params = params || {};
		this.params.mixin({
			count:[15,35],
			size:[1,4],
			strength:.3,
			offset:new Vector2d(0,0),
			colors: P,
			center: (o.center = new Vector2d(0,0)),
			life: [400,800],
			collisionType: World.NO_COLLISION,
			zIndex: World.BACKGROUND,
			gravityFactor: 1,
			shrink:false,
			particleType: Particle
		});

		this.zIndex = params.zIndex;
		this.collisionType = params.collisionType;
		var count = params.count;
		if (count instanceof Array) count = randBetween(count[0],count[1]);
		count = Math.ceil(count * tf);
		this.count = count;
	}

	Explosion.prototype.fire = function(xy,world){
		var pm = this.params;
		for(var i = 0 ; i < this.count; i++){
			if (world.pool.length && pm.particleType==Particle){
				var part = world.pool.pop();
				part.isAlive = part.isVisible = !(part.isMarked=false);
				part.fill(xy.copy(),
				randBetween(pm.size),
				pm.colors.random(),
				randBetween(pm.life),
				pm.shrink);
			} else {
				var part = new pm.particleType(xy.copy(),
					randBetween(pm.size),
					pm.colors.random(),
					randBetween(pm.life),
					pm.shrink);
			}
			part.isOnGround = false;
			part.body.speed = Vector2d.random(pm.strength).doAdd(pm.offset);
			part.gravityFactor = randBetween(pm.gravityFactor);
			world.addEntity(part,this.collisionType,this.zIndex);
		}
	};

	return {
		Explosion: Explosion
	};
})();

var Emitters = (function(){
	function FireEmitter(entity, world){
		this.kind = EntityKind.FIREEMITTER;
		this.entity = entity;
		this.world = world;
		this.params = {
            gravityFactor: [-0.4,-0.1],
            collisionType: World.NO_COLLISION,
			life:[600,1000],
			count:[0,2],
			strength: 0.1,
			size:8,
			shrink:1,
			colors: F,
			particleType: Particle
        };
        this.exploder = new Effects.Explosion(this.params);
	}
	
	function PoisonEmitter(entity, world){
		this.kind = EntityKind.POISONEMITTER;
		this.entity = entity;
		this.world = world;
		this.params = {
            gravityFactor: [-0.2,-0.4],
            collisionType: World.NO_COLLISION,
			life:[600,800],
			count:[0,1],
			strength: 0.1,
			size:2,
			shrink:2,
			colors: P,
			particleType: Bubble
        };
        this.exploder = new Effects.Explosion(this.params);
	}

    function WaterEmitter(entity,world){
		this.entity = entity;
		this.kind = EntityKind.WATEREMITTER;
		this.world = world;
		this.params = {
            gravityFactor: [0.1,0.4],
            collisionType: World.COLLIDE_GROUND,
			life:[600,1000],
			count:[0,2],
			offset: new Vector2d(0.1,0),
			strength: 0.01,
			size:4,
			shrink:0.3,
			colors: W,
        };
        this.exploder = new Effects.Explosion(this.params);
    }
	
	PoisonEmitter.prototype.tick = FireEmitter.prototype.tick = WaterEmitter.prototype.tick = function(world,time){
        this.exploder.fire(this.entity.body.center,this.world);
    };

	return {
		FireEmitter:FireEmitter,
		WaterEmitter:WaterEmitter,
		PoisonEmitter:PoisonEmitter,
	}
})();

var Projectiles = (function(_super){
	__extends(Fireball,_super);
	__extends(Waterbolt,_super);
	__extends(Poisonball,_super);
	
	function Fireball(center,speed,size,world) {
		_super.call(this);
		this.kind = EntityKind.FIREBALL;
		this.life = this._life = 1500;
		this.body = new PhysicsBody(center.copy(), new Vector2d(size,size));
		this.body.speed.doAdd(speed);
		this.body.friction = 0;
		this.color = F.random();
		this.emitter = new Emitters.FireEmitter(this,world);
		//this.emitter.params.gravityFactor = [-0.4,0.1];
		this.emitter.params.gravityFactor = [-0.1,0.1];
		this.emitter.params.strength = 0.05;
		this.emitter.params.count = [0,1];

		this.resources.push(this.emitter);
	}

	Fireball.prototype.draw = function(ctx, world, time) {
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2];
		ctx.save();
		ctx.translate(l+w/2,t+w/2);
	    ctx.fillStyle = this.color;
		ctx.fillRect(-w/2,-w/2,w,w);
		ctx.restore();
	};

	Fireball.prototype.collideAction = function(other){
		if (other.kind == this.kind) return;
		this.markForRemoval();
		var exp = new Effects.Explosion({gravityFactor:.7,colors:F,offset:this.body.speed.multiply(.5),zIndex:World.FOREGROUND, collisionType: World.COLLIDE_GROUND, shrink:.6});
		exp.fire(this.body.center,world);
	};
	
	function Waterbolt(center,speed,size,world){
		_super.call(this);
		this.kind = EntityKind.WATERBOLT;
		this.life =this._life = 1500;
		this.body = new PhysicsBody(center.copy(), new Vector2d(size,size));
		this.body.speed.doAdd(speed);
		this.body.friction = 0;
		this.color = W.random();
		this.emitter = new Emitters.WaterEmitter(this,world);
		this.emitter.params.count = [-1,1];

		this.resources.push(this.emitter);
	}
	
	Waterbolt.prototype.collideAction = function(other){
		if (other.kind == this.kind) return;
		this.markForRemoval();
		var exp = new Effects.Explosion({gravityFactor:.8,colors:W,offset:this.body.speed.multiply(.25),zIndex:World.FOREGROUND, collisionType: World.COLLIDE_GROUND, shrink:.8});
		exp.fire(this.body.center,world);
	};
	
	Waterbolt.prototype.draw = function(ctx, world, time) {		
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2],h=ltwh[3];
		ctx.save();
		ctx.translate(l+w/2,t+h/2);
		ctx.rotate(this.body.rotation);
	    ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(0,0 ,this.body.corner.getMagnitude(), 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.restore();
	};

	function Poisonball(center,speed,size,world) {
		_super.call(this);
		this.kind = EntityKind.POISONBALL;
		this.life = this._life = 1500;
		this.body = new PhysicsBody(center.copy(), new Vector2d(size,size));
		this.body.speed.doAdd(speed);
		this.body.friction = 0;
		this.color = P[3];
		this.emitter = new Emitters.PoisonEmitter(this,world);

		this.resources.push(this.emitter);
	}
	
	Poisonball.prototype.collideAction = function(other){
		if (other.kind == this.kind) return;
		this.markForRemoval();
		var exp = new Effects.Explosion({gravityFactor:-.3,colors:P,zIndex:World.FOREGROUND, collisionType: World.NO_COLLISION, shrink:2, particleType:Bubble, life:[150,500], strength:0.3, count:[4,10]});
		exp.fire(this.body.center,world);
	};
	
	Poisonball.prototype.draw = function(ctx, world, time) {		
		var ltwh=this.body.getLTWH(),l=ltwh[0],t=ltwh[1],w=ltwh[2],h=ltwh[3];
		ctx.save();
		ctx.translate(l+w/2,t+h/2);
		ctx.rotate(this.body.rotation);
	    ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(0,0 ,this.body.corner.getMagnitude(), 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.restore();
	};
	
	return {
		Fireball : Fireball,
		Waterbolt : Waterbolt,
		Poisonball: Poisonball
	}
})(Entity);
