function FrameworkJS (canvas_el) {
    this.ctx = {
        canvas: {
            el: canvas_el,
            w: canvas_el.offsetWidth,
            h: canvas_el.offsetHeight,
            retina_detect: false,
            ctx: undefined,
            px_ratio: undefined,
        },
        move: {
            enable: true
        },
        click: {
            enable: true
        },
        auto_play: {
            enable: false
        },
        interactivity: {
            el: undefined,
            events: {
                resize: true
            },
            mouse: {
                x: undefined,
                y: undefined,
                click_x: undefined,
                click_y: undefined,
                click_time: undefined,
                status: undefined
            }
        },
        _anim_ind: -1,
        _anim_arr: [],
        _tmp: {
            retina: undefined,
            clicked: undefined,
            drawLoopAnimFrame: undefined
        },
        tmp_canvas: {
            canvas: {
                el: document.createElement('canvas'),
                ctx: undefined,
                w: undefined,
                h: undefined
            },
            gap: 13
        }
    };

    this.stopped = true;
    this.stopping = false;

    this.last_auto = {};
    this.auto_playing = false;

    this.machine = [
        1900,
        1900, 1900, 1900, 1900, 1900,
        3500, 2000, 2000, 2000, 2000,
        2000, 2000, 2000, 2000, 3800,
        3800, 3800, 3800, 3800, 3800,
        3800, 4000, 3900, 3900, 3900,
        3900, 3900, 3900, 3900, 3900,
        3900, 3900, 3900, 19000
    ];
    this.frame_cnt = 0;
    this.exit_callback = undefined;

    this.setEventsListeners();
    this.init();
    this.drawLoop();

}

FrameworkJS.prototype.retinaInit = function () {

    let ctx = this.ctx;

    if (ctx.retina_detect && window.devicePixelRatio > 1) {
        ctx.canvas.px_ratio = window.devicePixelRatio;
        ctx._tmp.retina = true;
    } else {
        ctx.canvas.px_ratio = 1;
        ctx._tmp.retina = false;
    }

    ctx.canvas.w = ctx.canvas.el.offsetWidth * ctx.canvas.px_ratio;
    ctx.canvas.h = ctx.canvas.el.offsetHeight * ctx.canvas.px_ratio;

    ctx.tmp_canvas.gap = Math.floor(ctx.tmp_canvas.gap * ctx.canvas.px_ratio);

    let gap = ctx.tmp_canvas.gap;
    ctx.tmp_canvas.canvas.el.width = ctx.tmp_canvas.canvas.w = Math.floor(ctx.canvas.w / gap) * gap;
    ctx.tmp_canvas.canvas.el.height = ctx.tmp_canvas.canvas.h = Math.floor(ctx.canvas.h / gap) * gap;

    if (ctx._anim_ind >= 0 && ctx._anim_ind < ctx._anim_arr.length)
        ctx._anim_arr[ctx._anim_ind].retinaInit();

};


/* --------- FrameworkJS function - canvas ------------ */

FrameworkJS.prototype.canvasInit = function () {
    this.ctx.canvas.ctx = this.ctx.canvas.el.getContext('2d');

    this.ctx.tmp_canvas.canvas.ctx = this.ctx.tmp_canvas.canvas.el.getContext('2d');
    this.ctx.tmp_canvas.canvas.ctx.fillStyle = 'red';
    this.ctx.tmp_canvas.canvas.ctx.textBaseline = 'middle';
    this.ctx.tmp_canvas.canvas.ctx.textAlign = 'center';
};

FrameworkJS.prototype.canvasPaint = function () {
    this.ctx.canvas.ctx.fillRect(0, 0, this.ctx.canvas.w, this.ctx.canvas.h);
};

FrameworkJS.prototype.canvasClear = function () {
    this.ctx.canvas.ctx.clearRect(0, 0, this.ctx.canvas.w, this.ctx.canvas.h);
};

FrameworkJS.prototype.canvasSize = function () {

    let ctx = this.ctx;

    ctx.canvas.el.width = ctx.canvas.w;
    ctx.canvas.el.height = ctx.canvas.h;

    if (ctx && ctx.interactivity.events.resize) {
        window.addEventListener('resize', function () {

            ctx.canvas.w = ctx.canvas.el.offsetWidth;
            ctx.canvas.h = ctx.canvas.el.offsetHeight;

            if (ctx._tmp.retina) {
                ctx.canvas.w *= ctx.canvas.px_ratio;
                ctx.canvas.h *= ctx.canvas.px_ratio;
            }

            ctx.canvas.el.width = ctx.canvas.w;
            ctx.canvas.el.height = ctx.canvas.h;

            let gap = ctx.tmp_canvas.gap;
            ctx.tmp_canvas.canvas.el.width = ctx.tmp_canvas.canvas.w = Math.floor(ctx.canvas.w / gap) * gap;
            ctx.tmp_canvas.canvas.el.height = ctx.tmp_canvas.canvas.h = Math.floor(ctx.canvas.h / gap) * gap;

            if (ctx._anim_ind >= 0 && ctx._anim_ind < ctx._anim_arr.length)
                ctx._anim_arr[ctx._anim_ind].resize();

        });
    }

};


