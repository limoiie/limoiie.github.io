function Point (param) {

    this.x = param.x;
    this.y = param.y;
    this.vx = param.vx;
    this.vy = param.vy;
    this.color = param.color;
    this.radius = param.radius;
    this.opacity = param.opacity;
    this.shape = param.shape ? param.shape : { type: 'circle' };

}

function Particle (param, ctx) {

    this.interactivity = param.interactivity;
    this.canvas = ctx.canvas;

    // basic attr of a particle
    this.p = param.point;

    // config about anim of size, opacity and move
    this.anim = param.anim;

    // on hover bubble
    this.radius_bubble = undefined;
    this.opacity_bubble = undefined;

    this.init_radius = this.p.radius;
    this.init_opacity = this.p.opacity;

    this.is_extinct = false;
    this.extincting = false;
    this.extincting_process = 0;

    // task queue
    this.standing = false;
    this.task = undefined;
    this.task_queue = [];

    this.p.radius = 0;

}

Particle.prototype._stepTowardsTask = function (task, hasAnotherTask) {

    const p = this.p;

    const dp = task.opacity - p.opacity;
    p.opacity += dp * task.step_ratio;
    const ds = task.radius - p.radius;
    p.radius += ds * task.step_ratio;

    const dx = task.x - p.x;
    const dy = task.y - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 1 && dp < 0.1 && ds < 0.5) {
        return true;
    } else {
        p.x += dx * task.step_ratio;
        p.y += dy * task.step_ratio;
    }

    task.step -= 1;
    return hasAnotherTask && task.step <= 0;

};

Particle.prototype.move = function (task) {
    this.task_queue.push(task);
    if (!this.task) this.task = this.task_queue.shift();
};

Particle.prototype.extinct = function () {

    if (this.extincting) return;

    this.extincting = true;
    this.extincting_process = 1;

};

Particle.prototype.update = function () {

    if (this.is_extinct) return;

    const p = this.p;
    const canvas = this.canvas;

    const moveAnim = this.anim.move;
    const radiusAnim = this.anim.radius;
    const opacityAnim = this.anim.opacity;

    const hasAchieve = this.task && this._stepTowardsTask(this.task, this.task_queue.length > 0);
    const isFree = hasAchieve && !this.standing && this.task_queue.length === 0;

    if (!this.task || isFree) {
        // move if enabled
        if (moveAnim.enable) {
            p.x += p.vx;
            p.y += p.vy;
        }

        // change radius if enabled
        if (radiusAnim.enable) {
            p.radius += radiusAnim.v;
            if (p.radius > radiusAnim.max) {
                radiusAnim.v = -Math.abs(radiusAnim.v);
                p.radius += radiusAnim.v;
            } else if (p.radius < radiusAnim.min) {
                radiusAnim.v = Math.abs(radiusAnim.v);
                p.radius += radiusAnim.v;
            }
        }

        // change opacity if enabled
        if (opacityAnim.enable) {
            p.opacity += opacityAnim.v;
            if (p.opacity > opacityAnim.max ||
                p.opacity < opacityAnim.min) {
                p.opacity -= opacityAnim.v;
                opacityAnim.v = -opacityAnim.v;
            }
        }

        // change particle position if it is out of bounds
        const out_horizon = !inRange(p.x, -p.radius, canvas.w + p.radius);
        const out_vertical = !inRange(p.y, -p.radius, canvas.h + p.radius);
        if (out_horizon || out_vertical) {
            this[moveAnim.out_mode](p, out_horizon, out_vertical);
        }
    }

    if (hasAchieve) {
        if (this.standing && this.task_queue.length === 0) {
            p.x += Math.sin(Math.random() * Math.PI);
            p.y += Math.sin(Math.random() * Math.PI);
        } else {
            this.task = this.task_queue.shift();
        }
    }

    this.bubbleParticles();

    if (this.extincting) {
        this.extincting_process *= 0.93;
        this.p.opacity *= this.extincting_process;

        if  (this.extincting_process < 0.05) {
            this.is_extinct = true;
        }
    }

};

