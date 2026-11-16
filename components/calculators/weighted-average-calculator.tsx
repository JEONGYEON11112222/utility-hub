"use client";

import { useId, useRef, useState } from "react";
import { cardClass, focusRing, type ResultItem, Results } from "@/components/calculators/fields";
import { summarize, weightedAverage, type WeightedEntry } from "@/lib/calculators/average";
import { formatNumber } from "@/lib/calculators/format";
import { readField } from "@/lib/calculators/parse";

const MAX_ROWS = 50;

type Row = { key: number; value: string; weight: string };

const START_ROWS: Row[] = [
  { key: 1, value: "", weight: "" },
  { key: 2, value: "", weight: "" },
  { key: 3, value: "", weight: "" },
];

const show = (value: number) => formatNumber(value, { maxDecimals: 8 });

export function WeightedAverageCalculator() {
  const id = useId();
  const [rows, setRows] = useState<Row[]>(START_ROWS);
  const [nextKey, setNextKey] = useState(START_ROWS.length + 1);
  // After "Add row", focus moves to the new row's value field as soon as it mounts.
  const focusKeyRef = useRef<number | null>(null);

  const entries: WeightedEntry[] = [];
  const errors: string[] = [];
  rows.forEach((row, index) => {
    const n = index + 1;
    const v = readField(row.value, { label: `Value ${n}`, unit: "percent" });
    const w = readField(row.weight, { label: `Weight ${n}`, min: 0, unit: "percent" });
    if (v.status === "empty" && w.status === "empty") return;
    if (v.status === "invalid") errors.push(v.error);
    if (w.status === "invalid") errors.push(w.error);
    if (v.status === "empty") errors.push(`Row ${n} has a weight but no value.`);
    if (w.status === "empty") errors.push(`Row ${n} has a value but no weight.`);
    if (v.status === "ok" && w.status === "ok") entries.push({ value: v.value, weight: w.value });
  });

  const result = errors.length === 0 && entries.length > 0 ? weightedAverage(entries) : null;
  const simple = summarize(entries.map((e) => e.value));
  let items: ResultItem[] | null = null;
  if (result?.ok && simple) {
    items = [
      { label: "Weighted average", value: show(result.average), emphasis: true },
      { label: "Simple average (equal weights)", value: show(simple.mean) },
      { label: "Total weight", value: show(result.totalWeight) },
      { label: "Sum of value × weight", value: show(result.weightedSum) },
    ];
  }

  function update(key: number, field: "value" | "weight", text: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: text } : row)));
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, { key: nextKey, value: "", weight: "" }]);
    focusKeyRef.current = nextKey;
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  const inputClass = `w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-lg tabular-nums text-foreground placeholder:text-muted/70 ${focusRing}`;

  return (
    <div className={cardClass}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-x-2 gap-y-2 sm:gap-x-3">
        <p aria-hidden="true" className="text-sm font-medium text-foreground">Value (score, grade)</p>
        <p aria-hidden="true" className="text-sm font-medium text-foreground">Weight (%, credits)</p>
        <span aria-hidden="true" />
        {rows.map((row, index) => (
          <div key={row.key} className="contents">
            <div>
              <label htmlFor={`${id}-v${row.key}`} className="sr-only">
                Value {index + 1}
              </label>
              <input
                ref={(el) => {
                  if (el && focusKeyRef.current === row.key) {
                    focusKeyRef.current = null;
                    el.focus();
                  }
                }}
                id={`${id}-v${row.key}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={row.value}
                placeholder={index === 0 ? "e.g. 90" : undefined}
                onChange={(e) => update(row.key, "value", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-w${row.key}`} className="sr-only">
                Weight {index + 1}
              </label>
              <input
                id={`${id}-w${row.key}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={row.weight}
                placeholder={index === 0 ? "e.g. 20" : undefined}
                onChange={(e) => update(row.key, "weight", e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              disabled={rows.length === 1}
              aria-label={`Remove row ${index + 1}`}
              className={`grid size-11 place-items-center rounded-lg border border-border text-muted hover:bg-muted-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_ROWS}
          className={`min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted-surface disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          + Add row
        </button>
        <p className="text-xs text-muted">
          Weights can be percentages, credit hours, or counts. They don&apos;t need to add up to 100.
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm font-medium text-danger">
          {errors.slice(0, 3).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <Results
        placeholder="Enter at least one value and its weight to see the weighted average."
        error={result && !result.ok ? result.error : null}
        items={items}
      />
    </div>
  );
}
