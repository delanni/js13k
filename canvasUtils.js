crisp = false;
sanitize = function(args){
	if (crisp) for(var i=0;i<args.length;args[i]=args[i++]|0);
	return args;
}
CanvasRenderingContext2D.prototype.fr= function(){
	var args = sanitize(arguments);
	this.fillRect.apply(this,args);
}
CanvasRenderingContext2D.prototype.tr= function(){
	var args = sanitize(arguments);
	this.translate.apply(this,args);
}
