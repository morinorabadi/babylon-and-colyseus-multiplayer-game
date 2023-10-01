import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") z: number;
  @type("string") color: string;

  constructor({ x, z, color }: { x: number; z: number; color: string }) {
    super();
    this.x = x;
    this.z = z;
    this.color = color;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("boolean") isGameStarted: false;
}
