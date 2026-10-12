"use client";

import { useId, useState } from "react";
import { cardClass, fieldError, NumberField, Results } from "@/components/calculators/fields";
import { formatAmount, formatPercent } from "@/lib/calculators/format";
import { calculateDiscount } from "@/lib/calculators/money";
import { readField } from "@/lib/calculators/parse";

export function DiscountCalculator() {
  const id = useId();
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");
  const p = readField(price, { label: "The original price", min: 0 });
  const d = readField(percent, { label: "The discount", min: 0, max: 100 });
  const result = p.status === "ok" && d.status === "ok" ? calculateDiscount(p.value, d.value) : null;

  return (
    <div className={cardClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-price`} label="Original price" value={price} onChange={setPrice} error={fieldError(p)} placeholder="e.g. 80" />
        <NumberField id={`${id}-percent`} label="Discount (%)" suffix="%" value={percent} onChange={setPercent} error={fieldError(d)} placeholder="e.g. 25" hint="From 0 to 100." />
      </div>
      <Results
        placeholder="Enter a price and a discount to see the sale price."
        items={
          result && d.status === "ok"
            ? [
                { label: "Final price", value: formatAmount(result.finalPrice), emphasis: true },
                { label: `You save (${formatPercent(d.value)})`, value: formatAmount(result.discount) },
              ]
            : null
        }
      />
    </div>
  );
}
