import { Application, Assets } from "pixi.js";
import { CONFIG } from "./config.js";
import { Game } from "./game.js";
import { createStarfield } from "./starfield.js";

async function init() {
  const app = new Application();
  await app.init({ background: CONFIG.background, resizeTo: window });
  document.body.appendChild(app.canvas);
  const starTexture = await Assets.load("https://pixijs.com/assets/star.png");
  createStarfield(app, starTexture);

  new Game(app);
}

init().catch(console.error);