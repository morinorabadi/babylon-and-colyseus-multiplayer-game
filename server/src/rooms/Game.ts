import { Room, Client } from "colyseus";
import { GameState, PlayerState } from "./schema/GameState";

export class Game extends Room<GameState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new GameState());
    this.onMessage("update-pos", this.onUpdatePos.bind(this));
  }

  onJoin(client: Client) {
    const data = {
      x: Math.round(Math.random() * 10 - 5),
      z: Math.round(Math.random() * 10 - 5),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };
    const player = new PlayerState(data);
    this.state.players.set(client.sessionId, player);
    console.log(client.sessionId, "join!");
  }

  onUpdatePos(client: Client, data: any) {
    const player = this.state.players.get(client.sessionId);
    player.x = data.x;
    player.z = data.z;
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
