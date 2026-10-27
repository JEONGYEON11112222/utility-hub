// Strict parsing for numbers typed into calculator fields. Only plain decimal notation is
// accepted: an optional sign, digits, an optional "." decimal part, and optional "," thousands
// separators in the usual 1,234,567.89 pattern. Anything else is reported, never guessed.

import { formatNumber } from "./format";

const PLAIN_NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
const GROUPED_NUMBER = /^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/;

/** Largest magnitude accepted, so results stay well inside double precision. */
export const MAX_INPUT = 1e15;

/** Parses one number, or returns null if the text is not a valid plain decimal number. */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  if (PLAIN_NUMBER.test(trimmed)) return Number(trimmed);
  if (GROUPED_NUMBER.test(trimmed)) return Number(trimmed.replace(/,/g, ""));
  return null;
}

export type FieldResult =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | { status: "ok"; value: number };

type FieldRules = {
  /** Used in error messages, e.g. "Tip percentage". */
  label: string;
  min?: number;
  max?: number;
  /** Reject a value equal to `min` (for "must be greater than" rules). */
  minExclusive?: boolean;
  integer?: boolean;
  /**
   * Lets people type the symbol they see on a price tag or receipt: "money" accepts a leading
   * $, £, or € (as in $19.99), and "percent" accepts a trailing % (as in 8.25%).
   */
  unit?: "money" | "percent";
};

const CURRENCY_PREFIX = /^([+-]?)\s*[$£€]\s*/;
const PERCENT_SUFFIX = /\s*%$/;

function stripUnit(text: string, unit: FieldRules["unit"]): string {
  const trimmed = text.trim();
  if (unit === "money") return trimmed.replace(CURRENCY_PREFIX, "$1");
  if (unit === "percent") return trimmed.replace(PERCENT_SUFFIX, "");
  return trimmed;
}

function describeLimit(value: number): string {
  return formatNumber(value);
}

/** Validates a field's text against simple range rules and returns a user-facing error. */
export function readField(text: string, rules: FieldRules): FieldResult {
  if (text.trim() === "") return { status: "empty" };
  const { label, min, max, minExclusive = false, integer = false, unit } = rules;
  const value = parseNumber(stripUnit(text, unit));
  if (value === null) {
    return { status: "invalid", error: `${label} must be a number, like 12 or 12.5.` };
  }
  if (Math.abs(value) > MAX_INPUT) {
    return { status: "invalid", error: `${label} is too large.` };
  }
  if (integer && !Number.isInteger(value)) {
    return { status: "invalid", error: `${label} must be a whole number.` };
  }
  if (min !== undefined && (minExclusive ? value <= min : value < min)) {
    return {
      status: "invalid",
      error: minExclusive
        ? `${label} must be greater than ${describeLimit(min)}.`
        : `${label} can't be less than ${describeLimit(min)}.`,
    };
  }
  if (max !== undefined && value > max) {
    return { status: "invalid", error: `${label} can't be more than ${describeLimit(max)}.` };
  }
  return { status: "ok", value };
}
