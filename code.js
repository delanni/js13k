var container = document.getElementById("canvasContainer");

var aspect = miniCanvas.width / miniCanvas.height;

function calculateCanvasDimensions() {
	if (container.clientHeight>container.clientWidth){
		maxiCanvas.width = container.clientWidth;
		maxiCanvas.height = container.clientWidth / aspect;
	} else {
		maxiCanvas.width = container.clientHeight * aspect;
		maxiCanvas.height = container.clientHeight;
	}
	zoom = maxiCanvas.width/miniCanvas.width;
}

calculateCanvasDimensions();

window.onresize = function(event) {
    calculateCanvasDimensions();
};
