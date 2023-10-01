import { Game } from "./Game";
import { Network } from "./NetWork";

async function init() {
  await Game.getInstance().init();
  Network.getInstance();
}
init();
