export const MAX_MINUTES = 999;
export const MAX_SECONDS = 59;

/** Keeps only digits and limits length, so typed or pasted text can't become negative or fractional. */
export function sanitizeDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export type DurationResult =
  | { ok: true; totalMs: number }
  | { ok: false; error: string };

export function parseDuration(minutes: string, seconds: string): DurationResult {
  const m = minutes === "" ? 0 : Number(minutes);
  const s = seconds === "" ? 0 : Number(seconds);

  if (!Number.isInteger(m) || m < 0 || m > MAX_MINUTES) {
    return { ok: false, error: `Minutes must be a whole number from 0 to ${MAX_MINUTES}.` };
  }
  if (!Number.isInteger(s) || s < 0 || s > MAX_SECONDS) {
    return { ok: false, error: `Seconds must be a whole number from 0 to ${MAX_SECONDS}.` };
  }
  if (m === 0 && s === 0) {
    return { ok: false, error: "Enter a time greater than zero." };
  }
  return { ok: true, totalMs: (m * 60 + s) * 1000 };
}

/** Whole seconds left, rounded up so the display shows 00:01 until the final second ends. */
export function remainingSeconds(ms: number): number {
  return Math.max(0, Math.ceil(ms / 1000));
}

/** Formats seconds as MM:SS, or H:MM:SS once the time reaches an hour. */
export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Spoken form for screen readers, e.g. "4 minutes 30 seconds". */
export function describeDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  if (s || parts.length === 0) parts.push(`${s} ${s === 1 ? "second" : "seconds"}`);
  return parts.join(" ");
}
