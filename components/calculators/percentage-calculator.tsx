"use client";

import { useId, useState } from "react";
import { cardClass, fieldError, NumberField, Results } from "@/components/calculators/fields";
import { formatNumber, formatPercent } from "@/lib/calculators/format";
import { readField } from "@/lib/calculators/parse";
import { percentChange, percentOf, whatPercent } from "@/lib/calculators/percentage";

const EMPTY_HINT = "Enter both numbers to see the result.";

function PercentOfCard() {
  const id = useId();
  const [percent, setPercent] = useState("");
  const [total, setTotal] = useState("");
  const p = readField(percent, { label: "The percentage" });
  const t = readField(total, { label: "The number" });
  const result = p.status === "ok" && t.status === "ok" ? percentOf(p.value, t.value) : null;

  return (
    <section aria-labelledby={`${id}-h`} className={cardClass}>
      <h2 id={`${id}-h`} className="text-lg font-semibold text-foreground">
        What is X% of Y?
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-p`} label="Percentage (X %)" suffix="%" value={percent} onChange={setPercent} error={fieldError(p)} allowNegative />
        <NumberField id={`${id}-t`} label="Of the number (Y)" value={total} onChange={setTotal} error={fieldError(t)} allowNegative />
      </div>
      <Results
        placeholder={EMPTY_HINT}
        error={result && !result.ok ? result.error : null}
        items={
          result?.ok && p.status === "ok" && t.status === "ok"
            ? [{ label: `${formatPercent(p.value)} of ${formatNumber(t.value)} is`, value: formatNumber(result.value), emphasis: true }]
            : null
        }
      />
    </section>
  );
}

function WhatPercentCard() {
  const id = useId();
  const [part, setPart] = useState("");
  const [total, setTotal] = useState("");
  const p = readField(part, { label: "The first number" });
  const t = readField(total, { label: "The second number" });
  const result = p.status === "ok" && t.status === "ok" ? whatPercent(p.value, t.value) : null;

  return (
    <section aria-labelledby={`${id}-h`} className={cardClass}>
      <h2 id={`${id}-h`} className="text-lg font-semibold text-foreground">
        X is what percentage of Y?
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-x`} label="Number (X)" value={part} onChange={setPart} error={fieldError(p)} allowNegative />
        <NumberField id={`${id}-y`} label="Of the number (Y)" value={total} onChange={setTotal} error={fieldError(t)} allowNegative />
      </div>
      <Results
        placeholder={EMPTY_HINT}
        error={result && !result.ok ? result.error : null}
        items={
          result?.ok && p.status === "ok" && t.status === "ok"
            ? [{ label: `${formatNumber(p.value)} is this percentage of ${formatNumber(t.value)}`, value: formatPercent(result.value), emphasis: true }]
            : null
        }
      />
    </section>
  );
}

function PercentChangeCard() {
  const id = useId();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const f = readField(from, { label: "The original value" });
  const t = readField(to, { label: "The new value" });
  const result = f.status === "ok" && t.status === "ok" ? percentChange(f.value, t.value) : null;

  return (
    <section aria-labelledby={`${id}-h`} className={cardClass}>
      <h2 id={`${id}-h`} className="text-lg font-semibold text-foreground">
        Percentage increase or decrease
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id={`${id}-from`} label="Original value" value={from} onChange={setFrom} error={fieldError(f)} allowNegative />
        <NumberField id={`${id}-to`} label="New value" value={to} onChange={setTo} error={fieldError(t)} allowNegative />
      </div>
      <Results
        placeholder={EMPTY_HINT}
        error={result && !result.ok ? result.error : null}
        items={
          result?.ok
            ? [
                {
                  label:
                    result.value.direction === "no change"
                      ? "Change"
                      : `Percentage ${result.value.direction}`,
                  value:
                    result.value.direction === "no change"
                      ? "No change (0%)"
                      : formatPercent(Math.abs(result.value.percent)),
                  emphasis: true,
                },
                { label: "Difference (new − original)", value: formatNumber(result.value.difference) },
              ]
            : null
        }
      />
    </section>
  );
}

export function PercentageCalculator() {
  return (
    <div className="space-y-6">
      <PercentOfCard />
      <WhatPercentCard />
      <PercentChangeCard />
    </div>
  );
}
