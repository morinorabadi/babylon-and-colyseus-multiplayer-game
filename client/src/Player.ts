import {
  Vector3,
  CreateBox,
  TransformNode,
  KeyboardInfo,
  Mesh,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import { Game } from "./Game";
import { Network } from "./NetWork";

interface IPlayer {
  name: string;
  startPos: Vector3;
  color: string;
}

class BasePlayer {
  node: TransformNode;
  mesh: Mesh;
  material: StandardMaterial;
  constructor({ name, startPos, color }: IPlayer) {
    this.node = new TransformNode(name);
    this.node.position.copyFrom(startPos);

    this.material = new StandardMaterial("mat");
    this.material.diffuseColor = Color3.FromHexString(color);

    this.mesh = CreateBox("player");
    this.mesh.parent = this.node;
    this.mesh.material = this.material;
  }
}

export class RemotePlayer extends BasePlayer {
  constructor(data: IPlayer) {
    super(data);
  }

  dispose() {
    this.node.dispose();
  }

  updatePos(x: number, z: number) {
    this.node.position.copyFromFloats(x, 0, z);
  }
}

export class Player extends BasePlayer {
  private static instance: Player;
  private readonly inputs = {
    forward: false,
    backward: false,
    rightward: false,
    leftward: false,
  };
  private readonly speedVec = Vector3.Zero();

  private constructor() {
    super({ color: "#fff", startPos: Vector3.Zero(), name: "player" });
    Player.instance = this;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Player();
    }
    return this.instance;
  }

  init({ startPos, color }: Omit<IPlayer, "name">) {
    this.node.position.copyFrom(startPos);
    this.material.diffuseColor = Color3.FromHexString(color);

    Game.getInstance().scene.onKeyboardObservable.add(
      this.onKeyboardInput.bind(this)
    );
    Game.getInstance().scene.onBeforeRenderObservable.add(
      this.update.bind(this)
    );
  }

  private onKeyboardInput({ event }: KeyboardInfo) {
    const { key, type } = event;

    switch (key) {
      case "w":
      case "W":
        this.inputs.forward = type === "keydown";
        break;
      case "s":
      case "S":
        this.inputs.backward = type === "keydown";
        break;
      case "a":
      case "A":
        this.inputs.leftward = type === "keydown";
        break;
      case "d":
      case "D":
        this.inputs.rightward = type === "keydown";
        break;
    }
  }

  update() {
    if (this.inputs.forward && this.inputs.backward) {
      this.speedVec.x = 0;
    } else if (this.inputs.forward) {
      this.speedVec.x = 1;
    } else if (this.inputs.backward) {
      this.speedVec.x = -1;
    } else {
      this.speedVec.x = 0;
    }

    if (this.inputs.leftward && this.inputs.rightward) {
      this.speedVec.z = 0;
    } else if (this.inputs.leftward) {
      this.speedVec.z = 1;
    } else if (this.inputs.rightward) {
      this.speedVec.z = -1;
    } else {
      this.speedVec.z = 0;
    }

    if (this.speedVec.lengthSquared() > 1) {
      this.speedVec.normalize();
    }

    const delta = Game.getInstance().engine.getDeltaTime() * 0.004;
    this.node.position.addInPlace(
      this.speedVec.multiplyByFloats(delta, 0, delta)
    );

    Network.getInstance().sendNewPos(
      this.node.position.x,
      this.node.position.z
    );
  }
}
