function KaraokAnim (fw_ctx, params) {

    this.cfg = {
        particles: {
            number: {
                init_value: 15,
                // value: 15,
                density: {
                    enable: true,
                    value_area: 100
                }
            },
            color: {
                value: 'random',
                pool: [
                    '#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
                    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
                    // '#e57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6',
                    // '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
                    // '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
                ]
            },
            size: {
                value: 3,
                random: true,
            }
        },
        interactivity: {
            grab: {
                distance: 100
            }
        }
    };

    this.ctx = {
        particles: {
            array: [],
        },
        characters: {
            words: undefined, // element
            sentences: [],
            index: -1,
            // current_sentence: [], // letters in a sentence
        },
        ghost: false
    };

    fw_ctx && Object.deepExtend(this.ctx, fw_ctx);
    params && Object.deepExtend(this.cfg, params);

    this.prepareCharacters();
}

KaraokAnim.prototype = new Anim();

KaraokAnim.prototype.retinaInit = function () {

    this.cfg.particles.size.value *= this.ctx.canvas.px_ratio;
    this.cfg.interactivity.grab.distance *= this.ctx.canvas.px_ratio;

};

KaraokAnim.prototype.init = function (particles) {

    this.densityAutoParticles();
    this.createParticles(particles);

};

KaraokAnim.prototype.resize = function () {
    
};

KaraokAnim.prototype.refresh = function () {
    
};

KaraokAnim.prototype.onhover = function () {
    
};

KaraokAnim.prototype.onclick = function () {

    // this.circleParticles();

};

KaraokAnim.prototype.stop = function (stopped_callback) {

    const test = ()=>{
        if (!this.clear()) {
            setTimeout(test, 50);
        } else {
            stopped_callback && stopped_callback();
        }
    };

    return new Promise((success)=>{
        this.ctx.particles.array.forEach(p=>p.extinct());

        const cw = this.ctx.characters.sentences[this.ctx.characters.index];
        this.showText(cw, null);

        success();
    }).then(test);

};

KaraokAnim.prototype.clear = function () {

    const arr = this.ctx.particles.array;
    for (let i = 0; i < arr.length; ++i) {
        if (!arr[i].is_extinct) {
            return false;
        }
    }

    this.ctx.particles.array = [];
    this.ctx.characters.index = -1;
    return true;

};

KaraokAnim.prototype.doAction = function () {

    const cw = this.ctx.characters.index < 0 ? [] :
        this.ctx.characters.sentences[this.ctx.characters.index];

    ++this.ctx.characters.index;
    if (this.ctx.characters.index >= this.ctx.characters.sentences.length) {
        this.ctx.characters.index = 0;
        // return false;
    }

    const nw = this.ctx.characters.sentences[this.ctx.characters.index];
    this.showText(cw, nw);

    switch (randomInt(12)) {
        case 0:
            this.imageParticles('flower');
            break;
        case 1:
            this.imageParticles('cake');
            break;
        case 2:
            this.imageParticles('heart');
            break;
        case 3:
            this.imageParticles('eiffel');
            break;
        case 4:
            this.imageParticles('giftbox');
            break;
        case 5:
            this.circleParticles();
            break;
        case 6:
            this.recycleParticles();
            break;
        default:
            if (Math.random() < 0.3)
                this.whiteFlashParticles();
            this.impulseParticles();
            break;
    }

    return true;

};

KaraokAnim.prototype.extractParticles = function () {

    const particles = [];
    this.ctx.particles.array.forEach(p=>particles.push(p.p));
    return particles;

};

KaraokAnim.prototype.drawFrame = function () {

    const canvas = this.ctx.canvas;
    const ctx = canvas.ctx;

    if (this.ctx.ghost) {
        // normally, clearRect() would be used to clear the canvas
        // we want to create a trailing effect though
        // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
        const tmp = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'destination-out';
        // decrease the alpha property to create more prominent trails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.w, canvas.h);
        // change the composite operation back to our main mode
        // lighter creates bright highlight points as the fireworks and particles overlap each other
        ctx.globalCompositeOperation = tmp;
    } else {
        canvas.ctx.clearRect(0, 0, this.ctx.canvas.w, this.ctx.canvas.h);
    }

    this.ctx.particles.array.forEach(p=>p.update());
    this.ctx.particles.array.forEach(p=>p.draw());

};


// particles action

