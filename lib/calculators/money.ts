// Discount, tip, and sales tax math. Inputs are validated by the UI with readField(); these
// functions assume valid ranges and return values cleaned of floating-point artifacts.
// Amounts are plain numbers with no currency: the UI shows them with 2 decimals.

import { cleanNumber, roundTo } from "./format";

export type DiscountResult = { discount: number; finalPrice: number };

/** Price after a percentage discount (0–100%). */
export function calculateDiscount(price: number, discountPercent: number): DiscountResult {
  const discount = cleanNumber((price * discountPercent) / 100);
  return { discount, finalPrice: cleanNumber(price - discount) };
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

/** Adds tax at `ratePercent` to a pre-tax price. */
export function addSalesTax(preTax: number, ratePercent: number): SalesTaxResult {
  const tax = cleanNumber((preTax * ratePercent) / 100);
  return { preTax: cleanNumber(preTax), tax, total: cleanNumber(preTax + tax) };
}

/** Works back from a tax-inclusive total: pre-tax = total ÷ (1 + rate). */
export function removeSalesTax(total: number, ratePercent: number): SalesTaxResult {
  const preTax = cleanNumber(total / (1 + ratePercent / 100));
  return { preTax, tax: cleanNumber(total - preTax), total: cleanNumber(total) };
}
