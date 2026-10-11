"use client";

import {
  type CSSProperties,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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

// Fullscreen API helpers. Safari still exposes some of these with a webkit prefix, and
// iPhone Safari does not support element fullscreen at all.
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function exitFullscreen() {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) await doc.exitFullscreen();
  else await doc.webkitExitFullscreen?.();
}

function subscribeToFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);
  return () => {
    document.removeEventListener("fullscreenchange", onChange);
    document.removeEventListener("webkitfullscreenchange", onChange);
  };
}

// Full screen always uses the dark palette from app/globals.css, whatever the system theme,
// so the clock reads well on TVs and monitors. Utilities read these variables, so overriding
// them on the fullscreen element re-themes everything inside it.
const FULLSCREEN_THEME = {
  "--background": "#0b0b0c",
  "--foreground": "#f4f4f5",
  "--surface": "#18181b",
  "--muted-surface": "#27272a",
  "--muted": "#a1a1aa",
  "--border": "#3f3f46",
  "--accent": "#2dd4bf",
  "--accent-strong": "#5eead4",
  "--accent-soft": "#042f2e",
  "--on-accent": "#042f2e",
  "--danger": "#f87171",
} as CSSProperties;

// Screen Wake Lock status while a countdown runs. Support itself is read separately.
type WakeLockStatus = "requesting" | "active" | "released" | "failed";

// Wake Lock support never changes during a page's life, so there is nothing to subscribe to.
const subscribeToNothing = () => () => {};

// The parts of the Screen Wake Lock API and document this uses, so it can be tested with fakes.
type WakeLockSentinelLike = {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
};
type WakeLockApi = { request(type: "screen"): Promise<WakeLockSentinelLike> };
type VisibilitySource = {
  readonly visibilityState: DocumentVisibilityState;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
};

/**
 * Holds a screen wake lock until the returned function is called. Requests only while the page
 * is visible, never runs two requests at once, never reuses a released sentinel, requests a new
 * lock when the page becomes visible again, and releases a lock that arrives after stopping.
 * Status is only reported asynchronously. Failures are reported, never thrown.
 */
