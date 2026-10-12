// Shared building blocks for the calculator widgets. They have no state or effects, so they
// render inside whichever client component uses them.

import type { ReactNode } from "react";
import type { FieldResult } from "@/lib/calculators/parse";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const cardClass = "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6";

/** The error to show for a field, or null while it is empty or valid. */
export function fieldError(result: FieldResult): string | null {
  return result.status === "invalid" ? result.error : null;
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  /** Shown inside the field on the right, e.g. "%". Decorative: put the unit in the label too. */
  suffix?: string;
  /**
   * Phone keyboards' decimal pad has no minus key, so fields that accept negative numbers use
   * the standard keyboard instead.
   */
  allowNegative?: boolean;
  placeholder?: string;
};

export function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  suffix,
  allowNegative = false,
  placeholder,
}: NumberFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={allowNegative ? undefined : "decimal"}
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`w-full rounded-lg border border-border bg-surface py-2.5 pl-3 text-lg tabular-nums text-foreground placeholder:text-muted/70 aria-invalid:border-danger ${
            suffix ? "pr-10" : "pr-3"
          } ${focusRing}`}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted"
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export type ResultItem = { label: string; value: string; emphasis?: boolean };

type ResultsProps = {
  /** Results to show, or null when inputs are incomplete or invalid. */
  items: ResultItem[] | null;
  /** Shown when there is nothing to calculate yet. */
  placeholder: string;
  /** A calculation error (not a field error), e.g. dividing by zero. */
  error?: string | null;
  children?: ReactNode;
};

/** Result panel. Polite live region, so screen readers hear updated results. */
export function Results({ items, placeholder, error, children }: ResultsProps) {
  return (
    <div aria-live="polite" className="mt-5 rounded-xl bg-muted-surface p-4">
      {error ? (
        <p className="font-medium text-danger">{error}</p>
      ) : items ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-sm text-muted">{item.label}</dt>
              <dd
                className={`mt-0.5 font-semibold tabular-nums break-words text-foreground ${
                  item.emphasis ? "text-2xl text-accent-strong" : "text-lg"
                }`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted">{placeholder}</p>
      )}
      {children}
    </div>
  );
}
