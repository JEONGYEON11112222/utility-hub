// Exact fraction arithmetic with BigInt, so results never lose precision or overflow.
// Inputs are whole numbers of at most 12 digits, which keeps results readable.

import type { CalcResult } from "./percentage";

export const MAX_FRACTION_DIGITS = 12;

// BigInt literals (0n) need an ES2020 target; this project compiles to ES2017.
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const FIVE = BigInt(5);

/** A reduced fraction with a positive denominator. */
export type Fraction = { numerator: bigint; denominator: bigint };
export type FractionOperator = "+" | "-" | "*" | "/";

export type IntegerField =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | { status: "ok"; value: bigint };

/** Reads a numerator or denominator field: an optional sign and up to 12 digits. */
export function readIntegerField(text: string, label: string): IntegerField {
  const trimmed = text.trim();
  if (trimmed === "") return { status: "empty" };
  if (!/^[+-]?\d+$/.test(trimmed)) {
    return { status: "invalid", error: `${label} must be a whole number, like 3 or -4.` };
  }
  if (trimmed.replace(/^[+-]/, "").replace(/^0+(?=\d)/, "").length > MAX_FRACTION_DIGITS) {
    return { status: "invalid", error: `${label} can have at most ${MAX_FRACTION_DIGITS} digits.` };
  }
  return { status: "ok", value: BigInt(trimmed) };
}

function abs(value: bigint): bigint {
  return value < ZERO ? -value : value;
}

/** Greatest common divisor (Euclid's algorithm). gcd(0, 0) is 0. */
export function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y !== ZERO) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x;
}

/** Builds a reduced fraction, moving any sign to the numerator. */
export function makeFraction(numerator: bigint, denominator: bigint): CalcResult<Fraction> {
  if (denominator === ZERO) return { ok: false, error: "A denominator can't be zero." };
  if (numerator === ZERO) return { ok: true, value: { numerator: ZERO, denominator: ONE } };
  const divisor = gcd(numerator, denominator);
  let n = numerator / divisor;
  let d = denominator / divisor;
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  return { ok: true, value: { numerator: n, denominator: d } };
}

export function calculateFraction(a: Fraction, operator: FractionOperator, b: Fraction): CalcResult<Fraction> {
  switch (operator) {
    case "+":
      return makeFraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
    case "-":
      return makeFraction(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
    case "*":
      return makeFraction(a.numerator * b.numerator, a.denominator * b.denominator);
    case "/":
      if (b.numerator === ZERO) {
        return { ok: false, error: "Can't divide by zero: the second fraction is equal to 0." };
      }
      return makeFraction(a.numerator * b.denominator, a.denominator * b.numerator);
  }
}

export function formatFraction(fraction: Fraction): string {
  return fraction.denominator === ONE
    ? fraction.numerator.toString()
    : `${fraction.numerator}/${fraction.denominator}`;
}

/** Mixed-number form (e.g. 7/2 → "3 1/2"), or null when the fraction is proper or whole. */
export function toMixedNumber(fraction: Fraction): string | null {
  const { numerator, denominator } = fraction;
  if (denominator === ONE || abs(numerator) < denominator) return null;
  const whole = abs(numerator) / denominator;
  const remainder = abs(numerator) % denominator;
  const sign = numerator < ZERO ? "-" : "";
  return `${sign}${whole} ${remainder}/${denominator}`;
}

/** True when the decimal form ends (the reduced denominator only has factors 2 and 5). */
export function hasTerminatingDecimal(fraction: Fraction): boolean {
  let d = fraction.denominator;
  while (d % TWO === ZERO) d /= TWO;
  while (d % FIVE === ZERO) d /= FIVE;
  return d === ONE;
}

/** Decimal value for display. Exact for terminating decimals within double precision. */
export function fractionToNumber(fraction: Fraction): number {
  return Number(fraction.numerator) / Number(fraction.denominator);
}
