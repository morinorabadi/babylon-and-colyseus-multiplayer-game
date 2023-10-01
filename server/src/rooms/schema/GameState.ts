import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("number") x: number;
  @type("number") z: number;
  @type("number") t: number;
  @type("string") color: string;

  constructor({ x, z, color }: { x: number; z: number; color: string }) {
    super();
    this.x = x;
    this.z = z;
    this.t = 0;
    this.color = color;
  }
}

export class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
