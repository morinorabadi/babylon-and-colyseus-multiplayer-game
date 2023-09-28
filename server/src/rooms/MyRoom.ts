import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<GameState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new GameState());

    this.onMessage("update", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      player.x = data.x;
      player.x = data.y;
    });
  }

  onJoin(client: Client, options: any) {
    const startPos = {
      x: Math.round(Math.random() * 10 - 5),
      y: Math.round(Math.random() * 10 - 5),
    };
    this.state.players.set(client.sessionId, new Player(startPos));
    client.send("start", startPos);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
