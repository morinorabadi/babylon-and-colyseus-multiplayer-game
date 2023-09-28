import {
  Engine,
  Scene,
  CreateGround,
  ArcRotateCamera,
  Vector3,
  CreateBox,
  HemisphericLight,
  StandardMaterial,
  Color3,
  TransformNode,
} from "@babylonjs/core";

class Game {
  player: Player;
  constructor(startPos: Vector3) {
    const engine = new Engine(
      document.querySelector("#game") as HTMLCanvasElement
    );
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      0,
      0.8,
      20,
      Vector3.Zero(),
      scene
    );
    camera.attachControl();

    const ground = CreateGround("ground", { width: 40, height: 40 });
    ground.position.y = -0.5;
    const mat = new StandardMaterial("mat");
    mat.diffuseColor = new Color3(0.6, 0.5, 0.5);
    ground.material = mat;

    this.player = new Player("player", startPos);

    new HemisphericLight("light", new Vector3(0.2, 1, 0), scene);

    window.addEventListener("resize", () => {
      engine.resize();
    });

    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}

class Player {
  node: TransformNode;

  constructor(name: string, startPos: Vector3) {
    this.node = new TransformNode(name);
    this.node.position.copyFrom(startPos);

    const mesh = CreateBox("player");
    mesh.parent = this.node;
  }
}

const game = new Game(new Vector3(1, 0, 1));