KaraokAnim.prototype.impulseParticles = function () {

    this.ctx.ghost = false;

    const impulseX = Math.random() * 800 - 400;
    const impulseY = -Math.random() * 400;

    this.ctx.particles.array.forEach(p=> {
        p.impulse_x = impulseX;
        p.impulse_y = impulseY;
        if (p.flight_mode !== -1) {
            p.flight_mode = 0;
            p.to_p.radius = randomRange(1, 5);
            p.to_p.x = Math.random() * this.ctx.canvas.w;
            p.to_p.y = Math.random() * this.ctx.canvas.h;
            p.p.vx = Math.cos(p.angle) * Math.random() * 3;
            p.p.vy = Math.sin(p.angle) * Math.random() * 3;
        }
    });

};

KaraokAnim.prototype.whiteFlashParticles = function () {

    this.ctx.ghost = false;

    this.ctx.particles.array.forEach(p=> {
        if (this.flight_mode !== -1) {
            p.flight_mode = 0;
            const color = p.p.color.rgb;
            color.r = 255;
            color.b = 255;
            color.b = 255;
            p.p.radius = Math.random() * 50 + 50;
        }
    });

};

KaraokAnim.prototype.circleParticles = function () {

    this.ctx.ghost = false;

    const canvas = this.ctx.canvas;
    const size = Math.min(canvas.w, canvas.h);
    const radius = Math.floor(randomRange(size / 10, size / 8 * 3));

    let p_count = 0, piece = Math.PI * 2 / this.ctx.particles.array.length;
    upsetArray(this.ctx.particles.array);
    this.ctx.particles.array.forEach(p=> {
        if (p.flight_mode !== -1) {
            p.flight_mode = 0;
            p.to_p.radius = randomRange(1, 5);
            p.to_p.x = canvas.w / 2 + Math.cos(p_count * piece) * radius;
            p.to_p.y = canvas.h / 2 + Math.sin(p_count * piece) * radius;
            p.p.vx = randomRange(-0.25, 0.25);
            p.p.vy = randomRange(-0.25, 0.25);
            p.to_p.color = toRgb({value: this.cfg.particles.color.pool});
            p.impulse_x = 0;
            p.impulse_y = 0;
            p.protect_frame = 10;

            ++p_count;
        }
    });

};

KaraokAnim.prototype.recycleParticles = function () {

    this.ctx.ghost = true;

    const canvas = this.ctx.canvas;
    const size = Math.min(canvas.w, canvas.h);
    const x = canvas.w / 2;
    const y = canvas.h / 2;

    const lockCircle = randomFloat(1) < 0.5 ? -1 : 1;

    let count = 0;
    upsetArray(this.ctx.particles.array);
    this.ctx.particles.array.forEach(p=>{
        if (p.flight_mode !== -1) {
            p.flight_mode = 2;
            p.rc_center_x = x;
            p.rc_center_y = y;
            p.rc_radius = randomRange(size/10, size/8*3);
            p.rc_dv = randomRange(0.02, 0.04) * lockCircle;
            p.rc_d = randomRange(0, Math.PI * 2);
            // p.to_p.radius = Math.random() < 0.99 ? 0 : randomRange(1, 5);
            p.impulse_x = 0;
            p.impulse_y = 0;
            ++count;
        }
    });


};

KaraokAnim.prototype.imageParticles = function (name) {

    this.ctx.ghost = false;

    const tmp_canvas = this.ctx.tmp_canvas.canvas;

    const size = Math.min(tmp_canvas.w, tmp_canvas.h) * randomRange(0.4, 0.6);

    const heartImg = imageFactory.getImage(name || 'eiffel');
    this._drawImage(heartImg, tmp_canvas, {w: size, h: size});

    const shape = canvasToShape(tmp_canvas, this.ctx.tmp_canvas.gap);
    const step = shape.particles.length / this.ctx.particles.array.length;

    const center_x = tmp_canvas.w / 2;
    const center_y = tmp_canvas.h / 2;

    const ox = center_x - shape.w / 2;
    const oy = center_y - shape.h / 2;

    let offset = 0;

    upsetArray(this.ctx.particles.array);
    this.ctx.particles.array.forEach(p=>{
        if (p.flight_mode !== -1) {
            const t = shape.particles[Math.floor(offset)];
            p.flight_mode = 0;
            p.to_p.radius = randomRange(1, 5);
            p.to_p.x = t.x + ox;
            p.to_p.y = t.y + oy;
            p.p.vx = randomRange(-0.2, 0.2);
            p.p.vy = randomRange(-0.2, 0.2);
            p.to_p.color = toRgb({value: this.cfg.particles.color.pool});
            p.impulse_x = 0;
            p.impulse_y = 0;
            p.protect_frame = 10;
        }
        offset += step;
    })

};