Particle.prototype.bubbleParticles = function () {

    const p = this.p;
    const mouse = this.interactivity.mouse;
    const events = this.interactivity.events;
    const modes = this.interactivity.modes;

    if (events.onhover.enable && inArray('bubble', events.onhover.mode)) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const ratio = 1 - dist / modes.bubble.distance;
        const to = modes.bubble.opacity * ratio;
        const tr = modes.bubble.size * ratio;

        if (dist < modes.bubble.distance && !this.standing &&
            this.interactivity.mouse.status !== 'mouseleave') {
            if (!this.opacity_bubble) this.opacity_bubble = p.opacity;
            if (!this.radius_bubble) this.radius_bubble = p.radius;
            this.opacity_bubble += (p.opacity + to - this.opacity_bubble) / 10;
            this.radius_bubble += (p.radius + tr - this.radius_bubble) / 10;
        } else {
            // this.radius_bubble = undefined;
            // this.opacity_bubble = undefined;

            if (this.opacity_bubble) {
                const d = p.opacity - this.opacity_bubble;
                if (Math.abs(d) > 0.1) {
                    this.opacity_bubble += d/10;
                } else {  // if d < 0.1 we think that the p has achieve the target opacity
                    this.opacity_bubble = undefined;
                }
            }

            if (this.radius_bubble) {
                const d = p.radius - this.radius_bubble;
                if (Math.abs(d) > 1) {
                    this.radius_bubble += d/10;
                } else {  // if d < 1 we think that the p has achieve the target radius
                    this.radius_bubble = undefined;
                }
            }

        }
    }

};

Particle.prototype.bounce = function (p, out_horizon, out_vertical) {

    if (out_horizon) {
        p.vx = -p.vx;
    }
    if (out_vertical) {
        p.vy = -p.vy;
    }

};

Particle.prototype.out = function (p, out_horizon, out_vertical) {

    const newPos = {
        left: -p.radius,
        right: this.canvas.w + p.radius,
        top: -p.radius,
        bottom: this.canvas.h + p.radius
    };

    if (out_horizon) {
        p.x = p.x < -p.radius ? newPos.right : newPos.left;
        p.y = randomFloat(this.canvas.h);
    }
    if (out_vertical) {
        p.x = randomFloat(this.canvas.w);
        p.y = p.y < -p.radius ? newPos.bottom : newPos.top;
    }

};

Particle.prototype.draw = function () {

    if (this.is_extinct) return;

    const p = this.p;
    let canvas = this.canvas;
    const radius = this.radius_bubble ? this.radius_bubble : p.radius;
    const opacity = this.opacity_bubble ? this.opacity_bubble : p.opacity;

    // FIXME: can we just set the canvas style only once for performance since all the
    // FIXME: particles have the same color

    // set canvas style
    canvas.ctx.fillStyle = toRgba(p.color, opacity);

    // draw on canvas
    canvas.ctx.beginPath();
    {
        if (this.standing && opacity > 0.75) {
            canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
            // heartFactory.drawHeartQuickly(canvas.ctx, p.x, p.y, radius, p.color, opacity);
        } else {
            switch (p.shape.type) {
                case 'circle':
                    canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
                    break;
                // case 'heart':
                //     drawHeart(canvas.ctx, p.x, p.y, radius);
                //     break;
                default:
                    break;
            }
        }
    }
    canvas.ctx.closePath();
    canvas.ctx.fill();

};


function Meteor (color, opacity, pos, cfg, ctx) {

    this.cfg = cfg;
    this.canvas = ctx.canvas;
    this.interactivity = ctx.interactivity;
    this.color_src = color;

    this.is_extinct = false;
    this.extincting = false;
    this.extincting_process = 0;

    // context
    this.ctx = {
        running: undefined,
    };

    this.init();

}

