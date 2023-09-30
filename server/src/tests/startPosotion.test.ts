import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../app.config";
import { GameState } from "../rooms/schema/GameState";
import { Room } from "colyseus";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  // @ts-ignore
  beforeAll(async () => (colyseus = await boot(appConfig, 3000)));
  afterAll(async () => await colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("is start position working", async () => {
    const room: Room<GameState> = await colyseus.createRoom("my_room", {});
    const client1 = await colyseus.connectTo(room);
    await new Promise<void>((r) => {
      client1.onMessage("start", (startPos) => {
        console.log(startPos);
        r();
        expect(room.state.players.get(room.clients[0].sessionId).x).toEqual(
          startPos.x
        );
        expect(room.state.players.get(room.clients[0].sessionId).z).toEqual(
          startPos.z
        );
      });
    });
  });
});
