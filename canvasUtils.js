HTMLCanvasElement.prototype.putPixels = function(pixels) {
    if (arguments.length > 1) pixels = arguments;

    var ctx = this.getContext("2d");
    var imgData = ctx.getImageData(0, 0, this.width, this.height);

    for (var i = 0; i < pixels.length; i++) {
        var px = pixels[i];
        var r, g, b, a;
        var x, y, origin;

        x = px[0];
        y = px[1];
        origin = ((this.width * y + x) * 4) | 0;
        if (px.length > 3) {
            r = px[2];
            g = px[3];
            b = px[4];
            if (isNaN(a = parseInt(px[5]))) {
                a = 255;
            }
        }
        else {
            var c = px[2].split("");
            r = parseInt(c[1] + c[2], 16);
            g = parseInt(c[3] + c[4], 16);
            b = parseInt(c[5] + c[6], 16);
            a = c.length > 7 ? parseInt(c[7] + c[8], 16) : 255;
        }
        imgData.data[origin] = r;
        imgData.data[origin + 1] = g;
        imgData.data[origin + 2] = b;
        imgData.data[origin + 3] = a;
    }
    ctx.putImageData(imgData, 0, 0);
}

HTMLCanvasElement.prototype.copyFrom = function(otherCanvas) {
    var ctx = this.getContext("2d");
    ctx.drawImage(otherCanvas, 0, 0, this.width, this.height);
};

HTMLCanvasElement.prototype.olivize = function(scale) {
    // scale is [.25,.50,.75];
    // instead, it should be [(y(o1)+y(o2))/2, (y(o2)+y(o3))/2, (y(o3)+y(o4))/2]
    // where y(on) is the intensity of the nth olive color
    var ctx = this.getContext("2d");

    var imgData = ctx.getImageData(0, 0, this.width, this.height);
    var r, g, b, y, c;
    for (var i = 0; i < imgData.data.length; i += 4) {
        r = imgData.data[i];
        g = imgData.data[i + 1];
        b = imgData.data[i + 2];
        y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        var index = (y * 4 / 255) | 0;
        c = R[index];
        imgData.data[i] = c[0];
        imgData.data[i + 1] = c[1];
        imgData.data[i + 2] = c[2];
    }

    ctx.putImageData(imgData, 0, 0);
}

/*
HTMLCanvasElement.prototype.extract4Bit = function() {
    var ctx = this.getContext("2d");
    var s = ctx.getImageData(0, 0, this.width, this.height);
    
    var out = new Uint8Array(this.width*this.height/4);
    var outIndex = 0;
    
    var puffer = [];
    var pufferIndex = 0;
    
    for (var i = 0; i < s.data.length; i += 4) {
        switch (s.data[i]) {
        case 15:
            puffer[pufferIndex%4]=0x00;
            break;
        case 48:
            puffer[pufferIndex%4]=0x01;
            break;
        case 139:
            puffer[pufferIndex%4]=0x02;
            break;
        case 155:
            puffer[pufferIndex%4]=0x03;
            break;
        default:
            throw new Error("Image malformed");
        }
        if (pufferIndex%4==3){
            var code = puffer[0]<<6;
            code += puffer[1]<<4;
            code += puffer[2]<<2;
            code += puffer[3];
            out[outIndex++]=code;
        }
        pufferIndex++;
    }
    return out;
}

HTMLCanvasElement.prototype.fillFrom4Bit = function(array) {
    var pixels = this.width*this.height;
    if (pixels != array.length*4) return false;
    var pIndex = 0;
    
    var ctx = this.getContext("2d");
    var imgData = ctx.getImageData(0,0,this.width,this.height);
    
    for(var i = 0 ; i < array.length ; i++){
        var e = array[i];
        for (var j = 0 ; j<4; j++){
            var idx = e&0x03;
            var c = R[idx];
            
            imgData.data[pIndex*4+0]=c[0];
            imgData.data[pIndex*4+1]=c[1];
            imgData.data[pIndex*4+2]=c[2];
            imgData.data[pIndex*4+3]=255;
            
            e>>=2;
            pIndex++;
        }
    }
    ctx.putImageData(imgData,0,0);
}
*/