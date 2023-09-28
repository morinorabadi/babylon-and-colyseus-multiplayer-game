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
import { Client, Room } from "colyseus.js";
import { GameState } from "../../server/src/rooms/schema/GameState";

class Game {
  engine!: Engine;
  scene!: Scene;
  player!: Player;

  constructor() {
    this.engine = new Engine(
      document.querySelector("#game") as HTMLCanvasElement
    );
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
  async init(startPos: Vector3) {
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

    this.player = new Player("player", startPos);

    new HemisphericLight("light", new Vector3(0.2, 1, 0), this.scene);

    await this.scene.whenReadyAsync();
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
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

class Network {
  client: Client;
  room!: Room<GameState>;
  game = new Game();
  constructor() {
    this.client = new Client("ws://localhost:3004");
    this.join();
  }

  async join() {
    this.room = await this.client.joinOrCreate("game");
    this.room.onMessage("load", async ({ x, y }: { x: number; y: number }) => {
      await this.game.init(new Vector3(x, 0, y));
      this.room.send("load-over");
    });
    this.room.onMessage("start", async () => {
      this.game.start();
    });
    this.room.onStateChange(this.onStateChange.bind(this));
  }

  onStateChange(state: GameState) {
    state.players.forEach((player, id) => {
      console.log(id);
      if (id === this.room.sessionId) {
        console.log("self");
        return;
      }
      console.log(player);
    });
  }
}
new Network();
