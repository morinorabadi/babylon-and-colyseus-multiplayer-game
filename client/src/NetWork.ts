import { Client, Room } from "colyseus.js";
import { GameState } from "../../server/src/rooms/schema/GameState";
import { Game } from "./Game";
import { Vector3 } from "@babylonjs/core";

export class Network {
  client: Client;
  room!: Room<GameState>;

  constructor() {
    this.client = new Client("ws://localhost:3004");
    this.join();
  }

  async join() {
    this.room = await this.client.joinOrCreate("game");
    this.room.onMessage("load", async ({ x, y }: { x: number; y: number }) => {
      await Game.getInstance().init(new Vector3(x, 0, y));
      this.room.send("load-over");
    });
    this.room.onMessage("start", async () => {
      Game.getInstance().start();
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
