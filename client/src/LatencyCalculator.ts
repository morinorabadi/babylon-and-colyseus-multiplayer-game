import { Clock } from "./Clock";
import randomString from "./utils/radnomString";
import { Network } from "./NetWork";

interface IPing {
  timeSends: number;
  timeBacks: number;
  id: string;
}

export class LatencyCalculator {
  results: Map<string, IPing[]> = new Map();
  readonly PING_COUNT = 20; // ms
  readonly PING_TIME = 50; // ms

  constructor() {
    Network.getInstance().room.onMessage("pong", this.receivePongs.bind(this));
  }

  async calculate() {
    const id = randomString(8);
    const pings: IPing[] = [];
    this.results.set(id, pings);
    this.sendPings(id);

    let isOver = false;

    while (!isOver) {
      await new Promise((r) => setTimeout(r, 100));
      console.log("wait");
      if (pings.length === this.PING_COUNT) isOver = true;
    }

    return this.calculateResult(id);
  }

  private sendPings(id: string) {
    for (let index = 0; index < this.PING_COUNT; index++) {
      setTimeout(() => {
        const timeSends = Clock.now();
        Network.getInstance().room.send("ping", {
          timeSends,
          id,
        });
      }, this.PING_TIME * index);
    }
  }

  private receivePongs(data: IPing) {
    const pings = this.results.get(data.id)!;
    data.timeBacks = Clock.now();
    pings.push(data);
  }

  private calculateResult(id: string) {
    const pings = this.results.get(id)!;
    const sum = pings.reduce((sum, data) => {
      return sum + data.timeBacks - data.timeSends;
    }, 0);
    return sum / 20;
  }
}
