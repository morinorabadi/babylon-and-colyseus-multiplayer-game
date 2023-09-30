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
      const game = Game.getInstance();
      await game.init();
      this.room.send("load-over", { color: game.player.color });
    });

    /**
     * start
     */
    this.room.onMessage("start", async (startPos) => {
      // new players
      this.room.state.players.forEach((player, id) => {
        if (id === this.room.sessionId) return;
        console.log(player.color);

        this.createPlayer(id, player.x, player.z, player.color);
      });

      Game.getInstance().start(new Vector3(startPos.x, 0, startPos.z));
    });

    /**
     * player-join
     */
    this.room.onMessage("player-join", async (data) => {
      if (data.id === this.room.sessionId) return;
      console.log(data);
      this.createPlayer(data.id, data.x, data.z, data.color);
      console.log("player-join");
    });

    /**
     * player-left
     */
    this.room.onMessage("player-left", async (data) => {
      if (data.id === this.room.sessionId) return;
      const player = this.remotePlayers.get(data.id)!;
      player.dispose();
      this.remotePlayers.delete(data.id)!;
      console.log("player-left");
    });

    this.room.onStateChange(this.onStateChange.bind(this));
  }

  onStateChange(state: GameState) {
    state.players.forEach((playerState, id) => {
      if (id === this.room.sessionId) return;
      console.log(id);
      const player = this.remotePlayers.get(id)!;
      player.updatePos(playerState.x, playerState.z);
    });
  }

  createPlayer(id: string, x: number, z: number, color: string) {
    console.log(x, z);

    this.remotePlayers.set(
      id,
      new RemotePlayer({
        name: id,
        startPos: new Vector3(x, 0, z),
        color,
      })
    );
  }

  sendNewPos(x: number, z: number) {
    this.room.send("update-pos", {
      x,
      z,
    });
  }
}
