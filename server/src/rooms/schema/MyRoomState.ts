import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;

  constructor({ x, y }: { x: number; y: number }) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
