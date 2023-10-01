import {
  Vector3,
  CreateBox,
  TransformNode,
  Mesh,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

export interface IPlayer {
  name: string;
  startPos: Vector3;
  color: string;
}

export default class BasePlayer {
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
