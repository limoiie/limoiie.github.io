let heartFactory;

function ShapeShiftAnim (fw_ctx, params) {

    this.cfg = {
        background: {
            color: {
                value: '#111'
            }
        },
        shape_shift: {
            font: {
                family: 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif',
                size: 320
            },
            cmd: '霏|Happy|Birthday|And|Best|Wishes|For|Such|Beautiful|Graceful|Girl|Like|You',
            auto_play: {
                enable: false,
                duration: 1400
            },
        },
        particles: {
            number: {
                init_value: 15,
                density: {
                    enable: true,
                    value_area: 100
                }
            },
            color: {
                value: [
                    '#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
                    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
                    // '#e57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6',
                    // '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
                    // '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
                ]
            },
            shape: {
                type: 'circle',
            },
            opacity: {
                value: 1,
                random: false,
                anim: {
                    enable: true,
                    speed: 0.2,
                    opacity_min: 0,
                    sync: false
                }
            },
            size: {
                value: 3,
                standing: {
                    value: 4,         // standing
                    min: 10, max: 30  // expanded
                },
                random: true,
                anim: {
                    enable: true,
                    speed: 4,
                    size_min: 0,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 200,
                color: {
                    value: '#fff'
                },
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.2,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'bubble'
                    },
                    resize: true
                },
                modes: {
                    grab:{
                        distance: 100,
                        line_linked:{
                            opacity: 1
                        }
                    },
                    bubble:{
                        distance: 200,
                        size: 30,
                        opacity: 1,
                        duration: 0.4
                    }
                }
            }
        },
        meteors: {
            number: {
                value: 3
            },
            color: {
                value: [
                    '#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
                    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
                ]
            },
            opacity: {
                value: 1
            },
            size: {
                value: 1,
                init_tail: 400,
                max_tail: 400,
                anim: {
                    enable: true,
                    speed: 1,
                    sync: false
                }
            },
            move: {
                enable: true,
                speed: 1600,
                min_speed: 1400,
                random: true,
                direction: {
                    value: 90,
                    random: true
                },
                duration: 1
            }
        }
    };

    this.ctx = {
        particles: {
            array: [],
            meteors: [],
        },
        shape_shift: {
            cmd_queue: this.cfg.shape_shift.cmd.split('|'),
            last_action_time: undefined
        },
        tmp: {
            heart: undefined
        },
        fn: {

        }
    };

    fw_ctx && Object.deepExtend(this.ctx, fw_ctx);
    params && Object.deepExtend(this.cfg, params);

}

ShapeShiftAnim.prototype = new Anim();


/* --- particlesJS functions - inherit from Anim ------ */

ShapeShiftAnim.prototype.retinaInit = function () {

    let cfgParticles = this.cfg.particles;
    let ctx = this.ctx;

    cfgParticles.size.value *= ctx.canvas.px_ratio;
    cfgParticles.size.standing.value *= ctx.canvas.px_ratio;
    cfgParticles.size.standing.min *= ctx.canvas.px_ratio;
    cfgParticles.size.standing.max *= ctx.canvas.px_ratio;
    cfgParticles.size.anim.speed *= ctx.canvas.px_ratio;

    cfgParticles.move.speed *= ctx.canvas.px_ratio;

    cfgParticles.line_linked.distance *= ctx.canvas.px_ratio;
    cfgParticles.line_linked.width *= ctx.canvas.px_ratio;

    cfgParticles.interactivity.modes.grab.distance *= ctx.canvas.px_ratio;
    cfgParticles.interactivity.modes.bubble.distance *= ctx.canvas.px_ratio;
    cfgParticles.interactivity.modes.bubble.size *= ctx.canvas.px_ratio;

};

ShapeShiftAnim.prototype.init = function (particles) {

    /*heartFactory = new HeartFactory(60,
        this.cfg.particles.color.value,
        this.cfg.background.color,
        this.ctx.canvas.ctx);*/

    this.densityAutoParticles();
    this.createParticles(particles);

};

ShapeShiftAnim.prototype.resize = function () {

};

ShapeShiftAnim.prototype.refresh = function () {

    this.clearParticles();

};

ShapeShiftAnim.prototype.onhover = function () {
    // TODO:
};

ShapeShiftAnim.prototype.onclick = function () {

};

ShapeShiftAnim.prototype.quickStop = function () {

    this.ctx.shape_shift.cmd_queue = this.cfg.shape_shift.cmd.split('|');
    this.ctx.particles.array = [];
    this.ctx.particles.meteors = [];

};

ShapeShiftAnim.prototype.stop = function (stopped_callback) {

    const test = ()=>{
        if (!this.clear()) {
            setTimeout(test, 50);
        } else {
            stopped_callback && stopped_callback();
        }
    };

    return new Promise((success)=>{
        const arr = this.ctx.particles.array;
        for (let i = 0; i < arr.length; ++i) {
            const particle = arr[i];
            particle.extinct();
        }
        // this.ctx.particles.arr.forEach(p=>p.extinct());
        this.ctx.particles.meteors.forEach(p=>p.extinct());

        success();
    }).then(test);

};

