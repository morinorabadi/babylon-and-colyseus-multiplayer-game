import { Vector3, CreateBox, TransformNode } from "@babylonjs/core";

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
  constructor(name: string, startPos: Vector3) {
    super(name, startPos);
  }
}

export class RemotePlayer extends BasePlayer {
  constructor(name: string, startPos: Vector3) {
    super(name, startPos);
  }
}
