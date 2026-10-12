"use client";

import { useId, useState } from "react";
import { cardClass, focusRing, Results } from "@/components/calculators/fields";
import { MAX_LIST_LENGTH, parseNumberList, summarize } from "@/lib/calculators/average";
import { formatNumber } from "@/lib/calculators/format";

const MAX_LISTED_INVALID = 5;

export function AverageCalculator() {
  const id = useId();
  const [text, setText] = useState("");
  const parsed = parseNumberList(text);
  const stats = parsed.tooMany ? null : summarize(parsed.numbers);
  const invalidCount = parsed.invalid.length;
  const errorId = `${id}-invalid`;
  const hintId = `${id}-hint`;

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
        aria-describedby={invalidCount > 0 ? `${hintId} ${errorId}` : hintId}
        aria-invalid={invalidCount > 0 ? true : undefined}
        className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-base text-foreground placeholder:text-muted/70 aria-invalid:border-danger ${focusRing}`}
      />
      <p id={hintId} className="mt-1 text-xs text-muted">
        Separate numbers with commas, spaces, semicolons, or new lines. Use a period for decimals.
      </p>
      {invalidCount > 0 && (
        <p id={errorId} className="mt-2 text-sm font-medium text-danger">
          {invalidCount === 1 ? "1 entry isn't a number and was left out" : `${invalidCount} entries aren't numbers and were left out`}:{" "}
          {parsed.invalid.slice(0, MAX_LISTED_INVALID).map((token) => `“${token}”`).join(", ")}
          {invalidCount > MAX_LISTED_INVALID ? ", …" : ""}
        </p>
      )}

      <Results
        placeholder="Enter at least one number to see the average."
        error={parsed.tooMany ? `Enter at most ${formatNumber(MAX_LIST_LENGTH)} numbers.` : null}
        items={
          stats
            ? [
                { label: "Average (mean)", value: formatNumber(stats.mean, { maxDecimals: 8 }), emphasis: true },
                { label: "Sum", value: formatNumber(stats.sum, { maxDecimals: 8 }) },
                { label: "Count", value: formatNumber(stats.count) },
              ]
            : null
        }
      />
    </div>
  );
}
