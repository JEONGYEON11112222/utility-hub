import { cleanNumber } from "./format";
import { MAX_INPUT, parseNumber } from "./parse";

// What a comma means depends on how the list is separated. When numbers are separated by
// spaces, tabs, new lines, or semicolons, a comma inside a number is a thousands separator
// (1,500, 2,000). When commas are the only separator, every comma separates numbers
// (72,85,90). Decimal commas such as 3,5 are never guessed: they are reported as invalid.
const SPACED_SEPARATORS = /[\s;]+/;
const EDGE_COMMAS = /^,+|,+$/g;
/** A token that could be the part after a thousands separator, as in 1,500 or 1,500.25. */
const THREE_DIGIT_GROUP = /^\d{3}(\.\d*)?$/;

/** Most numbers accepted in one list, which keeps the page responsive. */
export const MAX_LIST_LENGTH = 10_000;

export type ParsedList = {
  numbers: number[];
  invalid: string[];
  tooMany: boolean;
  /**
   * True when commas were the only separator and a number after a comma has exactly three
   * digits, so a thousands separator may have been meant (1,500 is read as 1 and 500).
   */
  ambiguousCommas: boolean;
};

export function parseNumberList(text: string): ParsedList {
  const trimmed = text.trim();
  const spaced = SPACED_SEPARATORS.test(trimmed);
  const tokens = spaced
    ? trimmed.split(SPACED_SEPARATORS).map((token) => token.replace(EDGE_COMMAS, ""))
    : trimmed.split(",");
  const numbers: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    if (token === "") continue;
    const value = parseNumber(token);
    if (value !== null && Number.isFinite(value) && Math.abs(value) <= MAX_INPUT) numbers.push(value);
    else invalid.push(token);
  }
  return {
    numbers,
    invalid,
    tooMany: numbers.length > MAX_LIST_LENGTH,
    ambiguousCommas: !spaced && tokens.slice(1).some((token) => THREE_DIGIT_GROUP.test(token)),
  };
}

export type ListStats = {
  count: number;
  sum: number;
  mean: number;
  median: number;
  /**
   * The most frequent values, smallest first. Empty when every value appears equally often
   * (for example when no value repeats), since then no value stands out.
   */
  modes: number[];
  /** How many times each mode appears. */
  modeCount: number;
  min: number;
  max: number;
  range: number;
  /** Standard deviation treating the list as the whole population (divides by n). */
  populationSD: number;
  /** Standard deviation treating the list as a sample (divides by n − 1). Null for one value. */
  sampleSD: number | null;
};

/** Kahan summation keeps long lists of decimals accurate. */
function accurateSum(values: number[]): number {
  let sum = 0;
  let compensation = 0;
  for (const value of values) {
    const y = value - compensation;
    const t = sum + y;
    compensation = t - sum - y;
    sum = t;
  }
  return sum;
}

/** Count, sum, mean, median, mode, range, and standard deviation. Null for an empty list. */
export function summarize(numbers: number[]): ListStats | null {
  const count = numbers.length;
  if (count === 0) return null;
  const sum = accurateSum(numbers);
  const mean = sum / count;

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(count / 2);
  const median = count % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;

  // Count repeats on cleaned values so 0.1 + 0.2 and 0.3 are the same value.
  const frequency = new Map<number, number>();
  for (const value of sorted) {
    const key = cleanNumber(value);
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }
  let modeCount = 0;
  for (const n of frequency.values()) modeCount = Math.max(modeCount, n);
  const allEqual = [...frequency.values()].every((n) => n === modeCount);
  const modes = allEqual && frequency.size > 1 ? [] : [...frequency].filter(([, n]) => n === modeCount).map(([v]) => v);

  // Two-pass variance: squared distances from the mean, which avoids the cancellation of
  // the sum-of-squares shortcut.
  const squares = accurateSum(numbers.map((value) => (value - mean) ** 2));
  const min = sorted[0];
  const max = sorted[count - 1];

  return {
    count,
    sum: cleanNumber(sum),
    mean: cleanNumber(mean),
    median: cleanNumber(median),
    modes,
    modeCount,
    min,
    max,
    range: cleanNumber(max - min),
    populationSD: cleanNumber(Math.sqrt(squares / count)),
    sampleSD: count > 1 ? cleanNumber(Math.sqrt(squares / (count - 1))) : null,
  };
}

export type WeightedEntry = { value: number; weight: number };

export type WeightedResult =
  | { ok: true; average: number; totalWeight: number; weightedSum: number }
  | { ok: false; error: string };

/** Σ(value × weight) ÷ Σweight. Weights must be zero or more, with a total above zero. */
export function weightedAverage(entries: WeightedEntry[]): WeightedResult {
  if (entries.length === 0) return { ok: false, error: "Enter at least one value with a weight." };
  if (entries.some((e) => e.weight < 0)) return { ok: false, error: "Weights can't be negative." };
  const totalWeight = accurateSum(entries.map((e) => e.weight));
  if (totalWeight <= 0) return { ok: false, error: "The weights add up to 0, so there is nothing to average." };
  const weightedSum = accurateSum(entries.map((e) => e.value * e.weight));
  return {
    ok: true,
    average: cleanNumber(weightedSum / totalWeight),
    totalWeight: cleanNumber(totalWeight),
    weightedSum: cleanNumber(weightedSum),
  };
}