Meteor.prototype.init = function(pos) {

    const canvas = this.canvas;
    const cfg = this.cfg;

    // color
    this.color = toRgb(this.color_src);

    // radius
    this.radius = (cfg.size.random ? Math.random() : 1) * cfg.size.value;
    if (cfg.size.anim.enable) {
        this.vs = cfg.size.anim.speed / 100;
        if (!cfg.size.anim.sync) {
            this.vs *= Math.random();
        }
    }

    // direction
    this.direction = cfg.move.direction.value / 180 * Math.PI;
    if (cfg.move.direction.random) {
        this.direction = Math.random() * Math.PI * 2;
    }

    this.dx = Math.cos(this.direction);
    this.dy = Math.sin(this.direction);

    // speed
    this.v = cfg.move.speed / 100;

    if (cfg.move.random) {
        const speed = randomRange(cfg.move.min_speed, cfg.move.speed);
        this.vx = this.dx * speed / 100;
        this.vy = this.dy * speed / 100;
    } else {
        this.vx = this.dx * this.v;
        this.vy = this.dy * this.v;
    }

    const poses = [
        { x: 0, y: Math.random() * canvas.h },
        { x: canvas.w, y: Math.random() * canvas.h },
        { y: 0, x: Math.random() * canvas.w },
        { y: canvas.h, x: Math.random() * canvas.w }
    ];

    let tmp_pos = randomPick(poses);
    while (tmp_pos.x === 0 && this.dx < 0 || tmp_pos.x === canvas.w && this.dx > 0 ||
           tmp_pos.y === 0 && this.dy < 0 || tmp_pos.y === canvas.h && this.dy > 0) {
        tmp_pos = randomPick(poses);
    }

    // position
    this.x = pos ? pos.x : tmp_pos.x;
    this.y = pos ? pos.y : tmp_pos.y;

    this.tail_len = cfg.size.init_tail;
    this.ctx.running = true;

};

Meteor.prototype.extinct = function () {

    if (!this.is_extinct) {
        this.extincting = true;
        this.extincting_process = 1;
    }

};

Meteor.prototype.update = function () {

    if (this.is_extinct) return;

    const canvas = this.canvas;
    const move = this.cfg.move;
    const size = this.cfg.size;

    if (move.enable) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 1.02;
        this.vy *= 1.02;
    }

    // update tail len
    const tmp_tail_len = size.max_tail;
    if (tmp_tail_len > this.tail_len)
        this.tail_len += this.v / 12;
    else
        this.tail_len -= this.v / 12;

    // stop if have moved out of the canvas
    if (this.x > canvas.w+tmp_tail_len ||
        this.x+tmp_tail_len < 0 ||
        this.y > canvas.h+tmp_tail_len ||
        this.y+tmp_tail_len < 0) {
        this.ctx.running = false;
    }

    if (!this.ctx.running) {
        if (Math.random() < 0.005) {
            this.init();
        }
    }

    if (this.extincting) {
        this.extincting_process *= 0.92;
        this.opacity = this.extincting_process;
        if (this.extincting_process < 0.05) {
            this.is_extinct = true;
        }
    }

};

