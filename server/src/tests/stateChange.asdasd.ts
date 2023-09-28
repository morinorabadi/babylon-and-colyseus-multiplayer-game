import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../app.config";
import { GameState } from "../rooms/schema/MyRoomState";
import { Room } from "colyseus";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;
  
  // @ts-ignore
  beforeAll(async () => (colyseus = await boot(appConfig)));
  afterAll(async () => await colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("state changes client1 to client2", async () => {
    const room : Room<GameState> = await colyseus.createRoom("my_room", {});

    // client1
    const client1 = await colyseus.connectTo(room);
    client1.onStateChange((state => {
      console.log(state);
    }))

    // client2
    const client2 = await colyseus.connectTo(room);
    client2.send("update", { x : 1 })
    // make your assertions
    expect(client1.sessionId).toEqual(room.clients[0].sessionId);
    expect(client2.sessionId).toEqual(room.clients[1].sessionId);
  });
});
