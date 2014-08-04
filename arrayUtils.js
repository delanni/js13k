Array.from = function(fn,n) {
	var ls = [];
	for(var i = 0; i<n; i++){
		var rs = ls.push(fn(ls,i));
		if (rs) break;
	}
	return ls;
};