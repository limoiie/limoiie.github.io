Object.deepExtend = function (dstObj, srcObj) {
    for (const property in srcObj) {
        if (srcObj.hasOwnProperty(property)) {
            dstObj[property] = srcObj[property];
        }
    }
};

window.requestAnimFrame = (function (){
    // noinspection JSUnresolvedVariable
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = (function () {
    // noinspection JSUnresolvedVariable
    return window.cancelAnimationFrame           ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame    ||
        window.oCancelRequestAnimationFrame      ||
        window.msCancelRequestAnimationFrame     ||
        clearTimeout
})();

function hexToRgb(hex){

    // By Tim Down - http://stackoverflow.com/a/5624139/3493650
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

}

function toRgb(color) {

    if (color.value === 'random') {
        return {
            rgb: {
                r:  randomInt(256),
                g:  randomInt(256),
                b:  randomInt(256)
            }
        }
    } else if (typeof color.value === 'string') {   // #xxxxxx or #xxx
        return {
            rgb: hexToRgb(color.value)
        };
    } else if (typeof color.value === 'object') {
        if (color.value instanceof Array) {  // select randomly from [#xxxxxx, #xxxxxx, ...]
            const selectedColor = randomPick(color.value);
            return {
                rgb: hexToRgb(selectedColor)
            }
        } else if (color.rgb.r !== undefined && color.rgb.g !== undefined && color.rgb.b !== undefined) {
            return {
                rgb: {
                    r: color.rgb.r,
                    g: color.rgb.g,
                    b: color.rgb.b
                }
            }
        }
    }

}

const upsetArray = (arr) => {

    let len = arr.length;
    while (len-- > 0) {
        swap(arr, randomInt(len), randomInt(len));
    }

};

const swap = (arr, i, j) => {

    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;

};

const createRange = (start, end, step) => {

    const arr = [];
    for (let i = start; i < end; i+=step) {
        arr.push(i);
    }
    return arr;

};

const inRange = (val, start, end) => val > start && val < end;

const inArray = (elem, array) => array.indexOf(elem) > -1;

function toRgba(color, opacity) {
    return 'rgba('+color.rgb.r+','+color.rgb.g+','+color.rgb.b+','+opacity+')';
}

const randomInt = (value) => Math.floor(Math.random() * value);

const randomFloat = (value) => Math.random() * value;

const randomPick = (arr) => arr[randomInt(arr.length)];

const randomRange = (min, max) => min + Math.random() * (max-min);

const getFontStyle = (size, family) => 'bold ' + size + 'px ' + family;

const isNumber = (str) => !isNaN(parseFloat(str)) && isFinite(str);

function deepCopy (obj) {
    let copy = obj;
    if (obj instanceof Array) {
        copy = [];
        let i = obj.length;
        while (i--) {
            copy[i] = deepCopy(obj[i]);
        }
    } else if (obj instanceof Object) {
        copy = {};
        for (const k in obj) {
            copy[k] = deepCopy(obj[k]);
        }
    }
    return copy;
}

const drawHeart = (ctx, x, y, size) => {

    size /= 2;
    const w = size, h = size / 2.5;

    const X = x => w*x;
    const Y = y => h*y;

    ctx.save();
    ctx.translate(x, y-size/4);
    ctx.lineTo(X(0),Y(-.8));
    ctx.bezierCurveTo(X(.4),Y(-2.0),X(1),Y(-1.3),X(1),Y(0));
    ctx.bezierCurveTo(X(1),Y(1.3),X(.1),Y(1.8),X(0),Y(3.0));
    ctx.bezierCurveTo(X(-.2),Y(2.8),X(-1),Y(1.3),X(-1),Y(0));
    ctx.bezierCurveTo(X(-1),Y(-1.3),X(-.4),Y(-2.0),X(0),Y(-.8));
    ctx.restore();

};

/*function HeartFactory(size, color, background_color) {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.size = size;
    this.color = color;

    this.bgc_rgb = toRgb(background_color);

    if (!color instanceof Array) {
        this.color = [color];
    }

    this.canvas.width = this.size * color.length;
    this.canvas.height = this.size;

    this.rgb_arr = [];
    color.forEach(c=>{
        const rgb = toRgb({value: c});
        this.ctx.fillStyle = toRgba(rgb, 1);
        this.ctx.beginPath();
        drawHeart(this.ctx, size*this.rgb_arr.length+size/2, size/2, size);
        this.ctx.closePath();
        this.ctx.fill();
        this.rgb_arr.push(rgb);
    });

}

HeartFactory.prototype = {

    drawHeartQuickly: function (ctx, x, y, size, color) {
        let i = 0;
        while (i < this.rgb_arr.length) {
            const rgb = this.rgb_arr[i];
            if (rgb.rgb.r === color.rgb.r &&
                rgb.rgb.g === color.rgb.g &&
                rgb.rgb.b === color.rgb.b)
                break;
            ++i;
        }

        ctx.drawImage(this.canvas,
            this.size*i, 0, this.size, this.size,
            x, y, size*2, size*2);

    }

};*/

function ImageFactory (nameUrlPairs) {

    this.factory = {};
    this.error = false;

    // let cnt = nameUrlPairs.length;
    // for (let i = 0; i < nameUrlPairs.length; ++i) {
    //     const pair = nameUrlPairs[i];
    //     const image = new Image();
    //     image.onload = ()=>{
    //         this.factory[pair.name] = image;
    //         --cnt;
    //     };
    //
    //     image.onerror = ()=>{
    //         this.error = true;
    //         --cnt;
    //     };
    //
    //     image.src = pair.url;
    // }

}

ImageFactory.prototype.getImage = function (name) {

    return this.factory[name] || name;

};

function canvasToShape (canvas, gap) {

    const pixels = canvas.ctx.getImageData(0, 0, canvas.w, canvas.h).data;

    const particles = [];
    const step = 4 * gap;
    let x = 0, y = 0;
    let cx = canvas.w, cy = canvas.h;
    let w = 0, h = 0;

    for (let i = 0; i < pixels.length; i += step) {
        if (pixels[i+3] > 0) {
            particles.push({ x: x, y: y });

            w = x > w ? x : w;
            h = y > h ? y : h;
            cx = x < cx ? x : cx;
            cy = y < cy ? y : cy;
        }

        x += gap;
        if (x >= canvas.w) {
            x = 0;
            y += gap;
            i += step * canvas.w;
        }
    }

    return { particles: particles, w: w+cx, h: h+cy };

}

function distance(sx, sy, tx, ty) {
    const dx = sx - tx, dy = sy - ty;
    return Math.sqrt(dx * dx + dy * dy);
}
