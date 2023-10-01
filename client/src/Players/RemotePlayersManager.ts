import BasePlayer, { IPlayer } from "./BasePlayer";

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

export class RemotePlayersManager {}
