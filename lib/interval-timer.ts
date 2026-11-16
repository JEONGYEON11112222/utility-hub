// Interval (HIIT / Tabata) schedule math, kept separate from React so it can be tested.
// A whole workout runs on one CountdownClock; the current phase is derived from the time
// elapsed, so pausing, resuming, and background tabs need no extra bookkeeping.

export const MAX_PHASE_SECONDS = 3599;
export const MAX_ROUNDS = 99;
export const MAX_PREP_SECONDS = 60;

export type IntervalSettings = {
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  /** "Get ready" countdown before the first round. 0 skips it. */
  prepSeconds: number;
};

export type IntervalPreset = IntervalSettings & { name: string; summary: string };

export const INTERVAL_PRESETS: IntervalPreset[] = [
  { name: "Tabata", summary: "20s on, 10s off, 8 rounds", workSeconds: 20, restSeconds: 10, rounds: 8, prepSeconds: 10 },
  { name: "30/30", summary: "30s on, 30s off, 10 rounds", workSeconds: 30, restSeconds: 30, rounds: 10, prepSeconds: 10 },
  { name: "40/20", summary: "40s on, 20s off, 8 rounds", workSeconds: 40, restSeconds: 20, rounds: 8, prepSeconds: 10 },
  { name: "45/15", summary: "45s on, 15s off, 10 rounds", workSeconds: 45, restSeconds: 15, rounds: 10, prepSeconds: 10 },
  { name: "EMOM 10", summary: "1 minute each, 10 rounds", workSeconds: 60, restSeconds: 0, rounds: 10, prepSeconds: 10 },
];

export type SettingsResult =
  | { ok: true; settings: IntervalSettings }
  | { ok: false; field: "work" | "rest" | "rounds" | "prep"; error: string };

function wholeNumber(value: string): number {
  return value.trim() === "" ? 0 : Number(value);
}

/** Validates the four form fields (digits only, already sanitized by the UI). */
export function parseIntervalSettings(work: string, rest: string, rounds: string, prep: string): SettingsResult {
  const w = wholeNumber(work);
  const r = wholeNumber(rest);
  const n = wholeNumber(rounds);
  const p = wholeNumber(prep);
  if (!Number.isInteger(w) || w < 1 || w > MAX_PHASE_SECONDS) {
    return { ok: false, field: "work", error: `Work time must be from 1 to ${MAX_PHASE_SECONDS} seconds.` };
  }
  if (!Number.isInteger(r) || r < 0 || r > MAX_PHASE_SECONDS) {
    return { ok: false, field: "rest", error: `Rest time must be from 0 to ${MAX_PHASE_SECONDS} seconds.` };
  }
  if (!Number.isInteger(n) || n < 1 || n > MAX_ROUNDS) {
    return { ok: false, field: "rounds", error: `Rounds must be a whole number from 1 to ${MAX_ROUNDS}.` };
  }
  if (!Number.isInteger(p) || p < 0 || p > MAX_PREP_SECONDS) {
    return { ok: false, field: "prep", error: `Get ready time must be from 0 to ${MAX_PREP_SECONDS} seconds.` };
  }
  return { ok: true, settings: { workSeconds: w, restSeconds: r, rounds: n, prepSeconds: p } };
}

export type PhaseKind = "prep" | "work" | "rest";

export type Phase = {
  kind: PhaseKind;
  /** 1-based round this phase belongs to. The get-ready phase counts as round 1. */
  round: number;
  startMs: number;
  durationMs: number;
};

/**
 * Lays out the workout: optional get-ready, then work and rest for each round. There is no
 * rest after the last round, since the workout is over.
 */
export function buildPhases(settings: IntervalSettings): Phase[] {
  const phases: Phase[] = [];
  let at = 0;
  const push = (kind: PhaseKind, round: number, seconds: number) => {
    if (seconds <= 0) return;
    phases.push({ kind, round, startMs: at, durationMs: seconds * 1000 });
    at += seconds * 1000;
  };
  push("prep", 1, settings.prepSeconds);
  for (let round = 1; round <= settings.rounds; round++) {
    push("work", round, settings.workSeconds);
    if (round < settings.rounds) push("rest", round, settings.restSeconds);
  }
  return phases;
}

export function totalDurationMs(phases: Phase[]): number {
  const last = phases[phases.length - 1];
  return last ? last.startMs + last.durationMs : 0;
}

export type PhasePosition = { index: number; phase: Phase; phaseRemainingMs: number };

/** The phase running `elapsedMs` into the workout. Past the end, the last phase with 0 left. */
export function phaseAt(phases: Phase[], elapsedMs: number): PhasePosition {
  const elapsed = Math.max(0, elapsedMs);
  for (let index = 0; index < phases.length; index++) {
    const phase = phases[index];
    const end = phase.startMs + phase.durationMs;
    if (elapsed < end) return { index, phase, phaseRemainingMs: end - elapsed };
  }
  const index = phases.length - 1;
  return { index, phase: phases[index], phaseRemainingMs: 0 };
}

export const PHASE_LABELS: Record<PhaseKind, string> = {
  prep: "Get ready",
  work: "Work",
  rest: "Rest",
};