KaraokAnim.prototype._drawImage = function (img, canvas, area) {

    canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
    canvas.ctx.drawImage(img, 0, 0, area.w, area.h);

};

// particles action

KaraokAnim.prototype.showText = function (cw, nw) {

    this.ctx.characters.current_sentence = nw;

    if (cw) {
        for (let i = 0; i < cw.length; i++) {
            animateLetterOut(cw, i);
        }
    }

    if (nw) {
        for (let i = 0; i < nw.length; i++) {
            nw[i].className = 'letter behind';
            if (nw[i].innerHTML === '.')
                nw[i].className += ' blank';
            nw[0].parentElement.style.opacity = '1';
            animateLetterIn(nw, i);
        }
    }

    function animateLetterOut(cw, i) {
        setTimeout(function() {
            cw[i].className = 'letter out';
            if (cw[i].innerHTML === '.')
                cw[i].className += ' blank';
        }, i*20);
    }

    function animateLetterIn(nw, i) {
        setTimeout(function() {
            nw[i].className = 'letter in';
            if (nw[i].innerHTML === '.')
                nw[i].className += ' blank';
        }, 200+(i*20));
    }

};

// particles construct

KaraokAnim.prototype.prepareCharacters = function () {

    this.ctx.characters.words = document.getElementsByClassName('word');

    const words = this.ctx.characters.words;
    const sentences = this.ctx.characters.sentences;

    // words[currentWord].style.opacity = 1;
    for (let i = 0; i < words.length; i++) {
        splitLetters(words[i]);
    }

    function splitLetters(word) {
        const content = word.innerHTML;
        word.innerHTML = '';
        let letters = [];
        for (let i = 0; i < content.length; i++) {
            let letter = document.createElement('span');
            letter.className = 'letter';
            letter.innerHTML = content.charAt(i);
            word.appendChild(letter);
            letters.push(letter);
        }

        sentences.push(letters);
    }

};

KaraokAnim.prototype.densityAutoParticles = function () {

    if (this.cfg.particles.number.density.enable) {
        let number = this.cfg.particles.number;
        let canvas = this.ctx.canvas;
        let area = canvas.el.width * canvas.el.height / 1000;

        if (this.ctx.retina) {
            area /= canvas.px_ratio * 2;
        }

        number.value = area * number.init_value / number.density.value_area;
    }

};

KaraokAnim.prototype.createParticles = function (particles) {

    // particles passed in normally is points which get from the last scene
    // if particles is less than this.cfg.particles.number.value, we need
    // push the ext part into arr
    this.pushParticles(particles, this.cfg.particles.number.value);

};

KaraokAnim.prototype.pushParticles = function (particles, n) {

    particles = particles || [];

    let i = 0;
    for (; i < particles.length; ++i) {
        const param = randomFlashPtParam(this.cfg, this.ctx, particles[i]);
        this.ctx.particles.array.push(
            new FlashPt(param, this.ctx)
        );
    }

    for (; i < n; ++i) {
        const param = randomFlashPtParam(this.cfg, this.ctx);
        this.ctx.particles.array.push(
            new FlashPt(param, this.ctx)
        );
    }

};

function randomFlashPtParam(cfg, ctx, p) {

    const x = randomRange(0, ctx.canvas.w);
    const y = ctx.canvas.h / 2;

    const color = toRgb(cfg.particles.color);

    if (p) {
        p.opacity = 1;
    }

    return {
        point: p ? p : new Point({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            color: color,
            radius: 0,
            opacity: 1
        }),
        to_point: new Point({
            x: x,
            y: y,
            color: toRgb({value: cfg.particles.color.pool}),
            radius: randomRange(1, 4),
            opacity: 1
        }),
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        impulse_x: 0,
        impulse_y: 0,
        to_impulse_x: 0,
        to_impulse_y: 0,
        interactivity: {
            mouse: ctx.interactivity.mouse,
            grab: cfg.interactivity.grab
        }
    };

}