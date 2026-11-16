"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { FULLSCREEN_THEME } from "@/components/fullscreen-theme";
import { playBeep, playChime } from "@/lib/chime";
import { browserScheduler, CountdownClock } from "@/lib/countdown-clock";
import {
  exitFullscreen,
  type FullscreenCapableElement,
  getFullscreenElement,
  subscribeToFullscreen,
} from "@/lib/fullscreen";
import {
  buildPhases,
  INTERVAL_PRESETS,
  MAX_PHASE_SECONDS,
  MAX_PREP_SECONDS,
  MAX_ROUNDS,
  type Phase,
  PHASE_LABELS,
  phaseAt,
  parseIntervalSettings,
  totalDurationMs,
} from "@/lib/interval-timer";
import { describeDuration, formatClock, remainingSeconds, sanitizeDigits } from "@/lib/timer";
import { holdScreenWakeLock, type WakeLockStatus } from "@/lib/wake-lock";
import { ShareLink, useShareHash } from "@/components/share-link";

type Status = "idle" | "running" | "paused" | "finished";
type Field = "work" | "rest" | "rounds" | "prep";

const subscribeToNothing = () => () => {};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function phaseAnnouncement(phase: Phase, rounds: number): string {
  if (phase.kind === "prep") return "Get ready.";
  if (phase.kind === "rest") return `Rest. Round ${phase.round + 1} of ${rounds} is next.`;
  return `Round ${phase.round} of ${rounds}: work.`;
}

