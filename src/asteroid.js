import { Graphics } from "pixi.js";
import { CONFIG } from "./config.js";

export class Asteroid {
    constructor(speedMultiplier = 1) {
        this.graphics = new Graphics();
        const cfg = CONFIG.asteroid;
        const radius = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);
        const segments = cfg.segmentsMin + Math.floor(Math.random() * (cfg.segmentsMax - cfg.segmentsMin));
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius * (0.8 + Math.random() * 0.4);
            points.push(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        const g = this.graphics;
        g.poly(points);
        g.fill({ color: cfg.fill });
        g.stroke({ color: cfg.stroke, width: cfg.strokeWidth });
        g.pivot.set(0, 0);

        this.radius = radius;
        this.rotationSpeed = cfg.rotationSpeedMin + Math.random() * (cfg.rotationSpeedMax - cfg.rotationSpeedMin);
        this.baseSpeedY = cfg.baseSpeedMin + Math.random() * (cfg.baseSpeedMax - cfg.baseSpeedMin);
        this.speedY = this.baseSpeedY * speedMultiplier;
        this.active = true;
    }
}