ShapeShiftAnim.prototype.clear = function () {

    const arr = this.ctx.particles.array;
    for (let i = 0; i < arr.length; ++i) {
        if (!arr[i].is_extinct) {
            return false;
        }
    }

    this.ctx.shape_shift.cmd_queue = this.cfg.shape_shift.cmd.split('|');
    this.ctx.particles.array = [];
    this.ctx.particles.meteors = [];
    return true;

};

ShapeShiftAnim.prototype.extractParticles = function () {

    const particles = [];
    this.ctx.particles.array.forEach(p=>particles.push(p.p));
    return particles;

};

ShapeShiftAnim.prototype.doAction = function () {

    if (this.ctx.shape_shift.cmd_queue.length === 0) {
        // this.ctx.shape_shift.cmd_queue = this.cfg.shape_shift.cmd.split('|');
        return false;
    }

    const cmd = this.ctx.shape_shift.cmd_queue.shift();

    let obj = cmd;
    const pair = cmd.split(' ');
    if (pair[0] === '#icon') {
        obj = imageFactory.getImage(pair[1]);
    }

    this.switchShape(this.createShape(obj));
    return true;

};

ShapeShiftAnim.prototype.drawFrame = function () {

    this.ctx.canvas.ctx.clearRect(0, 0, this.ctx.canvas.w, this.ctx.canvas.h);

    this.actionInTiming();

    this.ctx.particles.array.forEach(p=>p.update());
    this.ctx.particles.meteors.forEach(m=>m.update());

    this.ctx.particles.array.forEach(p=>p.draw());
    this.ctx.particles.meteors.forEach(p=>p.draw());

};

ShapeShiftAnim.prototype.actionInTiming = function() {

    let shouldDo = false;
    if (this.cfg.shape_shift.auto_play.enable) {
        const now = new Date();
        if (this.ctx.shape_shift.last_action_time) {
            if (now.getTime() - this.ctx.shape_shift.last_action_time.getTime() >
                this.cfg.shape_shift.auto_play.duration) {
                this.ctx.shape_shift.last_action_time = now;
                shouldDo = true;
            }
        } else {
            this.ctx.shape_shift.last_action_time = now;
        }
    }

    if (shouldDo) {
        this.onclick();
    }

};


/* ------ particlesJS functions - shape shift --------- */

ShapeShiftAnim.prototype.shuffleIdle = function () {

    const area = { w: this.ctx.canvas.w, h: this.ctx.canvas.h };
    this.ctx.particles.array.forEach(p=>{
        p.move({
            x: Math.random() * area.w,
            y: Math.random() * area.h,
            radius: p.init_radius,
            opacity: p.init_opacity
        });
    });

};


ShapeShiftAnim.prototype.switchShape = function (shape) {

    const area = { w: this.ctx.canvas.w, h: this.ctx.canvas.h };
    const centerPos = { x: (area.w - shape.w) / 2, y: (area.h - shape. h) / 2 };

    const particles = this.ctx.particles.array;
    this.pushParticles(shape.particles.length - particles.length);

    let indexes = createRange(0, shape.particles.length, 1);
    upsetArray(indexes);

    let i = 0;
    while (i < indexes.length) {
        const target = shape.particles[i];
        const particle = particles[indexes[i]];

        if (!particle)
            console.log(particle);

        if (particle.standing) {  // if standing in text, expand it first
            particle.move(new Task({
                x: particle.p.x,
                y: particle.p.y,
                radius: randomRange(this.cfg.particles.size.standing.min,
                    this.cfg.particles.size.standing.max),
                opacity: Math.random(),
                step_ratio: 0.12
            }));
        }

        particle.standing = true;
        particle.move(new Task({
            x: target.x + centerPos.x,
            y: target.y + centerPos.y,
            radius: this.cfg.particles.size.standing.value,
            // radius: randomRange(this.cfg.particles.size.standing.value/2, this.cfg.particles.size.standing.value),
            opacity: 1,
            step_ratio: 0.12
        }));
        ++i;
    }

    while (i < particles.length) {  // extra particles
        const particle = particles[i];
        if (particle.standing) {    // if the particle is standing, expand first, then break
            particle.move(new Task({
                x: particle.p.x,
                y: particle.p.y,
                radius: randomRange(this.cfg.particles.size.standing.min,
                    this.cfg.particles.size.standing.max),
                opacity: Math.random(),
                step_ratio: 0.12
            }));
            particle.move(new Task({
                x: Math.random() * area.w,
                y: Math.random() * area.h,
                radius: particle.init_radius,
                opacity: particle.init_opacity * Math.random(),
                step_ratio: 0.03
            }));
            particle.standing = false;
        }
        ++i;
    }

};

ShapeShiftAnim.prototype._drawImage = function (img, canvas, area) {

    canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
    canvas.ctx.drawImage(img, 0, 0, area.w, area.h);

};

