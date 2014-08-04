var Vector2d = (function() {
    function Vector2d(x, y) {
        this[0] = x || 0;
        this[1] = y || 0;
    }

    Vector2d.prototype.add = function(other) {
        return new Vector2d(this[0] + other[0], this[1] + other[1]);
    };

    Vector2d.prototype.doAdd = function(other) {
        this[0] += other[0];
        this[1] += other[1];
        return this;
    };

    Vector2d.prototype.remove = function(other) {
        return new Vector2d(this[0] - other[0], this[1] - other[1]);
    };

    Vector2d.prototype.doRemove = function(other) {
        this[0] -= other[0];
        this[1] -= other[1];
        return this;
    };

    Vector2d.prototype.multiply = function(scalar) {
        return new Vector2d(this[0] * scalar, this[1] * scalar);
    };

    Vector2d.prototype.doMultiply = function(scalar) {
        this[0] *= scalar;
        this[1] *= scalar;
        return this;
    };

    Vector2d.prototype.getMagnitude = function() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    };

    Vector2d.prototype.normalize = function(to) {
        to = to || 1;
        var m = this.getMagnitude();
        return this.doMultiply(1 / m * to);
    };

    return Vector2d;
})();

var AABB = (function() {
    function AABB(center, corner) {
        if (center instanceof Vector2d && corner instanceof Vector2d) {
            this.center = center;
            this.corner = corner;
        }
        else if (arguments.length == 4) {
            this.center = new Vector2d(arguments[0], arguments[1]);
            this.corner = new Vector2d(arguments[2], arguments[3]);
        }
    };

    AABB.prototype.intersects = function(other) {
        if (Math.abs(this.center[0] - other.center[0]) > (this.corner[0] + other.corner[0])) return false;
        if (Math.abs(this.center[1] - other.center[1]) > (this.corner[1] + other.corner[1])) return false;
        return true;
    };

    AABB.prototype.move = function(vector) {
        this.center.doAdd(vector);
        return this;
    };

    AABB.prototype.getLTWH = function() {
        return [
        this.center[0] - this.corner[0],
        this.center[1] - this.corner[1],
        this.corner[0] * 2,
        this.corner[1] * 2];
    };

    return AABB;
})();

var PhysicsBody = (function() {
    function PhysicsBody(boundingBox) {
        this.boundingBox = boundingBox || new AABB();
        this.speed = new Vector2d();
        this.acceleration = new Vector2d();
        this.friction = 0.05;
    }

    PhysicsBody.EPSILON = 5e-3;

    PhysicsBody.prototype.tick = function(ms) {
        this.boundingBox.move(this.speed.multiply(ms));
        this.speed.doAdd(this.acceleration.multiply(ms));
        this.speed.doMultiply(1 - this.friction);
        if (this.speed.getMagnitude() < PhysicsBody.EPSILON) {
            this.speed.doMultiply(0);
        }
        else {
            if (this.speed[0] > 0.1) {
                this.speed[0] = 0.1;
            }
            if (this.speed[1] > 0.3) {
                this.speed[1] = 0.3;
            }
        }
    };

    PhysicsBody.prototype.getLTWH = function() {
        return this.boundingBox.getLTWH();
    };

    return PhysicsBody;
})();

var World = (function() {

    function World() {
        this.entities = [];
        this.player = null;
        this.gravity = 1e-3;
    }

    return World;
})();