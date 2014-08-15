randBetween = function(min,max,floorit){
	var n = Math.random()*(max-min)+min;
	return floorit?Math.floor(n):n;
};

Array.from = function(fn,n) {
	var ls = [];
	for(var i = 0; i<n; i++){
		var rs = ls.push(fn(ls,i));
		if (rs) break;
	}
	return ls;
};
