import { Graphics } from "pixi.js";

export class ParticlePool {
    constructor(container) {
        this.container = container;
        this.pool = [];
    }

    get() {
        let p = null;
        for (const item of this.pool) {
            if (!item.active) {
                p = item;
                break;
            }
        }
        if (!p) {
            p = new Graphics();
            p.active = false;
            this.pool.push(p);
            this.container.addChild(p);
        }
        p.active = true;
        p.visible = true;
        return p;
    }

    release(p) {
        p.active = false;
        p.visible = false;
    }

    updateAll(deltaTime) {
        for (let i = this.pool.length - 1; i >= 0; i--) {
            const p = this.pool[i];
            if (!p.active) continue;
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.alpha = p.life;
            p.life -= p.decay * deltaTime;
            if (p.life <= 0)
                this.release(p);
        }
    }

    clear() {
        this.pool.forEach(p => this.release(p));
    }
}