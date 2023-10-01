import { Client, Room } from "colyseus.js";
import {
  GameState,
  PlayerState,
} from "../../../server/src/rooms/schema/GameState";
import { Game } from "../Game";
import { Vector3 } from "@babylonjs/core";
import Player from "../Players/Player";
import { LatencyCalculator } from "./LatencyCalculator";
import { RemotePlayer } from "../Players/RemotePlayersManager";
import { Clock } from "../utils/Clock";

export default class Network {
  private static instance: Network;
  client: Client;
  room!: Room<GameState>;
  remotePlayers: Map<string, RemotePlayer> = new Map();
  latency!: number;
  latencyCalculator!: LatencyCalculator;
  clock!: Clock;
  private constructor() {
    this.client = new Client("ws://localhost:3004");
    Network.instance = this;
    this.join();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Network();
    }
    return this.instance;
  }

  async join() {
    this.room = await this.client.joinOrCreate("game");

    this.latencyCalculator = new LatencyCalculator();
    // todo do some thing for after latency

    this.room.onMessage("start", async (data) => {
      console.log("start");

      const beforeLatency = Clock.now();
      this.latency = await this.latencyCalculator.calculate();
      const latencyTimeTaken = Clock.now() - beforeLatency;

      console.log(latencyTimeTaken, this.latency, data.now);
      this.clock = new Clock(data.now + latencyTimeTaken + this.latency / 2);

      this.room.state.players.onAdd(this.onAddPlayer.bind(this));
      this.room.state.players.onRemove(this.onRemovePlayer.bind(this));
    });
  }

  /**
   * player-join
   */
  onAddPlayer(playerData: PlayerState, id: string) {
    if (id === this.room.sessionId) {
      // self
      const player = Player.getInstance();
      player.init({
        startPos: new Vector3(playerData.x, 0, playerData.z),
        color: playerData.color,
      });
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
  }

  /**
   * player-left
   */
  onRemovePlayer(_playerData: PlayerState, id: string) {
    if (id === this.room.sessionId) return;
    const remotePlayer = this.remotePlayers.get(id)!;
    remotePlayer.dispose();
    this.remotePlayers.delete(id);
  }

  sendNewPos(x: number, z: number) {
    this.room.send("update-pos", {
      x,
      z,
      t: this.clock.getElapsedTime(),
    });
  }
}
