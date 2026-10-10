"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  describeDuration,
  formatClock,
  MAX_SECONDS,
  parseDuration,
  remainingSeconds,
  sanitizeDigits,
} from "@/lib/timer";

type Status = "idle" | "running" | "paused" | "finished";

const PRESET_MINUTES = [1, 3, 5, 10, 15, 25];
const TICK_MS = 200;

// Short three-note chime built with the Web Audio API, so no audio file or service is needed.
function playChime(ctx: AudioContext) {
  const start = ctx.currentTime;
  [0, 0.35, 0.7].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.3, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.32);
  });
}

export type ClockScheduler = {
  now(): number;
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
};

type ClockState = "idle" | "running" | "paused" | "finished";

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

const browserScheduler: ClockScheduler = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => window.clearTimeout(id),
  setInterval: (fn, ms) => window.setInterval(fn, ms),
  clearInterval: (id) => window.clearInterval(id),
};

type CountdownTimerProps = {
  /** Minutes preselected when the timer first loads. Seconds start at 0. */
  initialMinutes?: number;
};

export function CountdownTimer({ initialMinutes = 5 }: CountdownTimerProps) {
  const [minutes, setMinutes] = useState(String(initialMinutes));
  const [seconds, setSeconds] = useState("0");
  const [status, setStatus] = useState<Status>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  // Created on mount; the event handlers below only run after mount.
  const clockRef = useRef<CountdownClock | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);

  const ids = {
    minutes: useId(),
    seconds: useId(),
    error: useId(),
    sound: useId(),
  };

  const parsed = parseDuration(minutes, seconds);
  const isActive = status === "running" || status === "paused";
  const displaySeconds = isActive || status === "finished"
    ? remainingSeconds(remainingMs)
    : parsed.ok
      ? parsed.totalMs / 1000
      : 0;
  const progress = isActive && totalMs > 0 ? remainingMs / totalMs : status === "finished" ? 0 : 1;

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    if (!clockRef.current) {
      clockRef.current = new CountdownClock(
        browserScheduler,
        (left) => setRemainingMs(left),
        () => {
          setRemainingMs(0);
          setStatus("finished");
          setAnnouncement("Time's up!");
          if (soundOnRef.current && audioRef.current) playChime(audioRef.current);
        },
      );
    }
    const clock = clockRef.current;

    // Runs on mount and whenever the route becomes visible again (Cache Components keeps
    // hidden routes mounted and cleans up their effects). A countdown that ended while hidden
    // finishes here exactly once.
    clock.arm();
    // Browsers throttle timers in hidden tabs; recalculate as soon as the tab is visible again.
    document.addEventListener("visibilitychange", clock.check);
    return () => {
      document.removeEventListener("visibilitychange", clock.check);
      clock.suspend();
    };
  }, []);

  // Show the countdown in the browser tab title so it can be checked from other tabs.
  const tabLabel =
    status === "finished" ? "Time's up!" : isActive ? formatClock(displaySeconds) : null;
  useEffect(() => {
    if (!tabLabel) return;
    const previous = document.title;
    document.title = `${tabLabel} · Timer`;
    return () => {
      document.title = previous;
    };
  }, [tabLabel]);

  useEffect(() => {
    return () => {
      // This cleanup also runs when Cache Components hides the route. Keep the audio context
      // while a countdown is running so the chime can still play after the route is shown again.
      if (clockRef.current?.currentState === "running") return;
      audioRef.current?.close();
      audioRef.current = null;
    };
  }, []);

  function ensureAudio() {
    // Creating or resuming the AudioContext inside a click lets browsers allow the chime later.
    if (typeof window === "undefined" || !("AudioContext" in window)) return;
    if (!audioRef.current) audioRef.current = new AudioContext();
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
  }

  function start() {
    if (!parsed.ok) {
      setShowErrors(true);
      return;
    }
    ensureAudio();
    setTotalMs(parsed.totalMs);
    setRemainingMs(parsed.totalMs);
    setStatus("running");
    setAnnouncement(`Timer started for ${describeDuration(parsed.totalMs / 1000)}.`);
    clockRef.current?.start(parsed.totalMs);
  }

  function pause() {
    const clock = clockRef.current;
    if (!clock) return;
    const left = clock.pause();
    // If the end time had already passed, pause() finished the run instead.
    if (clock.currentState !== "paused") return;
    setRemainingMs(left);
    setStatus("paused");
    setAnnouncement(`Paused with ${describeDuration(remainingSeconds(left))} left.`);
  }

  function resume() {
    ensureAudio();
    setStatus("running");
    setAnnouncement("Timer resumed.");
    clockRef.current?.resume();
  }

  function reset() {
    clockRef.current?.reset();
    setStatus("idle");
    setRemainingMs(0);
    setTotalMs(0);
    setAnnouncement("Timer reset.");
  }

  function handlePrimary() {
    if (status === "running") pause();
    else if (status === "paused") resume();
    else start();
  }

  function editInput(setter: (v: string) => void, value: string, maxLength: number) {
    setter(sanitizeDigits(value, maxLength));
    if (status === "finished") setStatus("idle");
  }

  function applyPreset(mins: number) {
    setMinutes(String(mins));
    setSeconds("0");
    setShowErrors(false);
    if (status === "finished") setStatus("idle");
  }

  const primaryLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";
  const errorMessage = showErrors && !parsed.ok ? parsed.error : null;
  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-center text-2xl font-semibold tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8">
      <div
        role="timer"
        aria-label="Time remaining"
        className={`text-center font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl ${
          status === "finished" ? "text-accent" : "text-foreground"
        }`}
      >
        {formatClock(displaySeconds)}
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted-surface" aria-hidden="true">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-linear motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {status === "finished" && (
        <p className="mt-5 rounded-lg bg-accent-soft px-4 py-3 text-center font-semibold text-accent-strong">
          Time&apos;s up! Your {describeDuration(totalMs / 1000)} countdown is complete.
        </p>
      )}

      <form
        className="mt-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handlePrimary();
        }}
      >
        <fieldset disabled={isActive}>
          <legend className="text-sm font-medium text-muted">Set the countdown</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.minutes} className="mb-1 block text-sm text-muted">
                Minutes
              </label>
              <input
                id={ids.minutes}
                name="minutes"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                value={minutes}
                onChange={(e) => editInput(setMinutes, e.target.value, 3)}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? ids.error : undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={ids.seconds} className="mb-1 block text-sm text-muted">
                Seconds (0–{MAX_SECONDS})
              </label>
              <input
                id={ids.seconds}
                name="seconds"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={2}
                value={seconds}
                onChange={(e) => editInput(setSeconds, e.target.value, 2)}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? ids.error : undefined}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick presets">
            {PRESET_MINUTES.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => applyPreset(mins)}
                className="min-h-10 rounded-full border border-border px-3.5 text-sm font-medium text-foreground hover:bg-muted-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mins} min
              </button>
            ))}
          </div>
        </fieldset>

        {errorMessage && (
          <p id={ids.error} className="mt-3 text-sm font-medium text-danger">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="submit"
            className="min-h-12 rounded-lg bg-accent px-5 text-base font-semibold text-on-accent hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === "idle"}
            className="min-h-12 rounded-lg border border-border px-5 text-base font-semibold text-foreground hover:bg-muted-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <input
            id={ids.sound}
            type="checkbox"
            checked={soundOn}
            onChange={(e) => setSoundOn(e.target.checked)}
            className="size-4 accent-(--accent)"
          />
          <label htmlFor={ids.sound} className="text-sm text-muted">
            Play a chime when time is up
          </label>
        </div>
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
