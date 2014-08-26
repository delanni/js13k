var body = document.body;

var aspect = 228.5/154;

function calculateCanvasDimensions() {
	if (body.clientHeight-40>body.clientWidth && parseInt(wrapper.style.width)<body.clientWidth){
		wrapper.style.width = body.clientWidth + "px";
		wrapper.style.height = body.clientWidth / aspect + "px";
	} else {
		wrapper.style.width = (body.clientHeight-40) * aspect + "px";
		wrapper.style.height = (body.clientHeight-40) + "px";
	}
	zoom = maxiCanvas.width/miniCanvas.width;
}

calculateCanvasDimensions();

window.onresize = function(event) {
    calculateCanvasDimensions();
};

document.body.addEventListener('touchmove',function(e){
      e.preventDefault();
});