Meteor.prototype.draw = function () {

    if (this.extincting) return;

    if (this.ctx.running) {
        const ctx = this.canvas.ctx;
        const cfg = this.cfg;

        const radius = cfg.size.value;
        const opacity = cfg.opacity.value;

        const sx = this.x;
        const sy = this.y;
        const ex = this.x - this.tail_len * this.dx;
        const ey = this.y - this.tail_len * this.dy;

        const rgbaColor = toRgba(this.color, opacity);

        const gradient = ctx.createLinearGradient(sx, sy, ex, ey);
        gradient.addColorStop(0, rgbaColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.lineWidth = radius * 1.4;
        ctx.strokeStyle = gradient;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = rgbaColor;
        ctx.arc(sx, sy, radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

};


function FlashPt (param, ctx) {

    this.interactivity = param.interactivity;
    this.canvas = ctx.canvas;

    // basic attr
    this.p = param.point;
    this.to_p = param.to_point;

    this.impulse_x = param.impulse_x ? param.impulse_x : 0;
    this.impulse_y = param.impulse_y ? param.impulse_y : 0;

    this.to_impulse_x = param.to_impulse_x ? param.to_impulse_x : 0;
    this.to_impulse_y = param.to_impulse_y ? param.to_impulse_y : 0;

    this.angle = param.angle;
    this.degree = 0;
    this.degreeSpeed = 0;

    this.rc_center_x = 0;
    this.rc_center_y = 0;
    this.rc_radius = 0;
    this.rc_dv = 0;
    this.rc_d = 0;

    this.protect_frame = 0;

    this.flight_mode = 0;      // 0 for random, 1 for grab, 2 for selected

    this.is_extinct = false;
    this.extincting = false;
    this.extincting_process = 0;

}

FlashPt.prototype = {
    extinct: function () {
        if (this.is_extinct) return;
        this.extincting = true;
        this.extincting_process = 1;
    },
    update: function () {

        if (this.is_extinct) return;

        // update current point basic attr which will directly influence the draw
        this.impulse_x += (this.to_impulse_x - this.impulse_x) / 30;   // magic number
        this.impulse_y += (this.to_impulse_y - this.impulse_y) / 30;   // magic number

        this.p.x += (this.to_p.x - this.p.x) / 10;                     // magic number
        this.p.y += (this.to_p.y - this.p.y) / 10;                     // magic number
        this.p.radius += (this.to_p.radius - this.p.radius) / 10;      // magic number

        this.p.color.rgb.r += (this.to_p.color.rgb.r - this.p.color.rgb.r) / 10;   // magic number
        this.p.color.rgb.g += (this.to_p.color.rgb.g - this.p.color.rgb.g) / 10;   // magic number
        this.p.color.rgb.b += (this.to_p.color.rgb.b - this.p.color.rgb.b) / 10;   // magic number

        const mx = this.interactivity.mouse.x;
        const my = this.interactivity.mouse.y;
        const dx = mx - this.p.x;
        const dy = my - this.p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // update the degree around the mouse if the free p get caught
        if (this.flight_mode !== -1) {
            if (dist < this.interactivity.grab.distance) {
                if ((this.flight_mode & 1) === 0) {
                    // degree of the target around the mouse
                    this.degree =
                        Math.atan2(this.p.y-my, this.p.x-mx) / Math.PI * 180 + randomRange(-90, 90);
                    this.degreeSpeed = Math.random() + 0.5;  // magic number
                }
                this.flight_mode |= 1;
            } else {
                if (this.flight_mode & 1) {
                    this.flight_mode ^= 1;
                }
            }
        }

        if (this.flight_mode === 0) {
            // update target randomly
            this.to_p.x += this.p.vx;
            this.to_p.y += this.p.vy;

            // update out of the bound,
            if (this.p.x < 0) this.p.x = this.to_p.x = this.canvas.w;
            if (this.p.y < 0) this.p.y = this.to_p.y = this.canvas.h;
            if (this.p.x > this.canvas.w) this.p.x = this.to_p.x = 0;
            if (this.p.y > this.canvas.h) this.p.y = this.to_p.y = 0;
        } else if (this.flight_mode !== -1) {
            if (this.flight_mode & 2) { // recycle mode
                this.to_p.x = this.rc_center_x + this.rc_radius * Math.cos(this.rc_d);
                this.to_p.y = this.rc_center_y + this.rc_radius * Math.sin(this.rc_d);

                this.rc_d += this.rc_dv;
            }

            if (this.flight_mode & 1) { // get caught
                if (this.protect_frame <= 0 && this.interactivity.mouse.status !== 'mouseleave') {
                    const degreeAroundMouse = (this.degree) / 180 * Math.PI;
                    // update target to the point which in the direction of degree around mouse
                    this.to_p.x = mx + Math.cos(degreeAroundMouse) * dist;
                    this.to_p.y = my + Math.sin(degreeAroundMouse) * dist;
                    this.degree += this.degreeSpeed;
                    this.degreeSpeed += 0.01;     // magic number, and we want the point run
                                                  // faster and faster around the mouse
                }
            }
        }

        // update the target
        if (this.flight_mode !== -1) {
            // impulse if not selected, and we want the larger point get much stronger impulse
            this.to_p.x += Math.floor(this.impulse_x * this.p.radius / 30);  // magic number
            this.to_p.y += Math.floor(this.impulse_y * this.p.radius / 30);  // magic number
        }

        // we want but seldom flash point
        if (Math.random() < 0.005) {
            if (this.flight_mode !== -1) {
                this.p.radius = Math.random() * 30;  // magic number
            }
        }

        if (this.protect_frame > 0)
            --this.protect_frame;


        if (this.extincting) {
            this.extincting_process *= 0.92;
            this.p.opacity = this.extincting_process;
            if (this.extincting_process < 0.05) {
                this.is_extinct = true;
            }
        }

    },
    draw: function () {

        if (this.is_extinct) return;

        const ctx = this.canvas.ctx;
        ctx.fillStyle = toRgba(this.p.color, this.p.opacity);
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.p.radius, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
    },

};


function FirePt (param, ctx) {

    this.canvas = ctx.canvas;
    this.p = param.p;

    this.sx = this.p.x;
    this.sy = this.p.y;
    this.tx = param.tx;
    this.ty = param.ty;

    this.is_booming = false;
    this.booms = [];
    this.boom_count = param.boom_count;
    this.boom_colors = param.boom_colors;

    const degree = Math.atan2(this.ty-this.sy, this.tx-this.sx);
    this.p.vx = Math.cos(degree) * param.speed;
    this.p.vy = Math.sin(degree) * param.speed;

    this.acceleration = param.acceleration ? param.acceleration : 1.05;


    this.distanceToTarget = distance(this.sx, this.sy, this.tx , this.ty);
    this.distanceTraveled = 0;

    this.footprint = [];

    let footprintCount = param.footprintCount ? param.footprintCount : 3;
    while (footprintCount--) {
        this.footprint.push({x: this.x, y: this.y});
    }

}

FirePt.prototype.update = function (fires, index) {

    if (this.is_booming) {
        if (this.booms.length) {
            for (let i = this.booms.length-1; i >= 0; --i) {
                if (!this.booms[i].update()) {
                    this.booms.splice(i, 1);
                }
            }
        } else {
            fires.splice(index, 1);
        }
    } else {
        this.footprint.pop();
        this.footprint.unshift({x: this.p.x, y: this.p.y});

        this.p.vx *= this.acceleration;
        this.p.vy *= this.acceleration;

        if (distance(this.sx, this.sy, this.p.x+this.p.vx, this.p.y+this.p.vy) >= this.distanceToTarget) {
            this.is_booming = true;
            this.createBooms();
        } else {
            this.p.x += this.p.vx;
            this.p.y += this.p.vy;
        }
    }

};

FirePt.prototype.draw = function () {

    this.booms.forEach(p=>p.draw());

    if (!this.is_booming) {

        const ctx = this.canvas.ctx;
        const tail = this.footprint[this.footprint.length-1];

        // ctx.lineWidth = this.p.radius;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(this.p.x, this.p.y);
        ctx.strokeStyle = toRgba(this.p.color, this.p.opacity);
        ctx.stroke();

    }

};

FirePt.prototype.createBooms = function () {

    const cnt = randomRange(90, 150);

    for (let i = 0; i < cnt; ++i) {
        const angle = randomRange(0, Math.PI*2);
        const speed = randomRange(1, 10);

        const b = 100;
        const c = this.p.color.rgb;
        const color = {
            rgb: {
                r: randomRange(Math.max(0, c.r-b), Math.min(255, c.r+b)),
                g: randomRange(Math.max(0, c.g-b), Math.min(255, c.g+b)),
                b: randomRange(Math.max(0, c.b-b), Math.min(255, c.b+b))
            }
        };
        const param = {
            p: new Point({
                x: this.p.x,
                y: this.p.y,
                vx: speed * Math.cos(angle),
                vy: speed * Math.sin(angle),
                // color: toRgb(this.boom_colors),
                color: color,
                opacity: 1
            }),
            vo: randomRange(0.015, 0.03),
            gravity: 1
        };
        this.booms.push(
            new BoomPt(param, this.canvas)
        );
    }

};

function BoomPt(param, canvas) {

    this.canvas = canvas;
    this.p = param.p;

    this.footprintCount = param.footprintCount ? param.footprintCount : 5;
    this.footprint = [];
    for (let i = 0; i < this.footprintCount; ++i) {
        this.footprint.push({x: this.p.x, y: this.p.y});
    }

    this.friction = param.friction ? param.friction : 0.95;
    this.gravity = param.gravity ? param.gravity : 1;

    this.vo = param.vo;

}

BoomPt.prototype.update = function () {

    this.footprint.pop();
    this.footprint.unshift({x: this.p.x, y: this.p.y});

    this.p.vx *= this.friction;
    this.p.vy *= this.friction;

    this.p.x += this.p.vx;
    this.p.y += this.p.vy + this.gravity;

    this.p.opacity -= this.vo;

    return this.p.opacity > this.vo; // finish or not?

};

BoomPt.prototype.draw = function () {

    const ctx = this.canvas.ctx;
    const tail = this.footprint[this.footprint.length-1];

    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(this.p.x, this.p.y);
    ctx.strokeStyle = toRgba(this.p.color, this.p.opacity);
    ctx.stroke();

};
