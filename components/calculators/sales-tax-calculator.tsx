"use client";

import { useId, useState } from "react";
import { cardClass, fieldError, focusRing, NumberField, Results } from "@/components/calculators/fields";
import { formatAmount, formatPercent } from "@/lib/calculators/format";
import { addSalesTax, removeSalesTax } from "@/lib/calculators/money";
import { readField } from "@/lib/calculators/parse";

type Mode = "add" | "remove";

const MODES: { value: Mode; label: string }[] = [
  { value: "add", label: "Add tax to a price" },
  { value: "remove", label: "Remove tax from a total" },
];

export function SalesTaxCalculator() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("add");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const amountLabel = mode === "add" ? "Price before tax" : "Total including tax";
  const a = readField(amount, { label: `The ${amountLabel.toLowerCase()}`, min: 0 });
  const r = readField(rate, { label: "The tax rate", min: 0, max: 100 });
  const result =
    a.status === "ok" && r.status === "ok"
      ? mode === "add"
        ? addSalesTax(a.value, r.value)
        : removeSalesTax(a.value, r.value)
      : null;

  return (
    <div className={cardClass}>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">What do you want to do?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {MODES.map((option) => (
            <label
              key={option.value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 ${
                mode === option.value ? "border-accent bg-accent-soft" : "border-border"
              }`}
            >
              <input
                type="radio"
                name={`${id}-mode`}
                value={option.value}
                checked={mode === option.value}
                onChange={() => setMode(option.value)}
                className={`size-4 accent-(--accent) ${focusRing}`}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-amount`} label={amountLabel} value={amount} onChange={setAmount} error={fieldError(a)} placeholder="e.g. 100" />
        <NumberField id={`${id}-rate`} label="Tax rate (%)" suffix="%" value={rate} onChange={setRate} error={fieldError(r)} placeholder="e.g. 8.25" hint="Use the rate that applies where you are." />
      </div>

      <Results
        placeholder="Enter an amount and a tax rate to see the result."
        items={
          result && r.status === "ok"
            ? [
                { label: "Price before tax", value: formatAmount(result.preTax), emphasis: mode === "remove" },
                { label: `Tax (${formatPercent(r.value)})`, value: formatAmount(result.tax) },
                { label: "Total including tax", value: formatAmount(result.total), emphasis: mode === "add" },
              ]
            : null
        }
      />
    </div>
  );
}
