import { cleanNumber } from "./format";
import { MAX_INPUT } from "./parse";

// Numbers may be separated by commas, semicolons, spaces, tabs, or new lines. Because a comma
// separates numbers, thousands separators and decimal commas are not supported here.
const SEPARATORS = /[\s,;]+/;
const PLAIN_NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/** Most numbers accepted in one list, which keeps the page responsive. */
export const MAX_LIST_LENGTH = 10_000;

export type ParsedList = { numbers: number[]; invalid: string[]; tooMany: boolean };

export function parseNumberList(text: string): ParsedList {
  const tokens = text.split(SEPARATORS).filter((token) => token !== "");
  const numbers: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const value = PLAIN_NUMBER.test(token) ? Number(token) : NaN;
    if (Number.isFinite(value) && Math.abs(value) <= MAX_INPUT) numbers.push(value);
    else invalid.push(token);
  }
  return { numbers, invalid, tooMany: numbers.length > MAX_LIST_LENGTH };
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
