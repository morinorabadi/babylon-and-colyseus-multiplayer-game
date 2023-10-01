import {
  Engine,
  Scene,
  CreateGround,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import { Player } from "./Players/Player";

export class Game {
  private static instance: Game;
  engine!: Engine;
  scene!: Scene;
  player!: Player;

  private constructor() {
    Game.instance = this;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Game();
    }
    return this.instance;
  }

  async init() {
    this.engine = new Engine(
      document.querySelector("#game") as HTMLCanvasElement
    );
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
    this.engine.displayLoadingUI();

    this.scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      0,
      0.8,
      20,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl();

    const ground = CreateGround("ground", { width: 40, height: 40 });
    ground.position.y = -0.5;
    const mat = new StandardMaterial("mat");
    mat.diffuseColor = new Color3(0.6, 0.5, 0.5);
    ground.material = mat;

    new HemisphericLight("light", new Vector3(0.2, 1, 0), this.scene);

    await this.scene.whenReadyAsync();
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    this.engine.hideLoadingUI();
  }
}
