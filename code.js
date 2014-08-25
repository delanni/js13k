var miniCanvas = document.createElement("canvas");
//var maxiCanvas = document.createElement("canvas");
var draftCanvas = document.createElement("canvas");
var container = document.getElementById("canvasContainer");

miniCanvas.width = 160;
miniCanvas.height = 144;

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


//var base = document.getElementById("base");
//base.appendChild(maxiCanvas);
//base.appendChild(miniCanvas);
//base.appendChild(draftCanvas);
