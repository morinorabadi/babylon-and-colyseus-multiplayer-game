export class Clock {
  readonly startTime: number;
  private oldTime = 0;
  private elapsedTime = 0;

  constructor() {
    this.startTime = Clock.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
  }

  static now() {
    return (typeof performance === "undefined" ? Date : performance).now(); // see #10732
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    const newTime = Clock.now();

    const diff = newTime - this.oldTime;
    this.oldTime = newTime;

    this.elapsedTime += diff;

    return diff;
  }
}
