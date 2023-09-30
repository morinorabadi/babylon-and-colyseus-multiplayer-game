import {
  Vector3,
  CreateBox,
  TransformNode,
  KeyboardInfo,
} from "@babylonjs/core";
import { Game } from "./Game";

class BasePlayer {
  node: TransformNode;

  constructor(name: string, startPos: Vector3) {
    this.node = new TransformNode(name);
    this.node.position.copyFrom(startPos);

    const mesh = CreateBox("player");
    mesh.parent = this.node;
  }
}

export class Player extends BasePlayer {
  private readonly inputs = {
    forward: false,
    backward: false,
    rightward: false,
    leftward: false,
  };
  private readonly speedVec = Vector3.Zero();
  constructor(name: string, startPos: Vector3) {
    super(name, startPos);
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
  }
}

export class RemotePlayer extends BasePlayer {
  constructor(name: string, startPos: Vector3) {
    super(name, startPos);
  }
}
