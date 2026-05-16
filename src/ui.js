import { Container, Text } from "pixi.js";
import { CONFIG } from "./config.js";

export class UI {
    constructor(stage, bestScore = 0) {
        // Счёт
        this.scoreText = new Text({
            text: "Score: 0",
            style: CONFIG.styles.score,
        });
        this.scoreText.x = 20;
        this.scoreText.y = 20;

        // Рекорд (под счётом)
        this.bestText = new Text({
            text: "",
            style: {
                ...CONFIG.styles.score,
                fontSize: 18,
                fill: "#ffaa00",
            },
        });
        this.bestText.x = 20;
        this.bestText.y = 48;
        if (bestScore > 0) {
            this.bestText.text = "Best: "+bestScore;
        }

        // Контейнер проигрыша
        this.gameOverContainer = new Container();
        this.gameOverText = new Text({
            text: "",
            style: CONFIG.styles.gameOver,
        });
        this.gameOverText.anchor.set(0.5);
        this.recordText = new Text({
            text: "",
            style: CONFIG.styles.record,
        });
        this.recordText.anchor.set(0.5);
        this.recordText.y = 50; // под основным сообщением
        this.gameOverContainer.addChild(this.gameOverText, this.recordText);

        // контейнер начать с объяснением куда нажимать
        this.startPromptText = new Text({
            text: "Click / tap to start\nor press any key",
            style: CONFIG.styles.startPrompt,
        });
        this.startPromptText.anchor.set(0.5);
        const w = stage.parent?.screen?.width || 800;
        const h = stage.parent?.screen?.height || 600;
        this.startPromptText.x = w / 2;
        this.startPromptText.y = h / 2;

        // Оно добавляет всё на сцену
        stage.addChild(this.scoreText, this.bestText, this.gameOverContainer, this.startPromptText);
        this.gameOverContainer.visible = false;
    }

    updateScore(score) {
        this.scoreText.text = "Score: "+score;
    }

    updateBest(bestScore) {
        if (bestScore > 0) {
            this.bestText.text = "Best: " +bestScore ;
        } else {
            this.bestText.text = "";
        }
    }

    showGameOver(score, record) {
        this.gameOverText.text = "Game Over\nYour score: " +score;
        this.recordText.text = record > 0 ? "Best: " + record : "";
        this.gameOverContainer.visible = true;
        this.scoreText.visible = false;
        this.bestText.visible = false;
    }

    hideGameOver() {
        this.gameOverContainer.visible = false;
        this.scoreText.visible = true;
        this.bestText.visible = true;
    }

    showStartPrompt(visible) {
        this.startPromptText.visible = visible;
    }

    resize(w, h) {
        this.gameOverContainer.x = w / 2;
        this.gameOverContainer.y = h / 2;
        this.startPromptText.x = w / 2;
        this.startPromptText.y = h / 2;
    }
}