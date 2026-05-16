import { Graphics } from "pixi.js";
import { CONFIG } from "./config.js";

export class Ship {
    constructor() {
        this.graphics = new Graphics();
        this.radius = CONFIG.ship.radius;
        this.redraw();
        this.graphics.pivot.set(0, 0);
    }

    redraw() {
        const g = this.graphics;
        g.clear();
        g.poly(CONFIG.ship.vertices);
        g.fill({ color: CONFIG.ship.color });
        g.circle(0, CONFIG.ship.coreOffsetY, CONFIG.ship.coreRadius);
        g.fill({ color: CONFIG.ship.coreColor });
    }
}