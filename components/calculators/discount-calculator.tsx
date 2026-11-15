"use client";

import { useId, useState } from "react";
import { cardClass, fieldError, NumberField, Results, type ResultItem } from "@/components/calculators/fields";
import { formatAmount, formatPercent } from "@/lib/calculators/format";
import { calculateSale, originalPrice } from "@/lib/calculators/money";
import { readField } from "@/lib/calculators/parse";

function SalePriceCard() {
  const id = useId();
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");
  const [extra, setExtra] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const p = readField(price, { label: "The original price", min: 0, unit: "money" });
  const d = readField(percent, { label: "The discount", min: 0, max: 100, unit: "percent" });
  const e = readField(extra, { label: "The extra discount", min: 0, max: 100, unit: "percent" });
  const t = readField(taxRate, { label: "The sales tax rate", min: 0, max: 100, unit: "percent" });

  // The extra discount and tax are optional: an empty field counts as none, an invalid one
  // shows its error and holds back the result.
  const optionalOk = e.status !== "invalid" && t.status !== "invalid";
  const hasExtra = e.status === "ok" && e.value > 0;
  const hasTax = t.status === "ok" && t.value > 0;
  const result =
    p.status === "ok" && d.status === "ok" && optionalOk
      ? calculateSale(p.value, hasExtra ? [d.value, e.value] : [d.value], hasTax ? t.value : 0)
      : null;

  let items: ResultItem[] | null = null;
  if (result && d.status === "ok") {
    items = [
      { label: hasTax ? "Final price with tax" : "Final price", value: formatAmount(result.total), emphasis: true },
      { label: `You save (${formatPercent(result.totalPercentOff)})`, value: formatAmount(result.saved) },
    ];
    if (hasExtra && e.status === "ok") {
      items.push({
        label: `${formatPercent(d.value)} then ${formatPercent(e.value)} off equals`,
        value: `${formatPercent(result.totalPercentOff)} off`,
      });
    }
    if (hasTax && t.status === "ok") {
      items.push(
        { label: "Sale price before tax", value: formatAmount(result.salePrice) },
        { label: `Sales tax (${formatPercent(t.value)})`, value: formatAmount(result.tax) },
      );
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className={cardClass}>
      <h2 id={`${id}-h`} className="text-lg font-semibold text-foreground">
        Sale price after a discount
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-price`} label="Original price" value={price} onChange={setPrice} error={fieldError(p)} placeholder="e.g. 80" />
        <NumberField id={`${id}-percent`} label="Discount (%)" suffix="%" value={percent} onChange={setPercent} error={fieldError(d)} placeholder="e.g. 25" hint="From 0 to 100." />
        <NumberField
          id={`${id}-extra`}
          label="Extra discount (%), optional"
          suffix="%"
          value={extra}
          onChange={setExtra}
          error={fieldError(e)}
          placeholder="e.g. 20"
          hint="Taken off the already reduced price, like an extra 20% off at checkout."
        />
        <NumberField
          id={`${id}-tax`}
          label="Sales tax (%), optional"
          suffix="%"
          value={taxRate}
          onChange={setTaxRate}
          error={fieldError(t)}
          placeholder="e.g. 8.25"
          hint="Added to the sale price. Leave empty if prices already include tax."
        />
      </div>
      <Results placeholder="Enter a price and a discount to see the sale price." items={items} />
    </section>
  );
}

function OriginalPriceCard() {
  const id = useId();
  const [sale, setSale] = useState("");
  const [percent, setPercent] = useState("");
  const s = readField(sale, { label: "The sale price", min: 0, unit: "money" });
  const d = readField(percent, { label: "The discount", min: 0, max: 100, unit: "percent" });
  const result = s.status === "ok" && d.status === "ok" ? originalPrice(s.value, d.value) : null;

  return (
    <section aria-labelledby={`${id}-h`} className={cardClass}>
      <h2 id={`${id}-h`} className="text-lg font-semibold text-foreground">
        Original price before a discount
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-sale`} label="Sale price" value={sale} onChange={setSale} error={fieldError(s)} placeholder="e.g. 56" />
        <NumberField id={`${id}-percent`} label="Discount (%)" suffix="%" value={percent} onChange={setPercent} error={fieldError(d)} placeholder="e.g. 30" hint="The percentage that was taken off." />
      </div>
      <Results
        placeholder="Enter the sale price and the discount to find the original price."
        error={result && !result.ok ? result.error : null}
        items={
          result?.ok
            ? [
                { label: "Original price", value: formatAmount(result.original), emphasis: true },
                { label: "Amount taken off", value: formatAmount(result.saved) },
              ]
            : null
        }
      />
    </section>
  );
}

export function DiscountCalculator() {
  return (
    <div className="space-y-6">
      <SalePriceCard />
      <OriginalPriceCard />
    </div>
  );
}