ShapeShiftAnim.prototype._drawText = function (txt, canvas, area) {

    const ctx = canvas.ctx;
    const font = this.cfg.shape_shift.font;
    ctx.font = getFontStyle(font.size, font.family);

    // TODO: retina adjust
    const adjustFontSize = Math.min(font.size,
        (area.w / ctx.measureText(txt).width) * 0.8 * font.size,
        (area.h / font.size) * (isNumber(txt) ? 0.45 : 0.45) * font.size,
    );

    ctx.fillStyle = 'red';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.font = getFontStyle(adjustFontSize, font.family);
    ctx.clearRect(0, 0, area.w, area.h);
    ctx.fillText(txt, area.w/2, area.h/2);

    // debug for draw text
    // this.ctx.canvas.ctx.drawImage(canvas.el, 0, 0);

};

ShapeShiftAnim.prototype.createShape = function (obj) {

    const canvas = this.ctx.tmp_canvas.canvas;
    if (obj instanceof Image) {
        const size = Math.min(canvas.w, canvas.h) * 0.6;
        this._drawImage(obj, canvas, {
            w: size, h: size
        });
    } else {
        this._drawText(obj, canvas, {
            w: canvas.w, h: canvas.h
        });
    }

    return canvasToShape(canvas, this.ctx.tmp_canvas.gap);

};


/* ------- particlesJS functions - particles ---------- */

ShapeShiftAnim.prototype.densityAutoParticles = function () {

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

ShapeShiftAnim.prototype.createParticles = function (particles) {

    // particles passed in normally is points which get from the last scene
    // if particles is less than this.cfg.particles.number.value, we need
    // push the ext part into arr
    this.pushParticles(this.cfg.particles.number.value, particles);

    const meteors = this.ctx.particles.meteors;
    const meteorCfg = this.cfg.meteors;
    for (let i = 0; i < meteorCfg.number.value; ++i) {
        meteors.push(
            new Meteor(meteorCfg.color, meteorCfg.opacity, null, meteorCfg, this.ctx)
        );
    }
};

ShapeShiftAnim.prototype.pushParticles = function (n, particles) {

    particles = particles || [];

    let i = 0;
    for (; i < particles.length; ++i) {
        const param = randomParticleParam(this.cfg.particles, this.ctx, particles[i]);
        this.ctx.particles.array.push(
            new Particle(param, this.ctx)
        );
    }

    for (; i < n; ++i) {
        const param = randomParticleParam(this.cfg.particles, this.ctx);
        this.ctx.particles.array.push(
            new Particle(param, this.ctx)
        );
    }

};

ShapeShiftAnim.prototype.clearParticles = function() {
    this.ctx.particles.array = [];
};


function Task(param) {
    this.x = param.x;
    this.y = param.y;
    this.opacity = param.opacity;
    this.radius = param.radius;
    this.step_ratio = param.step_ratio ? param.step_ratio : 1 / 15;
    this.step = param.step ? param.step : 60;
}


function randomParticleParam (cfg, ctx, p) {
    let radius, vs;
    let opacity, vo;
    let vb;

    // radius
    radius = (cfg.size.random ? Math.random() : 1) * cfg.size.value;
    if (cfg.size.anim.enable) {
        vs = cfg.size.anim.speed / 100;
        if (!cfg.size.anim.sync) {
            vs *= Math.random();
        }
    }

    // opacity
    opacity = (cfg.opacity.random ? Math.random() : 1) * cfg.opacity.value;
    if (cfg.opacity.anim.enable) {
        vo = cfg.opacity.anim.speed /  100;
        if (!cfg.opacity.anim.sync) {
            vo *= Math.random();
        }
    }

    // velocity
    switch (cfg.move.direction) {
        case 'top':     vb = { x: 0, y: -1 }; break;
        case 'right':   vb = { x: 1, y: 0 }; break;
        case 'bottom':  vb = { x: 0, y: 1 }; break;
        case 'left':    vb = { x: -1, y: 0 }; break;
        default:        vb = { x: 0, y: 0 }; break;
    }

    if (cfg.move.straight) {
        if (cfg.move.random) {
            vb.x *= Math.random();
            vb.y *= Math.random();
        }
    } else {
        vb.x += Math.random() - 0.5;
        vb.y += Math.random() - 0.5;
    }

    return {
        point: p ? p : new Point({
            x: randomFloat(ctx.canvas.w),
            y: randomFloat(ctx.canvas.h),
            vx: vb.x * cfg.move.speed,
            vy: vb.y * cfg.move.speed,
            color: toRgb(cfg.color),
            opacity: opacity,
            radius: radius,
        }),
        anim: {
            opacity: {
                enable: cfg.opacity.anim.enable,
                min: cfg.opacity.anim.opacity_min,
                max: opacity,
                v: vo
            },
            radius: {
                enable: cfg.size.anim.enable,
                // min: cfg.size.anim.size_min,
                // max: radius,
                min: radius,
                max: randomRange(radius, cfg.size.value),
                v: vs
            },
            move: {
                enable: cfg.move.enable,
                out_mode: cfg.move.out_mode
            }
        },
        interactivity: {
            events: cfg.interactivity.events,
            modes: cfg.interactivity.modes,
            mouse: ctx.interactivity.mouse
        }
    };
}
