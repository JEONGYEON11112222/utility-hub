// Countdown timing, kept separate from React so it can be tested with a fake scheduler.

/** How often a running countdown rechecks the time. The display only changes once a second. */
export const TICK_MS = 200;

export type ClockScheduler = {
  now(): number;
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
};

export type ClockState = "idle" | "running" | "paused" | "finished";

/**
 * Tracks one countdown independently of React. Remaining time is always derived from a fixed
 * end time, so the display is correct whenever it is checked. Completion is detected by a
 * display interval, a one-shot timeout aimed at the end time, and explicit check() calls
 * (e.g. when the tab becomes visible). Browsers may still delay timers in background tabs,
 * so the exact moment of the alert there is not guaranteed. finish() runs at most once per run.
 */
export class CountdownClock {
  private state: ClockState = "idle";
  private endAt = 0;
  private remaining = 0;
  private intervalId: number | null = null;
  private timeoutId: number | null = null;

  constructor(
    private readonly scheduler: ClockScheduler,
    private readonly onTick: (remainingMs: number) => void,
    private readonly onFinish: () => void,
    private readonly tickMs = TICK_MS,
  ) {}

  get currentState(): ClockState {
    return this.state;
  }

  start(durationMs: number) {
    this.clearTimers();
    this.endAt = this.scheduler.now() + durationMs;
    this.state = "running";
    this.arm();
  }

  /** Returns the time left. If the end time has already passed, the run finishes instead. */
  pause(): number {
    if (this.state !== "running") return this.remaining;
    this.check();
    if (this.state !== "running") return 0;
    this.remaining = Math.max(0, this.endAt - this.scheduler.now());
    this.clearTimers();
    this.state = "paused";
    return this.remaining;
  }

  resume() {
    if (this.state !== "paused") return;
    this.endAt = this.scheduler.now() + this.remaining;
    this.state = "running";
    this.arm();
  }

  reset() {
    this.clearTimers();
    this.state = "idle";
    this.remaining = 0;
  }

  /** Recalculates now and finishes the run if the end time has passed. Safe to call repeatedly. */
  check = () => {
    if (this.state !== "running") return;
    const left = this.endAt - this.scheduler.now();
    if (left <= 0) this.finish();
    else this.onTick(left);
  };

  /** (Re)starts timers for a running countdown, e.g. after the component becomes visible again. */
  arm() {
    if (this.state !== "running") return;
    this.clearTimers();
    this.intervalId = this.scheduler.setInterval(this.check, this.tickMs);
    this.scheduleEndTimeout();
    this.check();
  }

  /** Stops timers without changing state, e.g. when the component is hidden or unmounted. */
  suspend() {
    this.clearTimers();
  }

  private scheduleEndTimeout() {
    const left = Math.max(0, this.endAt - this.scheduler.now());
    this.timeoutId = this.scheduler.setTimeout(() => {
      this.timeoutId = null;
      if (this.state !== "running") return;
      if (this.endAt - this.scheduler.now() <= 0) this.finish();
      // Timers can fire slightly early; aim again at the remaining time.
      else this.scheduleEndTimeout();
    }, left);
  }

  private finish() {
    if (this.state !== "running") return;
    this.state = "finished";
    this.clearTimers();
    this.onFinish();
  }

  private clearTimers() {
    if (this.intervalId !== null) this.scheduler.clearInterval(this.intervalId);
    if (this.timeoutId !== null) this.scheduler.clearTimeout(this.timeoutId);
    this.intervalId = null;
    this.timeoutId = null;
  }
}

export const browserScheduler: ClockScheduler = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => window.clearTimeout(id),
  setInterval: (fn, ms) => window.setInterval(fn, ms),
  clearInterval: (id) => window.clearInterval(id),
};