export function holdScreenWakeLock(
  wakeLock: WakeLockApi,
  page: VisibilitySource,
  onStatus: (status: Exclude<WakeLockStatus, "requesting">) => void,
): () => void {
  let stopped = false;
  let pending = false;
  let sentinel: WakeLockSentinelLike | null = null;

  const request = async () => {
    if (stopped || pending || page.visibilityState !== "visible") return;
    if (sentinel && !sentinel.released) return;
    pending = true;
    try {
      const lock = await wakeLock.request("screen");
      if (stopped) {
        void lock.release().catch(() => {});
        return;
      }
      sentinel = lock;
      onStatus("active");
      // Browsers release the lock themselves when the page is hidden or for system reasons.
      lock.addEventListener("release", () => {
        if (sentinel !== lock) return;
        sentinel = null;
        if (!stopped) onStatus("released");
      });
    } catch {
      // Permission policy, battery saver, or a hidden page; the timer works regardless.
      if (!stopped) onStatus("failed");
    } finally {
      pending = false;
    }
  };

  const onVisibilityChange = () => {
    if (page.visibilityState === "visible") void request();
  };

  void request();
  page.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    stopped = true;
    page.removeEventListener("visibilitychange", onVisibilityChange);
    const lock = sentinel;
    sentinel = null;
    if (lock && !lock.released) void lock.release().catch(() => {});
  };
}

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreenNotice, setFullscreenNotice] = useState("");

  // Time editor shown inside full screen, where the regular inputs are hidden.
  const [editing, setEditing] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState("");
  const [draftSeconds, setDraftSeconds] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const draftMinutesRef = useRef<HTMLInputElement>(null);
  const restoreEditFocusRef = useRef(false);

  const [wakeLock, setWakeLock] = useState<WakeLockStatus>("requesting");
  const wakeLockSupported = useSyncExternalStore(
    subscribeToNothing,
    () => "wakeLock" in navigator,
    () => false,
  );

  const ids = {
    container: useId(),
    minutes: useId(),
    seconds: useId(),
    error: useId(),
    sound: useId(),
    draftMinutes: useId(),
    draftSeconds: useId(),
    draftError: useId(),
    draftHint: useId(),
  };

  // Only the timer card goes full screen. It is the same element either way, so React state
  // and the CountdownClock are untouched by entering or leaving full screen. The server
  // snapshot is false, so the first client render matches the prerendered HTML.
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    () => getFullscreenElement()?.id === ids.container,
    () => false,
  );

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

  // Leave full screen if the route is hidden (Cache Components keeps it mounted) or the
  // component unmounts, so a hidden timer never stays in full screen.
  useLayoutEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container && getFullscreenElement() === container) void exitFullscreen().catch(() => {});
    };
  }, []);

  // Ask the browser to keep the screen awake only while a countdown is running. The cleanup
  // releases the lock on pause, reset, completion, unmount, or when the route is hidden.
  const holdWakeLock = status === "running" && wakeLockSupported;
  useEffect(() => {
    if (!holdWakeLock) return;
    // Each run owns its own lock; the returned cleanup releases it and ignores late results.
    return holdScreenWakeLock(navigator.wakeLock, document, setWakeLock);
  }, [holdWakeLock]);

  // Move focus into the time editor when it opens, and back to "Edit time" after save or cancel.
  useEffect(() => {
    if (!isFullscreen) return;
    if (editing) {
      draftMinutesRef.current?.focus();
    } else if (restoreEditFocusRef.current) {
      restoreEditFocusRef.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing, isFullscreen]);

  // Called from a click so browsers treat it as a user gesture.
  async function toggleFullscreen() {
    setFullscreenNotice("");
    const container = containerRef.current as FullscreenCapableElement | null;
    if (!container) return;
    try {
      if (getFullscreenElement() === container) {
        await exitFullscreen();
      } else if (container.requestFullscreen) {
        // Always open full screen with the editor closed.
        setEditing(false);
        await container.requestFullscreen({ navigationUI: "hide" });
      } else if (container.webkitRequestFullscreen) {
        setEditing(false);
        await container.webkitRequestFullscreen();
      } else {
        setFullscreenNotice("Full screen isn't available in this browser.");
      }
    } catch {
      setFullscreenNotice(
        "Your browser didn't allow full screen. Try again, or check your browser settings.",
      );
    }
  }

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
    setWakeLock("requesting");
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
    setWakeLock("requesting");
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

  function openEditor() {
    setDraftMinutes(minutes);
    setDraftSeconds(seconds);
    setDraftError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraftError(null);
    setEditing(false);
    restoreEditFocusRef.current = true;
  }

  // Saving sets a new time the same way the regular inputs do. Those inputs are locked while a
  // countdown is active, so saving during a countdown stops it rather than leaving it running
  // with a time that no longer matches the setting.
  function saveEdit() {
    const result = parseDuration(draftMinutes, draftSeconds);
    if (!result.ok) {
      setDraftError(result.error);
      return;
    }
    const stoppedActiveCountdown = isActive;
    clockRef.current?.reset();
    setMinutes(draftMinutes);
    setSeconds(draftSeconds);
    setShowErrors(false);
    setStatus("idle");
    setRemainingMs(0);
    setTotalMs(0);
    setDraftError(null);
    setEditing(false);
    restoreEditFocusRef.current = true;
    const duration = describeDuration(result.totalMs / 1000);
    setAnnouncement(
      stoppedActiveCountdown
        ? `Time set to ${duration}. The previous countdown was stopped. Press Start to begin.`
        : `Time set to ${duration}. Press Start to begin.`,
    );
  }

  function applyPreset(mins: number) {
    setMinutes(String(mins));
    setSeconds("0");
    setShowErrors(false);
    if (status === "finished") setStatus("idle");
  }

  const primaryLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";
  const errorMessage = showErrors && !parsed.ok ? parsed.error : null;
  const showEditor = isFullscreen && editing;
  // Short, honest status: a granted lock asks the screen to stay on, but the device can still
  // override it (for example on low battery), so this never promises the screen stays on.
  const wakeLockMessage =
    status !== "running"
      ? ""
      : !wakeLockSupported
        ? "This browser can't keep the screen awake, so your device's sleep settings still apply."
        : wakeLock === "active"
          ? "Keeping the screen awake while the timer runs."
          : wakeLock === "released"
            ? "The screen may turn off. Keeping it awake resumes when this page is visible again."
            : wakeLock === "failed"
              ? "Your browser didn't allow keeping the screen awake (for example, in battery saver mode). The timer still works."
              : "Asking the browser to keep the screen awake…";
  const clockText = formatClock(displaySeconds);
  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const inputBaseClass =
    "w-full rounded-lg border border-border bg-surface px-3 text-center font-semibold tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger";
  const inputClass = `${inputBaseClass} py-2.5 text-2xl`;
  const draftInputClass = `${inputBaseClass} py-3 text-3xl`;

  return (
    <div
      ref={containerRef}
      id={ids.container}
      style={isFullscreen ? FULLSCREEN_THEME : undefined}
      className={
        isFullscreen
          ? "flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-background p-6 text-foreground sm:p-10"
          : "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8"
      }
    >
      <div className={isFullscreen ? "fixed top-4 right-4 sm:top-6 sm:right-6" : "-mt-1 mb-3 flex justify-end"}>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
          className={`inline-flex items-center gap-2 rounded-lg border border-border font-medium text-foreground hover:bg-muted-surface ${focusRing} ${
            isFullscreen ? "min-h-12 px-4 text-base" : "min-h-10 px-3 text-sm"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isFullscreen ? (
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            ) : (
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            )}
          </svg>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>

      {fullscreenNotice && (
        <p role="status" className="mb-3 text-sm text-muted">
          {fullscreenNotice}
        </p>
      )}

      <div
        role="timer"
        aria-label="Time remaining"
        className={`text-center font-mono font-semibold tabular-nums tracking-tight ${
          status === "finished" ? "text-accent" : "text-foreground"
        } ${
          isFullscreen
            ? // Sized to the viewport so the clock fills a TV or monitor; H:MM:SS needs more width.
              `leading-none ${clockText.length > 5 ? "text-[length:min(17vw,38vh)]" : "text-[length:min(25vw,48vh)]"}`
            : "text-6xl sm:text-7xl"
        }`}
      >
        {clockText}
      </div>

      <div
        className={`overflow-hidden rounded-full bg-muted-surface ${
          isFullscreen ? "mt-[4vh] h-3 w-full max-w-5xl" : "mt-5 h-2"
        }`}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-linear motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {status === "finished" && (
        <p
          className={`rounded-lg bg-accent-soft text-center font-semibold text-accent-strong ${
            isFullscreen ? "mt-[4vh] px-6 py-4 text-2xl sm:text-3xl" : "mt-5 px-4 py-3"
          }`}
        >
          Time&apos;s up! Your {describeDuration(totalMs / 1000)} countdown is complete.
        </p>
      )}

      {showEditor ? (
        <form
          className="mt-[4vh] w-full max-w-xl"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveEdit();
          }}
        >
          <fieldset>
            <legend className="text-lg font-semibold text-foreground">Edit time</legend>
            {isActive && (
              <p id={ids.draftHint} className="mt-1 text-sm text-muted">
                Saving stops the current countdown and sets the new time. Cancel keeps it running.
              </p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor={ids.draftMinutes} className="mb-1 block text-sm text-muted">
                  Minutes
                </label>
                <input
                  ref={draftMinutesRef}
                  id={ids.draftMinutes}
                  name="draft-minutes"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  value={draftMinutes}
                  onChange={(e) => setDraftMinutes(sanitizeDigits(e.target.value, 3))}
                  aria-invalid={draftError ? true : undefined}
                  aria-describedby={draftError ? ids.draftError : undefined}
                  className={draftInputClass}
                />
              </div>
              <div>
                <label htmlFor={ids.draftSeconds} className="mb-1 block text-sm text-muted">
                  Seconds (0–{MAX_SECONDS})
                </label>
                <input
                  id={ids.draftSeconds}
                  name="draft-seconds"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={2}
                  value={draftSeconds}
                  onChange={(e) => setDraftSeconds(sanitizeDigits(e.target.value, 2))}
                  aria-invalid={draftError ? true : undefined}
                  aria-describedby={draftError ? ids.draftError : undefined}
                  className={draftInputClass}
                />
              </div>
            </div>
          </fieldset>

          {draftError && (
            <p id={ids.draftError} role="alert" className="mt-3 text-center text-lg font-medium text-danger">
              {draftError}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="submit"
              aria-describedby={isActive ? ids.draftHint : undefined}
              className={`min-h-16 rounded-lg bg-accent px-5 text-xl font-semibold text-on-accent hover:bg-accent-strong ${focusRing}`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className={`min-h-16 rounded-lg border border-border px-5 text-xl font-semibold text-foreground hover:bg-muted-surface ${focusRing}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
      <form
        className={isFullscreen ? "mt-[4vh] w-full max-w-xl" : "mt-6"}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handlePrimary();
        }}
      >
        {/* Time entry, presets, and the sound toggle are hidden in full screen to keep it uncluttered. */}
        {!isFullscreen && (
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
        )}

        {errorMessage && (
          <p
            id={ids.error}
            className={`mt-3 font-medium text-danger ${isFullscreen ? "text-center text-lg" : "text-sm"}`}
          >
            {errorMessage}
          </p>
        )}

        <div className={`grid grid-cols-2 gap-3 ${isFullscreen ? "mt-4 sm:gap-4" : "mt-6"}`}>
          <button
            type="submit"
            className={`rounded-lg bg-accent px-5 font-semibold text-on-accent hover:bg-accent-strong ${focusRing} ${
              isFullscreen ? "min-h-16 text-xl" : "min-h-12 text-base"
            }`}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === "idle"}
            className={`rounded-lg border border-border px-5 font-semibold text-foreground hover:bg-muted-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
              isFullscreen ? "min-h-16 text-xl" : "min-h-12 text-base"
            }`}
          >
            Reset
          </button>
        </div>

        {isFullscreen && (
          <button
            ref={editButtonRef}
            type="button"
            onClick={openEditor}
            className={`mt-3 min-h-14 w-full rounded-lg border border-border px-5 text-lg font-semibold text-foreground hover:bg-muted-surface sm:mt-4 ${focusRing}`}
          >
            Edit time
          </button>
        )}

        {!isFullscreen && (
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
        )}
      </form>
      )}

      {/* Always rendered so screen readers announce changes; empty unless a countdown is running. */}
      <p
        aria-live="polite"
        className={`text-muted empty:hidden ${isFullscreen ? "mt-4 text-center text-base" : "mt-4 text-sm"}`}
      >
        {wakeLockMessage}
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
