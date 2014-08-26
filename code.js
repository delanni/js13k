var body = document.body;

var aspect = 228.5/154;

function calculateCanvasDimensions() {
	if (body.clientHeight>body.clientWidth && parseInt(wrapper.style.width)<body.clientWidth){
		wrapper.style.width = body.clientWidth + "px";
		wrapper.style.height = body.clientWidth / aspect + "px";
	} else {
		wrapper.style.width = body.clientHeight * aspect + "px";
		wrapper.style.height = body.clientHeight + "px";
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
