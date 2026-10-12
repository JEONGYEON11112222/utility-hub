"use client";

import { useId, useState } from "react";
import { cardClass, fieldError, focusRing, NumberField, Results } from "@/components/calculators/fields";
import { formatAmount } from "@/lib/calculators/format";
import { calculateTip, splitRoundingDifference } from "@/lib/calculators/money";
import { readField } from "@/lib/calculators/parse";

const TIP_PRESETS = [10, 15, 18, 20, 25];

export function TipCalculator() {
  const id = useId();
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState("15");
  const [people, setPeople] = useState("1");
  const b = readField(bill, { label: "The bill", min: 0 });
  const t = readField(tip, { label: "The tip", min: 0, max: 100 });
  const n = readField(people, { label: "The number of people", min: 1, max: 100, integer: true });
  const result =
    b.status === "ok" && t.status === "ok" && n.status === "ok" ? calculateTip(b.value, t.value, n.value) : null;
  const split = n.status === "ok" && n.value > 1;
  const roundingGap = result && split && n.status === "ok" ? splitRoundingDifference(result.total, n.value) : 0;

  return (
    <div className={cardClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-bill`} label="Bill amount" value={bill} onChange={setBill} error={fieldError(b)} placeholder="e.g. 60" />
        <NumberField id={`${id}-people`} label="Number of people" value={people} onChange={setPeople} error={fieldError(n)} hint="A whole number from 1 to 100." />
      </div>

      <div className="mt-4">
        <NumberField id={`${id}-tip`} label="Tip (%)" suffix="%" value={tip} onChange={setTip} error={fieldError(t)} />
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Common tip percentages">
          {TIP_PRESETS.map((preset) => {
            const selected = t.status === "ok" && t.value === preset;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                onClick={() => setTip(String(preset))}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium ${
                  selected ? "border-accent bg-accent text-on-accent" : "border-border text-foreground hover:bg-muted-surface"
                } ${focusRing}`}
              >
                {preset}%
              </button>
            );
          })}
        </div>
      </div>

      <Results
        placeholder="Enter the bill amount to see the tip."
        items={
          result
            ? [
                { label: "Tip", value: formatAmount(result.tip) },
                { label: "Total with tip", value: formatAmount(result.total), emphasis: !split },
                ...(split
                  ? [
                      { label: "Tip per person", value: formatAmount(result.tipPerPerson) },
                      { label: "Total per person", value: formatAmount(result.totalPerPerson), emphasis: true },
                    ]
                  : []),
              ]
            : null
        }
      >
        {roundingGap !== 0 && (
          <p className="mt-3 text-sm text-muted">
            Each share is rounded to the cent, so the shares add up to {formatAmount(Math.abs(roundingGap))}{" "}
            {roundingGap < 0 ? "less" : "more"} than the total.
          </p>
        )}
      </Results>
    </div>
  );
}
