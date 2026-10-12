import { cleanNumber } from "./format";

export type CalcResult<T> = { ok: true; value: T } | { ok: false; error: string };

function finiteResult(value: number): CalcResult<number> {
  return Number.isFinite(value)
    ? { ok: true, value: cleanNumber(value) }
    : { ok: false, error: "The result is too large to show." };
}

/** What is X percent of Y? */
export function percentOf(percent: number, total: number): CalcResult<number> {
  return finiteResult((percent / 100) * total);
}

/** X is what percent of Y? */
export function whatPercent(part: number, total: number): CalcResult<number> {
  if (total === 0) return { ok: false, error: "The second number can't be zero, because you can't divide by zero." };
  return finiteResult((part / total) * 100);
}

export type PercentChange = {
  /** Signed percentage change; negative means a decrease. */
  percent: number;
  difference: number;
  direction: "increase" | "decrease" | "no change";
};

/**
 * Percentage change from an original value to a new value: (new − original) ÷ |original| × 100.
 * Dividing by the absolute value keeps the sign meaningful when the original is negative.
 */
export function percentChange(original: number, next: number): CalcResult<PercentChange> {
  if (original === 0) {
    return { ok: false, error: "The original value can't be zero; a change from zero has no percentage." };
  }
  const difference = cleanNumber(next - original);
  const percent = ((next - original) / Math.abs(original)) * 100;
  if (!Number.isFinite(percent)) return { ok: false, error: "The result is too large to show." };
  const cleaned = cleanNumber(percent);
  return {
    ok: true,
    value: {
      percent: cleaned,
      difference,
      direction: cleaned > 0 ? "increase" : cleaned < 0 ? "decrease" : "no change",
    },
  };
}
