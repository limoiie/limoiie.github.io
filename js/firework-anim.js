function FireworkAnim (fw_ctx, params) {

    this.cfg = {
        particles: {
            number: {
                value: 15,
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
        }
    };

    this.ctx = {
        particles: {
            fires: []
        }
    };

    fw_ctx && Object.deepExtend(this.ctx, fw_ctx);
    params && Object.deepExtend(this.cfg, params);

}

FireworkAnim.prototype.retinaInit = function () {

    this.cfg.particles.size.value *= this.ctx.canvas.px_ratio;

};

FireworkAnim.prototype.init = function (particles) {

    this.densityAutoParticles();
    this.createParticles(particles);

};

FireworkAnim.prototype.resize = function () {
    
};

FireworkAnim.prototype.refresh = function () {
    
};

FireworkAnim.prototype.onhover = function () {
    
};

FireworkAnim.prototype.onclick = function () {



};

FireworkAnim.prototype.doAction = function () {

    this.pushParticles(2);
    return true;

};

FireworkAnim.prototype.extractParticles = function () {

    return [];

};

FireworkAnim.prototype.drawFrame = function () {

    const canvas = this.ctx.canvas;
    const ctx = canvas.ctx;

    const tmp = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.w, canvas.h);
    ctx.globalCompositeOperation = 'lighter';

    const fires = this.ctx.particles.fires;
    for (let i = 0; i < fires.length; ++i)
        fires[i].update(fires, i);

    this.ctx.particles.fires.forEach(p=>p.draw());

};

// Firework life op

FireworkAnim.prototype.densityAutoParticles = function () {

    if (this.cfg.particles.number.density.enable) {
        let number = this.cfg.particles.number;
        let canvas = this.ctx.canvas;
        let area = canvas.el.width * canvas.el.height / 1000;

        if (this.ctx.retina) {
            area /= canvas.px_ratio * 2;
        }

        number.value = area * number.value / number.density.value_area;
    }

};

FireworkAnim.prototype.createParticles = function (particles) {

    // this.pushParticles(this.cfg.particles.number.value, particles);

};

FireworkAnim.prototype.pushParticles = function (n, particles) {

    for (let i = 0; i < n; ++i) {
        const param = randomFireworkParam(this.cfg, this.ctx);
        this.ctx.particles.fires.push(
            new FirePt(param, this.ctx)
        );
    }

};

function randomFireworkParam (cfg, ctx) {

    const canvas = ctx.canvas;

    return {
        p: new Point({
            x: canvas.w / 2,
            y: canvas.h,
            radius: randomRange(1, 3),
            color: toRgb(cfg.particles.color),
            opacity: randomRange(0.5, 0.7)
        }),
        tx: randomRange(0, canvas.w),
        ty: randomRange(0, canvas.h / 2),
        boom_count: 150,
        boom_colors: cfg.particles.color,
        speed: 2,
    };

}
