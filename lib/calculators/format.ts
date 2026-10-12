// Deterministic number formatting shared by every calculator. Output never depends on the
// visitor's locale, so server and client render the same text: "." for decimals and "," for
// thousands, which matches the US, UK, Canada, and Australia.

/** Significant digits kept when cleaning results. Doubles carry about 15-17. */
const SIGNIFICANT_DIGITS = 12;

/**
 * Removes binary floating-point artifacts (0.1 + 0.2 → 0.3) by rounding to 12 significant
 * digits, and turns -0 into 0.
 */
export function cleanNumber(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value === 0 ? 0 : value;
  const cleaned = Number(value.toPrecision(SIGNIFICANT_DIGITS));
  return cleaned === 0 ? 0 : cleaned;
}

function groupThousands(integerDigits: string): string {
  return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Rounds half away from zero to a number of decimal places, avoiding toFixed() binary errors. */
export function roundTo(value: number, decimals: number): number {
  const sign = value < 0 ? -1 : 1;
  const rounded = Math.round(Number(`${Math.abs(value)}e${decimals}`));
  const result = sign * Number(`${rounded}e-${decimals}`);
  return result === 0 ? 0 : result;
}

/** Plain decimal digits for a finite number, without exponent notation. */
function toPlainDigits(value: number, maxDecimals: number): string {
  // toFixed only falls back to exponent notation at 1e21 and above; callers stay below that.
  return roundTo(value, maxDecimals).toFixed(maxDecimals);
}

type FormatOptions = {
  /** Maximum decimal places shown (trailing zeros are removed unless minDecimals asks for them). */
  maxDecimals?: number;
  minDecimals?: number;
  /** Add thousands separators. */
  grouping?: boolean;
};

const EXPONENT_THRESHOLD = 1e15;

/**
 * Formats a number for display in results. Very large or very small magnitudes use
 * exponent notation (1.23e+18) so they never show misleading digits.
 */
export function formatNumber(
  value: number,
  { maxDecimals = 6, minDecimals = 0, grouping = true }: FormatOptions = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const cleaned = cleanNumber(value);
  const abs = Math.abs(cleaned);
  if (abs >= EXPONENT_THRESHOLD || (abs > 0 && abs < 10 ** -maxDecimals && minDecimals === 0)) {
    return formatExponent(cleaned);
  }
  const fixed = toPlainDigits(cleaned, maxDecimals);
  const negative = fixed.startsWith("-");
  const [intPart, fracPart = ""] = (negative ? fixed.slice(1) : fixed).split(".");
  let fraction = fracPart.replace(/0+$/, "");
  if (fraction.length < minDecimals) fraction = fraction.padEnd(minDecimals, "0");
  const integer = grouping ? groupThousands(intPart) : intPart;
  const body = fraction ? `${integer}.${fraction}` : integer;
  // Rounding can turn a tiny negative number into "-0"; show plain zero instead.
  return negative && /[1-9]/.test(body) ? `-${body}` : body;
}

/** Exponent notation with up to 6 significant decimals, e.g. 1.234568e+20. */
export function formatExponent(value: number): string {
  const [mantissa, exponent] = cleanNumber(value).toExponential(6).split("e");
  const trimmed = mantissa.replace(/\.?0+$/, "");
  return `${trimmed}e${exponent}`;
}

/** Money-like amounts: always 2 decimals and thousands separators, with no currency symbol. */
export function formatAmount(value: number): string {
  return formatNumber(value, { maxDecimals: 2, minDecimals: 2 });
}

/** Percentages: up to 4 decimals, e.g. "12.5%". */
export function formatPercent(value: number): string {
  return `${formatNumber(value, { maxDecimals: 4 })}%`;
}

/**
 * Calculator display text: up to 12 significant digits, no thousands separators, exponent
 * notation for very large or very small values.
 */
export function formatCalculatorNumber(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const cleaned = cleanNumber(value);
  const abs = Math.abs(cleaned);
  if (abs !== 0 && (abs >= EXPONENT_THRESHOLD || abs < 1e-9)) return formatExponent(cleaned);
  // String() of a 12-significant-digit number below 1e15 and above 1e-9 has no exponent
  // except for tiny values like 1e-7, which toFixed handles.
  const text = String(cleaned);
  if (!text.includes("e")) return text;
  return cleaned.toFixed(12).replace(/\.?0+$/, "");
}
