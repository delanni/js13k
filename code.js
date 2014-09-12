var body = document.body;

var aspect = 228.5/154;

function calculateCanvasDimensions() {
	var width = wrapper.offsetWidth;
	var height = wrapper.offsetHeight;
	var targetWidth = clamp(body.clientWidth * .95,600,1000);
	var targetHeight = clamp(body.clientHeight * .95,600/aspect,1000/aspect);
	var wDiff = width/targetWidth;
	var hDiff = height / targetHeight;
	var factor = Math.max(wDiff,hDiff);
	wrapper.style.width = width  / factor + "px";
	wrapper.style.height = width/aspect / factor + "px";
	veil.style.width = wrapper.style.width;
	veil.style.height = wrapper.style.height;
	document.body.style.fontSize = Math.round(16*(wrapper.offsetWidth-200)/800+16) + "px";
}

calculateCanvasDimensions();

window.onresize = function(event) {
    calculateCanvasDimensions();
};

setTimeout(calculateCanvasDimensions,500);

document.body.addEventListener('touchmove',function(e){
      e.preventDefault();
});
