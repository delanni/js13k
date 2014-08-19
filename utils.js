randBetween = function(min,max,floorit){
	if (arguments.length==1){
		if (min instanceof Array){
			max = min[1];
			min = min[0];
		} else {
			return min;
		}
	} 
	var n = Math.random()*(max-min)+min;
	return floorit?Math.floor(n):n;
};

clamp = function(value,min,max){
	return Math.min(Math.max(value,min),max);
}

Array.prototype.maxInRange = function(from,to){
	if (from>=0 && to<=this.length && from<to) return Math.max.apply(null,this.slice(from,to));
	return NaN;
};

Array.prototype.random = function(){
	if (this.length<=1) return this[0] || null;
	return this[randBetween(0,this.length,1)];
};

Array.prototype.copy = function(){
	return this.slice();
}

noop = function(e){return e};

Object.prototype.mixin = function(what) {
  for (var k in what) 
  	if (what.hasOwnProperty(k) && !this.hasOwnProperty(k)) this[k] = what[k];
  return this;
}

Object.prototype.markForRemoval= function(){
	this.isVisible = false;
	this.isAlive = false;
	this.isMarked = true;
	if (this.resources){
		for(var i=0;i<this.resources.length;i++)
		this.resources[i].stop();
	}
}