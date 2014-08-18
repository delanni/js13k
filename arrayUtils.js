randBetween = function(min,max,floorit){
	var n = Math.random()*(max-min)+min;
	return floorit?Math.floor(n):n;
};

clamp = function(value,min,max){
	return Math.min(Math.max(value,min),max);
}

Array.from = function(fn,n) {
	var ls = [];
	for(var i = 0; i<n; i++){
		var rs = ls.push(fn(ls,i));
		if (rs) break;
	}
	return ls;
};

Array.prototype.maxInRange = function(from,to){
	if (from>=0 && to<=this.length && from<to) return Math.max.apply(null,this.slice(from,to));
	return NaN;
};

noop = function(){};