export function IntervalTimer() {
  const tabata = INTERVAL_PRESETS[0];
  const [work, setWork] = useState(String(tabata.workSeconds));
  const [rest, setRest] = useState(String(tabata.restSeconds));
  const [rounds, setRounds] = useState(String(tabata.rounds));
  const [prep, setPrep] = useState(String(tabata.prepSeconds));
  useShareHash("work", (params) => {
    // Same sanitizing as typing, so a hand-edited link can't put anything odd in the fields.
    setWork(sanitizeDigits(params.get("work") ?? "", 4));
    setRest(sanitizeDigits(params.get("rest") ?? "", 4));
    setRounds(sanitizeDigits(params.get("rounds") ?? "", 2));
    setPrep(sanitizeDigits(params.get("prep") ?? "", 2));
  });
  const [status, setStatus] = useState<Status>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState("");
  const [wakeLock, setWakeLock] = useState<WakeLockStatus>("requesting");

  // The schedule of the run in progress. Kept apart from the form so editing is locked out
  // during a run and the display never mixes two schedules.
  const [phases, setPhases] = useState<Phase[]>([]);
  const phasesRef = useRef<Phase[]>([]);
  const roundsRef = useRef(0);
  const lastPhaseRef = useRef(-1);
  const lastCueSecondRef = useRef(-1);

  const clockRef = useRef<CountdownClock | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  const containerRef = useRef<HTMLDivElement>(null);

  const ids = {
    container: useId(),
    work: useId(),
    rest: useId(),
    rounds: useId(),
    prep: useId(),
    error: useId(),
    sound: useId(),
  };

  const wakeLockSupported = useSyncExternalStore(subscribeToNothing, () => "wakeLock" in navigator, () => false);
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    () => getFullscreenElement()?.id === ids.container,
    () => false,
  );

  const parsed = parseIntervalSettings(work, rest, rounds, prep);
  const isActive = status === "running" || status === "paused";
  // While idle, preview the schedule from the form so the total length is visible up front.
  const shownPhases = isActive || status === "finished" ? phases : parsed.ok ? buildPhases(parsed.settings) : [];
  const totalMs = totalDurationMs(shownPhases);
  const shownRounds = shownPhases.length > 0 ? shownPhases[shownPhases.length - 1].round : 0;
  const elapsedMs = isActive ? totalMs - remainingMs : status === "finished" ? totalMs : 0;
  const position = shownPhases.length > 0 ? phaseAt(shownPhases, elapsedMs) : null;
  const phaseSeconds = position ? remainingSeconds(position.phaseRemainingMs) : 0;
  const totalSecondsLeft = isActive ? remainingSeconds(remainingMs) : status === "finished" ? 0 : totalMs / 1000;
  const phaseProgress =
    status === "finished" ? 0 : position && isActive ? position.phaseRemainingMs / position.phase.durationMs : 1;
  const kind = status === "finished" ? null : position?.phase.kind ?? null;

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  function cue(frequency: number, count: number) {
    if (soundOnRef.current && audioRef.current) playBeep(audioRef.current, { frequency, count });
  }

  // Runs on every clock tick (outside render): phase changes and the 3-2-1 cues are detected
  // here so each sound plays once, even when React skips re-renders.
  const onTickRef = useRef<(left: number) => void>(() => {});
  useEffect(() => {
    onTickRef.current = (left: number) => {
      const schedule = phasesRef.current;
      if (schedule.length === 0) return;
      const at = phaseAt(schedule, totalDurationMs(schedule) - left);
      if (at.index !== lastPhaseRef.current) {
        lastPhaseRef.current = at.index;
        lastCueSecondRef.current = -1;
        if (at.index > 0) cue(at.phase.kind === "work" ? 880 : 520, at.phase.kind === "work" ? 2 : 1);
        setAnnouncement(phaseAnnouncement(at.phase, roundsRef.current));
      }
      const secondsLeft = remainingSeconds(at.phaseRemainingMs);
      if (secondsLeft <= 3 && secondsLeft !== lastCueSecondRef.current && at.phase.durationMs > 3000) {
        lastCueSecondRef.current = secondsLeft;
        cue(440, 1);
      }
    };
  });

  useEffect(() => {
    if (!clockRef.current) {
      clockRef.current = new CountdownClock(
        browserScheduler,
        (left) => {
          onTickRef.current(left);
          setRemainingMs((previous) => (remainingSeconds(previous) === remainingSeconds(left) ? previous : left));
        },
        () => {
          setRemainingMs(0);
          setStatus("finished");
          setAnnouncement("Workout complete!");
          if (soundOnRef.current && audioRef.current) playChime(audioRef.current);
        },
      );
    }
    const clock = clockRef.current;
    // Cache Components keeps hidden routes mounted and cleans up their effects; this re-arms
    // the clock when the route is shown again.
    clock.arm();
    document.addEventListener("visibilitychange", clock.check);
    return () => {
      document.removeEventListener("visibilitychange", clock.check);
      clock.suspend();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clockRef.current?.currentState === "running") return;
      audioRef.current?.close();
      audioRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container && getFullscreenElement() === container) void exitFullscreen().catch(() => {});
    };
  }, []);

  const tabLabel =
    status === "finished"
      ? "Done!"
      : isActive && kind
        ? `${PHASE_LABELS[kind]} ${formatClock(phaseSeconds)}`
        : null;
  useEffect(() => {
    if (!tabLabel) return;
    const previous = document.title;
    document.title = `${tabLabel} · Interval Timer`;
    return () => {
      document.title = previous;
    };
  }, [tabLabel]);

  const holdWakeLock = status === "running" && wakeLockSupported;
  useEffect(() => {
    if (!holdWakeLock) return;
    return holdScreenWakeLock(navigator.wakeLock, document, setWakeLock);
  }, [holdWakeLock]);

  function ensureAudio() {
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
    const schedule = buildPhases(parsed.settings);
    const total = totalDurationMs(schedule);
    phasesRef.current = schedule;
    roundsRef.current = parsed.settings.rounds;
    lastPhaseRef.current = -1;
    lastCueSecondRef.current = -1;
    setPhases(schedule);
    setWakeLock("requesting");
    setRemainingMs(total);
    setStatus("running");
    clockRef.current?.start(total);
  }

  function pause() {
    const clock = clockRef.current;
    if (!clock) return;
    const left = clock.pause();
    if (clock.currentState !== "paused") return;
    setRemainingMs(left);
    setStatus("paused");
    setAnnouncement("Paused.");
  }

  function resume() {
    ensureAudio();
    setWakeLock("requesting");
    setStatus("running");
    setAnnouncement("Resumed.");
    clockRef.current?.resume();
  }

  function reset() {
    clockRef.current?.reset();
    phasesRef.current = [];
    setStatus("idle");
    setRemainingMs(0);
    setAnnouncement("Timer reset.");
  }

  function handlePrimary() {
    if (status === "running") pause();
    else if (status === "paused") resume();
    else start();
  }

  function edit(setter: (v: string) => void, value: string, maxLength: number) {
    setter(sanitizeDigits(value, maxLength));
    if (status === "finished") setStatus("idle");
  }

  function applyPreset(index: number) {
    const preset = INTERVAL_PRESETS[index];
    setWork(String(preset.workSeconds));
    setRest(String(preset.restSeconds));
    setRounds(String(preset.rounds));
    setPrep(String(preset.prepSeconds));
    setShowErrors(false);
    if (status === "finished") setStatus("idle");
    setAnnouncement(`${preset.name} set: ${preset.summary}.`);
  }

  async function toggleFullscreen() {
    setFullscreenNotice("");
    const container = containerRef.current as FullscreenCapableElement | null;
    if (!container) return;
    try {
      if (getFullscreenElement() === container) await exitFullscreen();
      else if (container.requestFullscreen) await container.requestFullscreen({ navigationUI: "hide" });
      else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen();
      else setFullscreenNotice("Full screen isn't available in this browser.");
    } catch {
      setFullscreenNotice("Your browser didn't allow full screen. Try again, or check your browser settings.");
    }
  }

  const errorField: Field | null = showErrors && !parsed.ok ? parsed.field : null;
  const errorMessage = showErrors && !parsed.ok ? parsed.error : null;
  const primaryLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";
  const phaseLabel = status === "finished" ? "Done" : kind ? PHASE_LABELS[kind] : "Work";
  const roundText =
    status === "finished"
      ? `${shownRounds} of ${shownRounds} rounds complete`
      : position && shownRounds
        ? `Round ${position.phase.round} of ${shownRounds}`
        : "";
  const phaseClass =
    status === "finished" || kind === "work"
      ? "bg-accent-soft text-accent-strong"
      : "bg-muted-surface text-foreground";
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
              ? "Your browser didn't allow keeping the screen awake. The timer still works."
              : "Asking the browser to keep the screen awake…";

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-center text-xl font-semibold tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger";
  const fields: { field: Field; id: string; label: string; value: string; set: (v: string) => void; max: number }[] = [
    { field: "work", id: ids.work, label: "Work (seconds)", value: work, set: setWork, max: 4 },
    { field: "rest", id: ids.rest, label: "Rest (seconds)", value: rest, set: setRest, max: 4 },
    { field: "rounds", id: ids.rounds, label: "Rounds", value: rounds, set: setRounds, max: 2 },
    { field: "prep", id: ids.prep, label: "Get ready (seconds)", value: prep, set: setPrep, max: 2 },
  ];
  const big = isFullscreen ? "min-h-16 text-xl" : "min-h-12 text-base";

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
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isFullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>

      {fullscreenNotice && (
        <p role="status" className="mb-3 text-sm text-muted">
          {fullscreenNotice}
        </p>
      )}

      <div className="flex flex-col items-center">
        <p
          className={`rounded-full px-4 py-1 font-semibold uppercase tracking-wide ${phaseClass} ${
            isFullscreen ? "text-3xl sm:text-4xl" : "text-base"
          }`}
        >
          {phaseLabel}
        </p>
        <div
          role="timer"
          aria-label={`${phaseLabel} time remaining`}
          className={`mt-3 text-center font-mono font-semibold tabular-nums tracking-tight ${
            status === "finished" ? "text-accent" : "text-foreground"
          } ${isFullscreen ? "text-[length:min(25vw,42vh)] leading-none" : "text-6xl sm:text-7xl"}`}
        >
          {formatClock(phaseSeconds)}
        </div>
        <p className={`mt-2 text-center text-muted tabular-nums ${isFullscreen ? "text-2xl" : "text-sm"}`}>
          {roundText}
          {roundText && " · "}
          {status === "finished" ? "Workout complete" : `${formatClock(totalSecondsLeft)} total left`}
        </p>
      </div>

      <div
        className={`overflow-hidden rounded-full bg-muted-surface ${isFullscreen ? "mt-[4vh] h-3 w-full max-w-5xl" : "mt-5 h-2"}`}
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-transform ease-linear motion-reduce:transition-none ${
            kind === "work" || status === "finished" ? "bg-accent" : "bg-muted"
          } ${status === "running" ? "duration-1000" : "duration-200"}`}
          style={{ transform: `translateX(${(phaseProgress - 1) * 100}%)` }}
        />
      </div>

      <form
        className={isFullscreen ? "mt-[4vh] w-full max-w-xl" : "mt-6"}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handlePrimary();
        }}
      >
        {!isFullscreen && (
          <fieldset disabled={isActive}>
            <legend className="text-sm font-medium text-muted">Set your intervals</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.field}>
                  <label htmlFor={f.id} className="mb-1 block text-sm text-muted">
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    name={f.field}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={f.max}
                    value={f.value}
                    onChange={(e) => edit(f.set, e.target.value, f.max)}
                    aria-invalid={errorField === f.field ? true : undefined}
                    aria-describedby={errorField === f.field ? ids.error : undefined}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Work 1–{MAX_PHASE_SECONDS}s, rest 0–{MAX_PHASE_SECONDS}s, up to {MAX_ROUNDS} rounds, get ready 0–{MAX_PREP_SECONDS}s.
            </p>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Workout presets">
              {INTERVAL_PRESETS.map((preset, index) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(index)}
                  title={preset.summary}
                  aria-label={`${preset.name}: ${preset.summary}`}
                  className={`min-h-10 rounded-full border border-border px-3.5 text-sm font-medium text-foreground hover:bg-muted-surface disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {errorMessage && (
          <p id={ids.error} className={`mt-3 font-medium text-danger ${isFullscreen ? "text-center text-lg" : "text-sm"}`}>
            {errorMessage}
          </p>
        )}

        <div className={`grid grid-cols-2 gap-3 ${isFullscreen ? "mt-4 sm:gap-4" : "mt-6"}`}>
          <button
            type="submit"
            className={`rounded-lg bg-accent px-5 font-semibold text-on-accent hover:bg-accent-strong ${focusRing} ${big}`}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === "idle"}
            className={`rounded-lg border border-border px-5 font-semibold text-foreground hover:bg-muted-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${big}`}
          >
            Reset
          </button>
        </div>

        {!isFullscreen && status === "idle" && parsed.ok && (
          <ShareLink params={{ work, rest, rounds, prep }} />
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
              Beep at each interval and on the last 3 seconds
            </label>
          </div>
        )}
      </form>

      <p aria-live="polite" className={`text-muted empty:hidden ${isFullscreen ? "mt-4 text-center text-base" : "mt-4 text-sm"}`}>
        {wakeLockMessage}
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      {status === "idle" && parsed.ok && (
        <p className="sr-only">Total workout length: {describeDuration(totalMs / 1000)}.</p>
      )}
    </div>
  );
}
