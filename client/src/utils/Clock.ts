export class Clock {
  readonly startTime: number;
  private oldTime = 0;
  private elapsedTime = 0;

  constructor(startTime: number) {
    this.startTime = startTime;
    this.oldTime = Clock.now();
    this.elapsedTime = this.startTime;
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
