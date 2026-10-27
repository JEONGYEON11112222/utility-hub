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

export type ListStats = { count: number; sum: number; mean: number };

/** Count, sum, and arithmetic mean. Returns null for an empty list. */
export function summarize(numbers: number[]): ListStats | null {
  if (numbers.length === 0) return null;
  // Kahan summation keeps long lists of decimals accurate.
  let sum = 0;
  let compensation = 0;
  for (const value of numbers) {
    const y = value - compensation;
    const t = sum + y;
    compensation = t - sum - y;
    sum = t;
  }
  return {
    count: numbers.length,
    sum: cleanNumber(sum),
    mean: cleanNumber(sum / numbers.length),
  };
}
