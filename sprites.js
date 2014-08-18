var Frame = (function(){
	function Frame(img,x,y,w,h){
		this.img = img;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	Frame.prototype.drawItself = function(ctx,x,y){
		ctx.drawImage(this.img,this.x,this.y,this.w,this.h,x,y,this.w,this.h);
	};
	
	return Frame;
})();

var Animation = (function(){
	function Animation(img,tileWidth,tileHeight,frameLength){
		this.img = img;
		this.width = tileWidth;
		this.height = tileHeight;
		this.frames = [];
		this.length = 0;
		this.currentFrame =  0;
		this.isReady = false;
		this.frameLength = frameLength;
		this.remainder = 0;
	}
	
	Animation.prototype.init = function(){
		this.length = this.frames.length;
		this.isReady=true;
	};
	
	Animation.prototype.pushNewFrame = function(x,y){
		this.frames.push(new Frame(this.img,x,y,this.width,this.height));
	};
	
	// may be needed to offset the very first frame by -forTime not to skip it
	Animation.prototype.drawFrame = function(ctx,x,y, forTime){
		if(!this.isReady) this.init();
		var t=  (this.remainder+forTime);
		var frameStep = Math.floor(t / this.frameLength);
		this.remainder = t%this.frameLength;
		var frame = this.skip(frameStep);
		frame.drawItself(ctx,x,y);
	};
	
	Animation.prototype.skip = function(frames){
		this.currentFrame = (this.currentFrame+frames)%this.length;
		return this.frames[this.currentFrame];
	};
	
	return Animation;
})();

var SpriteSheet = (function(){
	function SpriteSheet(url, readycallback){
		this.url = url;
		this.w = 0;
		this.h = 0;
		this.img = null;
		this.isReady = false;
		var spr = this;
	}
	
	SpriteSheet.prototype.getXYFor = function(frameCount, tileWidth, tileHeight, animwidth){
		var totalx = frameCount*tileWidth, cw = (animwidth || this.width),
		startx = totalx%cw,
		starty = Math.floor(totalx/cw)*tileHeight;
		return [startx,starty];
	};
		
	SpriteSheet.prototype.getFrameByXY = function(x,y,tileWidth,tileHeight,animwidth){
		var cw = (animwidth || this.width),
		totalx = cw*(y/tileHeight)+x;
		return totalx/tileWidth;
	};
	
	SpriteSheet.prototype.loadImage = function(callback){
		this.img = new Image();
		var spr = this;
		this.img.onload = function(){
			spr.isReady = true;
			spr.width=this.width;
			spr.height=this.height;
			callback();
		}
		this.img.src = this.url;
	};
	
	SpriteSheet.prototype.getAnimation = function(tileWidth,tileHeight, frames, time, start, animwidth){
		var ft = time/(frames.length||frames);
		var a = new Animation(this.img,tileWidth,tileHeight,ft);
		
		var startx = 0;
		var starty = 0;
		var startxy = (typeof start === "number")? this.getXYFor(start,tileWidth,tileHeight, animwidth) : start;
		var f0 = (typeof start === "number" ) ? start: this.getFrameByXY(start[0],start[1],animwidth);
		startx = startxy[0];
		starty = startxy[1];
		
		if (typeof frames === "number"){
			var ar = [];
			for(var i = 0;i<frames;i++) ar.push(i+f0);
			frames = ar;
		}
		
		for(var i =0; i<frames.length;i++){
			var xy = this.getXYFor(frames[i],tileWidth,tileHeight,animwidth);
			a.pushNewFrame(startx+xy[0],starty+xy[1]);
		}
		return a;
	};
	
	return SpriteSheet;
})();

var SpriteSheetLoader = (function(){
	function SpriteSheetLoader(onLoadingReady){
		this.onLoadingReady = onLoadingReady;
		this.spriteSheets = {};
		this.items = 0;
	}
	
	SpriteSheetLoader.prototype.addItem = function(img,key){
		this.items++;
		this.spriteSheets[key]=img;
	};
	
	SpriteSheetLoader.prototype.start = function(n){
		this.intervalId = setInterval(this.checkIfReady,100);
		this.startLoading(n);
	};
	
	SpriteSheetLoader.prototype.startLoading = function(n){
		var i = 0;
		var keys = Object.keys(this.spriteSheets);
		for(var key in keys){
			if (i>n || .length<=0) return;
			this.spriteSheets[key].loadImage(callback);
			i++;
		}
	};
	
	SpriteSheetLoader.prototype.checkIfReady(){
		
	};

	return SpriteSheetLoader;
})();

