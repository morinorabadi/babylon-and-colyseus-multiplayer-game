import { Client, Room } from "colyseus.js";
import { GameState } from "../../server/src/rooms/schema/GameState";
import { Game } from "./Game";
import { Vector3 } from "@babylonjs/core";
import { RemotePlayer } from "./Player";

export class Network {
  private static instance: Network;
  client: Client;
  room!: Room<GameState>;
  remotePlayers: Map<string, RemotePlayer> = new Map();

  private constructor() {
    this.client = new Client("ws://localhost:3004");
    this.join();
    Network.instance = this;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Network();
    }
    return this.instance;
  }

  async join() {
    this.room = await this.client.joinOrCreate("game");

    this.room.onMessage("load", async () => {
      this.room.send("load-over", { color: Game.getInstance().player.color });
    });

    /**
     * start
     */
    this.room.onMessage("start", async (startPos) => {
      Game.getInstance().start(new Vector3(startPos.x, 0, startPos.z));
    });

    this.room.state.listen("isGameStarted", (isGameStarted) => {});

    /**
     * player-join
     */
    this.room.state.players.onAdd((player, id) => {
      if (id === this.room.sessionId) return;
      const remotePlayer = new RemotePlayer({
        name: id,
        startPos: new Vector3(player.x, 0, player.z),
        color: player.color,
      });
      this.remotePlayers.set(id, remotePlayer);
      player.onChange(() => {
        remotePlayer.updatePos(player.x, player.z);
      });
    });

    /**
     * player-left
     */
    this.room.state.players.onRemove((player, id) => {
      if (id === this.room.sessionId) return;
      const remotePlayer = this.remotePlayers.get(id)!;
      remotePlayer.dispose();
      this.remotePlayers.delete(id);
    });
  }

  sendNewPos(x: number, z: number) {
    this.room.send("update-pos", {
      x,
      z,
    });
  }
}
