import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";

import appConfig from "../app.config";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  // @ts-ignore
  beforeAll(async () => (colyseus = await boot(appConfig, 3001)));
  afterAll(async () => await colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("connecting into a room", async () => {
    const room = await colyseus.createRoom("my_room", {});

    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);

    expect(client1.sessionId).toEqual(room.clients[0].sessionId);
    expect(client2.sessionId).toEqual(room.clients[1].sessionId);
  });
});
