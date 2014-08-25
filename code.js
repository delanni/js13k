var miniCanvas = document.createElement("canvas");
//var maxiCanvas = document.createElement("canvas");
var draftCanvas = document.createElement("canvas");
var container = document.getElementById("canvasContainer");

miniCanvas.width = 160;
miniCanvas.height = 144;

var aspect = miniCanvas.height / miniCanvas.width;

function calculateCanvasDimensions() {
	maxiCanvas.width = container.clientHeight * aspect;
	maxiCanvas.height = container.clientHeight;
}

calculateCanvasDimensions();

window.onresize = function(event) {
    calculateCanvasDimensions();
};


//var base = document.getElementById("base");
//base.appendChild(maxiCanvas);
//base.appendChild(miniCanvas);
//base.appendChild(draftCanvas);
