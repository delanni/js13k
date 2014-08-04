var r = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60,  1000 / 60);
    };
})();


var box = new PhysicsBody(new AABB(50,50,5,6));

var animate = function(time) {
    // animate animatables
    box.tick(time);
};

var readInputs = function(time){
    /*box.acceleration[0] = box.acceleration[1] = 0;
    if (readInputs.keys[38]) {
        box.acceleration[1]=-1e-3;
    }
    if (readInputs.keys[40]) {
        box.acceleration[1]=1e-3;
    }
    if (readInputs.keys[39]) {
        box.acceleration[0]=1e-3;
    }
    if (readInputs.keys[37]) {
        box.acceleration[0]=-1e-3;
    }*/
};
readInputs.keys = {};
document.body.addEventListener("keydown", function (e) {
    readInputs.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    readInputs.keys[e.keyCode] = false;
});

var render = function(time) {
    // render renderables to mini canvas (GB sized)
    // then olivize and  
    // miniCanvas.olivize();
    var ctx = miniCanvas.getContext("2d");
    ctx.fillStyle = P[0];
    ctx.fillRect(0,0,miniCanvas.width,miniCanvas.height);
    ctx.fillStyle = P[2];
    ctx.fillRect.apply(ctx,box.getLTWH());
    
    maxiCanvas.copyFrom(miniCanvas);
};


var meter = new FPSMeter();
var gameLoop = function(n) {
    meter.tickStart();
    
    if (!gameLoop.lastTime) {
        gameLoop.lastTime = n;
        r(gameLoop);
        meter.tick();
        return;
    }
    r(gameLoop);
    readInputs();
    animate(n-gameLoop.lastTime);
    render(n-gameLoop.lastTime);
    gameLoop.lastTime = n;
    meter.tick();
};

gameLoop();