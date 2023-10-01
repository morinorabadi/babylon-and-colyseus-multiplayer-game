import { Client, Room } from "colyseus.js";
import { GameState } from "../../server/src/rooms/schema/GameState";
import { Game } from "./Game";
import { Vector3 } from "@babylonjs/core";
import { Player, RemotePlayer } from "./Player";

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

    /**
     * start
     */
    // ! fix this
    this.room.state.listen("isGameStarted", (isGameStarted) => {
      if (isGameStarted) Game.getInstance().start();
      else console.log(" do some thin for game over");
    });

    /**
     * player-join
     */
    this.room.state.players.onAdd((playerData, id) => {
      if (id === this.room.sessionId) {
        // self
        const player = Player.getInstance();
        player.init({
          startPos: new Vector3(playerData.x, 0, playerData.z),
          color: playerData.color,
        });
        // ! remove this
        Game.getInstance().start();
      } else {
        // remote
        const player = new RemotePlayer({
          name: id,
          startPos: new Vector3(playerData.x, 0, playerData.z),
          color: playerData.color,
        });
        this.remotePlayers.set(id, player);
        playerData.onChange(() => {
          player.updatePos(playerData.x, playerData.z);
        });
      }
    });

    /**
     * player-left
     */
    this.room.state.players.onRemove((_player, id) => {
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
