import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";

export class Game extends Room<GameState> {
  maxClients = 4;
  autoDispose = false;

  onCreate(options: any) {
    this.setState(new GameState());

    this.onMessage("update", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      player.x = data.x;
      player.x = data.y;
    });

    this.onMessage("load-over", (client) => {
      this.state.players.get(client.sessionId).isOnline = true;
      client.send("start");
    });
  }

  onJoin(client: Client, options: any) {
    const startPos = {
      x: Math.round(Math.random() * 10 - 5),
      y: Math.round(Math.random() * 10 - 5),
    };
    this.state.players.set(client.sessionId, new Player(startPos));
    client.send("load", startPos);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    player.isOnline = false;
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
