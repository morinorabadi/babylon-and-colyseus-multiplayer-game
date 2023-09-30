import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") z: number;
  @type("string") color: string;

  constructor({ x, z }: { x: number; z: number }) {
    super();
    this.x = x;
    this.z = z;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
