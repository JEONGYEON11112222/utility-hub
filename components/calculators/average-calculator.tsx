"use client";

import { useId, useState } from "react";
import { cardClass, focusRing, type ResultItem, Results } from "@/components/calculators/fields";
import { type ListStats, MAX_LIST_LENGTH, parseNumberList, summarize } from "@/lib/calculators/average";
import { formatNumber } from "@/lib/calculators/format";
import { ShareLink, useShareHash } from "@/components/share-link";

const MAX_LISTED_INVALID = 5;
const MAX_LISTED_MODES = 5;

const show = (value: number) => formatNumber(value, { maxDecimals: 8 });

function modeText(stats: ListStats): string {
  if (stats.modes.length === 0) {
    return stats.modeCount === 1 ? "None (no value repeats)" : `None (every value appears ${stats.modeCount} times)`;
  }
  const listed = stats.modes.slice(0, MAX_LISTED_MODES).map(show).join(", ");
  const more = stats.modes.length > MAX_LISTED_MODES ? `, … (${stats.modes.length} values)` : "";
  const each = stats.modes.length > 1 ? " each" : "";
  const times = stats.count === 1 ? "" : ` (${stats.modeCount} times${each})`;
  return `${listed}${more}${times}`;
}

function statItems(stats: ListStats): ResultItem[] {
  return [
    { label: "Average (mean)", value: show(stats.mean), emphasis: true },
    { label: "Median", value: show(stats.median) },
    { label: stats.modes.length > 1 ? "Modes" : "Mode", value: modeText(stats) },
    { label: "Range", value: `${show(stats.range)} (${show(stats.min)} to ${show(stats.max)})` },
    {
      label: "Standard deviation (sample)",
      value: stats.sampleSD === null ? "Needs 2 or more numbers" : show(stats.sampleSD),
    },
    { label: "Standard deviation (population)", value: show(stats.populationSD) },
    { label: "Sum", value: show(stats.sum) },
    { label: "Count", value: formatNumber(stats.count) },
  ];
}

export function AverageCalculator() {
  const id = useId();
  const [text, setText] = useState("");
  useShareHash("n", (params) => setText(params.get("n") ?? ""));
  const parsed = parseNumberList(text);
  const stats = parsed.tooMany ? null : summarize(parsed.numbers);
  const invalidCount = parsed.invalid.length;
  const invalidHasComma = parsed.invalid.some((token) => token.includes(","));
  const errorId = `${id}-invalid`;
  const hintId = `${id}-hint`;
  const commaNoteId = `${id}-commas`;
  const describedBy = [
    hintId,
    invalidCount > 0 ? errorId : null,
    parsed.ambiguousCommas ? commaNoteId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <label htmlFor={`${id}-numbers`} className="mb-1 block text-sm font-medium text-foreground">
        Numbers
      </label>
      <textarea
        id={`${id}-numbers`}
        rows={5}
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        placeholder={"e.g. 72, 85, 90, 93"}
        aria-describedby={describedBy}
        aria-invalid={invalidCount > 0 ? true : undefined}
        className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-base text-foreground placeholder:text-muted/70 aria-invalid:border-danger ${focusRing}`}
      />
      <p id={hintId} className="mt-1 text-xs text-muted">
        Separate numbers with commas, spaces, semicolons, or new lines. Use a period for decimals.
        Thousands separators like 1,500 work when numbers are separated by spaces or new lines.
      </p>
      {invalidCount > 0 && (
        <p id={errorId} className="mt-2 text-sm font-medium text-danger">
          {invalidCount === 1 ? "1 entry isn't a number and was left out" : `${invalidCount} entries aren't numbers and were left out`}:{" "}
          {parsed.invalid.slice(0, MAX_LISTED_INVALID).map((token) => `“${token}”`).join(", ")}
          {invalidCount > MAX_LISTED_INVALID ? ", …" : ""}
          {invalidHasComma ? ". Use a period for decimals, and a comma only between thousands, as in 1,500." : ""}
        </p>
      )}
      {parsed.ambiguousCommas && (
        <p id={commaNoteId} className="mt-2 text-sm font-medium text-foreground">
          Every comma was read as a separator, so 1,500 counts as two numbers, 1 and 500. To
          enter numbers with thousands separators, put a space after each separating comma:
          1,500, 2,000.
        </p>
      )}

      <Results
        placeholder="Enter at least one number to see the average."
        error={parsed.tooMany ? `Enter at most ${formatNumber(MAX_LIST_LENGTH)} numbers.` : null}
        items={stats ? statItems(stats) : null}
      />
      {stats && <ShareLink params={{ n: text.trim() }} />}
    </div>
  );
}
