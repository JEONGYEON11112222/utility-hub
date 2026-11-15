// Discount (including stacked discounts and working back to an original price), tip, and sales
// tax math. Inputs are validated by the UI with readField(); these
// functions assume valid ranges and return values cleaned of floating-point artifacts.
// Amounts are plain numbers with no currency: the UI shows them with 2 decimals.
// Discount and sales tax results are rounded to the cent here; tip results are not yet.

import { cleanNumber, roundTo } from "./format";

/** Rounds to the cent. Results that are shown together are each derived from rounded parts,
 * so the parts always add up to the shown total (5.00 + 5.01 = 10.01, never 10.02). */
function toCents(value: number): number {
  return roundTo(cleanNumber(value), 2);
}

export type DiscountResult = { discount: number; finalPrice: number };

/** Price after a percentage discount (0–100%), rounded to the cent. */
export function calculateDiscount(price: number, discountPercent: number): DiscountResult {
  const discount = toCents((price * discountPercent) / 100);
  return { discount, finalPrice: cleanNumber(toCents(price) - discount) };
}

export type SaleResult = {
  /** Price after every discount, before tax. */
  salePrice: number;
  /** Original price minus sale price. */
  saved: number;
  /** The single discount that equals all of them combined: 30% then 20% is 44%. */
  totalPercentOff: number;
  tax: number;
  /** Sale price plus tax. Equals salePrice when there is no tax. */
  total: number;
};

/**
 * Applies discounts one after another, each to the price left by the one before (as stores do
 * with an "extra 20% off" at checkout), then adds sales tax to the sale price. Each step is
 * rounded to the cent, so the shown amounts always add up.
 */
export function calculateSale(price: number, discountPercents: number[], taxPercent = 0): SaleResult {
  const original = toCents(price);
  let salePrice = original;
  let remainingShare = 1;
  for (const percent of discountPercents) {
    salePrice = calculateDiscount(salePrice, percent).finalPrice;
    remainingShare *= 1 - percent / 100;
  }
  const { tax, total } = addSalesTax(salePrice, taxPercent);
  return {
    salePrice,
    saved: cleanNumber(original - salePrice),
    totalPercentOff: cleanNumber((1 - remainingShare) * 100),
    tax,
    total,
  };
}

export type OriginalPriceResult =
  | { ok: true; original: number; saved: number }
  | { ok: false; error: string };

/** Works back from a sale price to the price before a percentage discount (0–100%). */
export function originalPrice(salePrice: number, discountPercent: number): OriginalPriceResult {
  if (discountPercent >= 100) {
    return { ok: false, error: "At 100% off every original price ends at 0, so it can't be worked out." };
  }
  const sale = toCents(salePrice);
  const original = toCents(salePrice / (1 - discountPercent / 100));
  return { ok: true, original, saved: cleanNumber(original - sale) };
}

export type TipResult = {
  tip: number;
  total: number;
  tipPerPerson: number;
  totalPerPerson: number;
};

/** Tip on a bill, split evenly between `people` (a whole number of at least 1). */
export function calculateTip(bill: number, tipPercent: number, people: number): TipResult {
  const tip = cleanNumber((bill * tipPercent) / 100);
  const total = cleanNumber(bill + tip);
  return {
    tip,
    total,
    tipPerPerson: cleanNumber(tip / people),
    totalPerPerson: cleanNumber(total / people),
  };
}

/**
 * When a total is split, each share is rounded to the cent, so the shares can add up to a
 * cent or two more or less than the total. This returns that difference (0 when it is exact).
 */
export function splitRoundingDifference(total: number, people: number): number {
  return cleanNumber(roundTo(total / people, 2) * people - roundTo(total, 2));
}

export type SalesTaxResult = { preTax: number; tax: number; total: number };

/** Adds tax at `ratePercent` to a pre-tax price, rounded to the cent. */
export function addSalesTax(preTax: number, ratePercent: number): SalesTaxResult {
  const price = toCents(preTax);
  const tax = toCents((preTax * ratePercent) / 100);
  return { preTax: price, tax, total: cleanNumber(price + tax) };
}

/** Works back from a tax-inclusive total: pre-tax = total ÷ (1 + rate), rounded to the cent. */
export function removeSalesTax(total: number, ratePercent: number): SalesTaxResult {
  const totalCents = toCents(total);
  const preTax = toCents(total / (1 + ratePercent / 100));
  return { preTax, tax: cleanNumber(totalCents - preTax), total: totalCents };
}
