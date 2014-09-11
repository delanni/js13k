var body = document.body;

var aspect = 228.5/154;

function calculateCanvasDimensions() {
	if (body.clientHeight*.95>body.clientWidth && parseInt(wrapper.style.width)<body.clientWidth){
		var siz=clamp(body.clientWidth,200,800);
		wrapper.style.width =  + "px";
		wrapper.style.height = siz / aspect + "px";
	} else {
		var siz=clamp(body.clientHeight*.95,180,600);
		wrapper.style.width =  siz* aspect + "px";
		wrapper.style.height = siz+ "px";
	}
	veil.style.width = wrapper.style.width;
	veil.style.height = wrapper.style.height;
}

calculateCanvasDimensions();

window.onresize = function(event) {
    calculateCanvasDimensions();
};

setTimeout(calculateCanvasDimensions,500);

document.body.addEventListener('touchmove',function(e){
      e.preventDefault();
});
