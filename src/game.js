import { Container } from 'pixi.js';
import { CONFIG } from './config.js';
import { Ship } from './ship.js';
import { Asteroid } from './asteroid.js';
import { ParticlePool } from './particlePool.js';
import { UI } from './ui.js';

export class Game {
    constructor(app) {
        this.app = app;
        this.stage = app.stage;

        this.gameContainer = new Container();
        this.stage.addChild(this.gameContainer);

        this.particlePool = new ParticlePool(this.gameContainer);

        this.ship = new Ship();
        this.asteroids = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestDodgeScore') || '0');
        this.gameState = 'start';
        this.difLevel = 0;
        this.currSpawnRate  = CONFIG.difficulty.initialSpawnRate;
        this.speedMultiplier = 1;

        this.ui = new UI(this.stage, this.bestScore);

        this.setupInput();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.gameContainer.addChild(this.ship.graphics);
        this.resetShipPosition();

        this.app.ticker.add((ticker) => this.gameLoop(ticker));
    }

    resetShipPosition() {
        const s = this.app.screen;
        this.ship.graphics.x = s.width / 2;
        this.ship.graphics.y = s.height / 2;
        this.ship.graphics.rotation = 0;
    }

    setupInput() {
        const canvas = this.app.canvas;
        this.keys = {};
        this.pointer = { active: false, x: 0, y: 0 };

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.gameState === 'start') this.startGame();
            if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        canvas.addEventListener('pointerenter', () => {
            this.pointer.active = true;
        });
        canvas.addEventListener('pointerleave', () => {
            this.pointer.active = false;
        });
        canvas.addEventListener('pointerdown', (e) => {
            if (this.gameState === 'start') this.startGame();
            if (this.gameState === 'over') this.restartGame();
            this.updatePointer(e);
        });
        canvas.addEventListener('pointermove', (e) => {
            if (this.gameState === 'playing') this.updatePointer(e);
            this.updatePointer(e);
        });
        canvas.addEventListener('pointerup', () => {});
    }

    updatePointer(e) {
        const rect = this.app.canvas.getBoundingClientRect();
        this.pointer.x = e.clientX - rect.left;
        this.pointer.y = e.clientY - rect.top;
    }

    startGame() {
        if (this.gameState !== 'start') return;
        this.gameState = 'playing';
        this.ui.showStartPrompt(false);
        this.score = 0;
        this.difLevel = 0;
        this.currSpawnRate  = CONFIG.difficulty.initialSpawnRate;
        this.speedMultiplier = 1;
        this.ui.updateScore(0);
        this.clearAsteroids();
        this.particlePool.clear();
        this.resetShipPosition();
    }

    restartGame() {
        this.gameState = 'playing';
        this.ui.hideGameOver();
        this.score = 0;
        this.difLevel = 0;
        this.currSpawnRate  = CONFIG.difficulty.initialSpawnRate;
        this.speedMultiplier = 1;
        this.ui.updateScore(0);
        this.clearAsteroids();
        this.particlePool.clear();
        this.resetShipPosition();
    }

    gameOver() {
        this.gameState = 'over';
        this.spawnExplosion(this.ship.graphics.x, this.ship.graphics.y);
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestDodgeScore', this.bestScore);
            this.ui.updateBest(this.bestScore);
        }
        this.ui.showGameOver(this.score, this.bestScore);
    }

    clearAsteroids() {
        this.asteroids.forEach(a => this.gameContainer.removeChild(a.graphics));
        this.asteroids.length = 0;
    }

    spawnAsteroid() {
        const a = new Asteroid(this.speedMultiplier);
        a.graphics.x = Math.random() * this.app.screen.width;
        a.graphics.y = -a.radius - 10;
        this.gameContainer.addChild(a.graphics);
        this.asteroids.push(a);
    }

    spawnEngineParticles(deltaTime) {
        const cfg = CONFIG.engine;
        const count = Math.floor(1 * deltaTime);
        for (let i = 0; i < count; i++) {
            const p = this.particlePool.get();
            if (!p) continue;
            p.x = this.ship.graphics.x;
            p.y = this.ship.graphics.y + 12;
            p.vx = (Math.random() - 0.5) * cfg.vxRange * 2;
            p.vy = cfg.vyBaseMin + Math.random() * (cfg.vyBaseMax - cfg.vyBaseMin);
            p.radius = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);
            p.life = 1.0;
            p.decay = cfg.decay;
            p.clear();
            p.circle(0, 0, p.radius);
            p.fill({ color: cfg.color, alpha: cfg.alpha });
        }
    }

    spawnExplosion(x, y) {
        const cfg = CONFIG.explosion;
        for (let i = 0; i < cfg.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
            const p = this.particlePool.get();
            if (!p) continue;
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.radius = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);
            p.life = 1.0;
            p.decay = cfg.decay;
            p.clear();
            p.circle(0, 0, p.radius);
            p.fill({ color: cfg.color, alpha: cfg.alpha });
        }
    }

    checkCollision(shipGraphics, asteroid) {
        const dx = shipGraphics.x - asteroid.graphics.x;
        const dy = shipGraphics.y - asteroid.graphics.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this.ship.radius + asteroid.radius);
    }

    updateDifficulty() {
        const level = Math.floor(this.score / CONFIG.scorePerAsteroid);
        if (level > this.difLevel) {
            this.difLevel = level;
            this.currSpawnRate  = Math.min(
                CONFIG.difficulty.initialSpawnRate + level * CONFIG.difficulty.spawnRateIncrease,
                CONFIG.difficulty.maxSpawnRate
            );
            this.speedMultiplier = 1 + Math.min(level * CONFIG.difficulty.speedIncrease, CONFIG.difficulty.maxSpeedBonus);
        }
    }

    gameLoop(ticker) {
        const dt = ticker.deltaTime;
        this.ui.resize(this.app.screen.width, this.app.screen.height);

        if (this.gameState === 'start') {
            this.ui.startPromptText.x = this.app.screen.width / 2;
            this.ui.startPromptText.y = this.app.screen.height / 2;
            return;
        }

        if (this.gameState === 'over') {
            this.particlePool.updateAll(dt);
            return;
        }

        const shipGraphics = this.ship.graphics;
        const screen = this.app.screen;
        let targetX = shipGraphics.x;
        let targetY = shipGraphics.y;

        //Обработка клавы
        const keyboardSpeed = 5;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) targetX -= keyboardSpeed * dt;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) targetX += keyboardSpeed * dt;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) targetY -= keyboardSpeed * dt;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) targetY += keyboardSpeed * dt;

        //Обработка мыши/пальца
        if (this.pointer.active) {
            const dx = this.pointer.x - shipGraphics.x;
            const dy = this.pointer.y - shipGraphics.y;
            targetX += dx * 0.15 * dt;
            targetY += dy * 0.15 * dt;
        }
        const moveAngle = Math.atan2(targetY - shipGraphics.y, targetX - shipGraphics.x);
        if (Math.abs(targetX - shipGraphics.x) > 0.01 || Math.abs(targetY - shipGraphics.y) > 0.01) {
            shipGraphics.rotation = moveAngle + Math.PI / 2;
        }

        shipGraphics.x = Math.max(this.ship.radius, Math.min(screen.width - this.ship.radius, targetX));
        shipGraphics.y = Math.max(this.ship.radius, Math.min(screen.height - this.ship.radius, targetY));
        if (Math.random() < this.currSpawnRate  * dt) {
            this.spawnAsteroid();
        }

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.graphics.y += a.speedY * dt;
            a.graphics.rotation += a.rotationSpeed * dt;

            if (a.graphics.y > screen.height + a.radius) {
                // улетел за экран — очки
                this.score += CONFIG.scorePerAsteroid;
                this.ui.updateScore(this.score);
                this.updateDifficulty();
                this.gameContainer.removeChild(a.graphics);
                this.asteroids.splice(i, 1);
                continue;
            }

            // Проверка столкновения
            if (this.checkCollision(shipGraphics, a)) {
                this.gameOver();
                this.gameContainer.removeChild(a.graphics);
                this.asteroids.splice(i, 1);
            }
        }

        this.spawnEngineParticles(dt);

        this.particlePool.updateAll(dt);
    }

    resize() {
        const w = this.app.screen.width;
        const h = this.app.screen.height;
        if (this.ship && this.ship.graphics) {
            this.ship.graphics.x = Math.min(Math.max(this.ship.graphics.x, this.ship.radius), w - this.ship.radius);
            this.ship.graphics.y = Math.min(Math.max(this.ship.graphics.y, this.ship.radius), h - this.ship.radius);
        }
        this.ui.resize(w, h);
    }
}