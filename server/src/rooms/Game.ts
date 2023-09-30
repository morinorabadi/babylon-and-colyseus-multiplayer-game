import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";

export class Game extends Room<GameState> {
  maxClients = 4;
  autoDispose = false;

  onCreate(options: any) {
    this.setState(new GameState());

    this.onMessage("load-over", this.onLoadOver.bind(this));

    this.onMessage("update-pos", this.onUpdatePos.bind(this));
  }

  onJoin(client: Client, options: any) {
    client.send("load");
    console.log(client.sessionId, "join!");
  }

  onLoadOver(client: Client, options: any) {
    const startPos = {
      x: Math.round(Math.random() * 10 - 5),
      z: Math.round(Math.random() * 10 - 5),
    };

    const player = new Player(startPos);
    player.color = options.color;
    console.log(startPos.x, startPos.z);

    this.state.players.set(client.sessionId, player);
    this.broadcast("player-join", {
      id: client.sessionId,
      x: startPos.x,
      z: startPos.z,
      color: options.color,
    });

    client.send("start", startPos);
  }

  onUpdatePos(client: Client, data: any) {
    const player = this.state.players.get(client.sessionId);
    player.x = data.x;
    player.z = data.z;
  }

  onLeave(client: Client, consented: boolean) {
    this.broadcast("player-left", { id: client.sessionId });
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