/* --------- FrameworkJS function - vendors ----------- */

FrameworkJS.prototype.setEventsListeners = function () {

    /**
     * listening to the mouse events and update the params
     */

    const interactivity = this.ctx.interactivity;
    interactivity.el = this.ctx.canvas.el;

    // set on_mousemove callback
    interactivity.el.addEventListener('mousemove', e => {

        interactivity.mouse.x = e.offsetX || e.clientX;
        interactivity.mouse.y = e.offsetY || e.clientY;

        if (this.ctx._tmp.retina) {
            interactivity.mouse.x *= this.ctx.canvas.px_ratio;
            interactivity.mouse.y *= this.ctx.canvas.px_ratio;
        }

        interactivity.mouse.status = 'mousemove';

    });

    // set on_mouseleave callback
    interactivity.el.addEventListener('mouseleave', () => {

        interactivity.mouse.x = null;
        interactivity.mouse.y = null;

        interactivity.mouse.status = 'mouseleave';

    });

    //set on_click callback
    interactivity.el.addEventListener('click', () => {

        const mouse = interactivity.mouse;

        mouse.click_x = mouse.x;
        mouse.click_y = mouse.y;
        mouse.click_time = new Date().getTime();

        this.ctx._tmp.clicked = true;

        if (!this.auto_playing) {
            this.doAction();
        }

        if (this.ctx.click.enable) {
            if (this.ctx._anim_ind >= 0 && this.ctx._anim_ind < this.ctx._anim_arr.length)
                this.ctx._anim_arr[this.ctx._anim_ind].onclick();
        }

    });

};

FrameworkJS.prototype.init = function () {

    this.retinaInit();
    this.canvasInit();
    this.canvasSize();
    this.canvasPaint();

};

FrameworkJS.prototype.refresh = function () {

    this.stop();

    const ctx = this.ctx;
    if (this.ctx._anim_ind >= 0 && this.ctx._anim_ind < this.ctx._anim_arr.length)
        ctx._anim_arr[ctx._anim_ind].refresh();

    this.start();

};

FrameworkJS.prototype.drawLoop = function () {

    const ctx = this.ctx;

    if (this.ctx._anim_ind >= 0 && this.ctx._anim_ind < this.ctx._anim_arr.length)
        ctx._anim_arr[ctx._anim_ind].drawFrame();

    ctx._tmp.drawLoopAnimFrame = requestAnimationFrame(this.drawLoop.bind(this));

};

FrameworkJS.prototype.autoPlay = function (callback) {

    this.auto_playing = true;
    this.stopped = false;

    const curr_auto = { cont: true };
    this.last_auto = curr_auto;

    this.exit_callback = callback;
    this.frame_cnt = 0;

    const autoMachine = ()=>{
        if (curr_auto.cont) {
            this.doAction();
            if (this.frame_cnt <= this.machine.length) {
                const time = this.machine[this.frame_cnt-1];
                setTimeout(autoMachine, time);
            }
        }
        // else if (this.machine.length === 0) {
            // callback();
        // }
    };

    autoMachine();

};

FrameworkJS.prototype.start = function (callback) {

    this.frame_cnt = 0;
    this.exit_callback = callback;

    this.auto_playing = false;
    this.stopped = false;

    this.doAction();

};

FrameworkJS.prototype.stop = function (stopped_callback) {

    const callback = ()=>{
        this.last_auto.cont = false;
        this.auto_playing = false;
        this.stopping = false;
        this.stopped = true;
        this.ctx._anim_ind = -1;

        stopped_callback && stopped_callback();
    };

    if (this.ctx._anim_ind >= 0 && this.ctx._anim_ind < this.ctx._anim_arr.length) {
        this.stopping = true;
        this.ctx._anim_arr[this.ctx._anim_ind].stop(callback);
    } else {
        callback();
    }

};


/* --------- FrameworkJS function - anim ops ---------- */

FrameworkJS.prototype.addAnim = function (anim) {

    this.ctx._anim_arr.push(anim);

};

FrameworkJS.prototype.doAction = function () {

    if (this.stopped || this.stopping) return;
    if (this.frame_cnt >= this.machine.length) {
        this.exit_callback && this.exit_callback();
        return;
    }

    ++this.frame_cnt;

    const ctx = this.ctx;
    const arr = ctx._anim_arr;
    if (ctx._anim_ind < arr.length) {
        const curr = this.ctx._anim_ind;
        const currAnim = curr < 0 ? null : arr[curr];
        const isLastAction = this.frame_cnt === this.machine.length;
        if (!currAnim || !currAnim.doAction(isLastAction)) {
            this.transitionAnim(currAnim, curr+1);
        }
    }

};

FrameworkJS.prototype.transitionAnim = function (currAnim, next) {

    let particles = [];
    if (currAnim) {
        particles = currAnim.extractParticles();
        currAnim.quickStop();
    }

    if (next < this.ctx._anim_arr.length) {
        this.ctx._anim_arr[next].init(particles);
    } else {
        // TODO: all anim is done
    }

    this.ctx._anim_ind = next;

};