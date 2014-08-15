var Vector2d = (function () {
    function Vector2d(x, y) {
        this[0] = x || 0;
        this[1] = y || 0;
    }

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

    Vector2d.prototype.doRemove = function (other) {
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

    return Vector2d;
})();

var PhysicsBody = (function () {
    function PhysicsBody(center,corner,speed,acceleration) {
		this.center = center || new Vector2d();
		this.corner = corner || new Vector2d();
		this.speed = speed || new Vector2d();
		this.acceleration = acceleration || new Vector2d();
        this.friction = 0.05;
    }

    PhysicsBody.EPSILON = 5e-3;
	PhysicsBody.XLIMIT = 0.1;
	PhysicsBody.YLIMIT = 0.3;

    PhysicsBody.prototype.tick = function (ms) {
        this.move(this.speed.multiply(ms));
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
            if (this.speed[0] > PhysicsBody.XLIMIT) {
                this.speed[0] = PhysicsBody.XLIMIT;
            }
            if (this.speed[1] > PhysicsBody.YLIMIT) {
                this.speed[1] = PhysicsBody.YLIMIT;
            }
        }
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

    return PhysicsBody;
})();

/*
var Entity = (function () {
	function Entity() {
		
	}
	return Entity;
})();
*/

var BoxEntity = (function() {
	function BoxEntity(center,corner, color){
		this.isVisible = true;
		this.color = color;
		this.body = new PhysicsBody(center,corner);
	}
	
	BoxEntity.prototype.draw = function(ctx, world) {
		ctx.save();
	    ctx.fillStyle = this.color;
		ctx.fillRect.apply(ctx,this.body.getLTWH());
		ctx.restore();
	};
	
	BoxEntity.prototype.animate = function(world,time) {
		this.body.tick(time);
		if (!this.body.isOnGround){
			this.body.applyAcceleration(world.gravity,time);
		}
	};
	
	return BoxEntity;
})();

var GroundEntity = (function(){
	function GroundEntity(heightmap){
		this.isVisible = true;
		this.isCollisionAware = true;
		this.heightmap = heightmap;
		this.color = P[2];
	}
	
	GroundEntity.prototype.draw = function(ctx, world) {
		var width = ctx.canvas.width;
		var height = ctx.canvas.height;
		
		ctx.save();
	    ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(0, height);
		for(var i = 0; i < this.heightmap.length; i++){
			ctx.lineTo(i,height-heightmap[i]);
		}
		ctx.lineTo(width+1,height);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};
	
	GroundEntity.prototype.animate = function(world,time) {
	};
	
	return GroundEntity;
})();

var World = (function () {

    function World() {
        this.entities = [];
		this.groundElements = [];
        this.player = null;
        this.gravity = new Vector2d(0,1e-3);
    }
	
	World.prototype.render = function(ctx,time){
		var theWorld = this;
		this.entities.forEach(function(E){
			if (E.isVisible){
				E.draw(ctx,theWorld);
			}
		});
		
		this.groundElements.forEach(function(E){
			if (E.isVisible){
				E.draw(ctx,theWorld);
			}
		});
	};
	
	World.prototype.animate = function(time){
		var theWorld = this;
		
		this.resolveCollisions(time);
		
		this.entities.forEach(function(E){
			if (E.isVisible){
				E.animate(theWorld,time);
			}
		});
	};
	
	World.prototype.resolveCollisions = function(time){
		
	};

    return World;
})();
