var miniCanvas = document.createElement("canvas");
var maxiCanvas = document.createElement("canvas");
var draftCanvas = document.createElement("canvas");

miniCanvas.width = 160;
miniCanvas.height = 144;

maxiCanvas.width = miniCanvas.width*3;
maxiCanvas.height = miniCanvas.height*3;

var base = document.getElementById("base");
base.appendChild(maxiCanvas);
//base.appendChild(miniCanvas);
//base.appendChild(draftCanvas);
