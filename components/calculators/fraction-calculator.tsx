"use client";

import { useId, useState } from "react";
import { cardClass, focusRing, Results, type ResultItem } from "@/components/calculators/fields";
import { formatNumber } from "@/lib/calculators/format";
import {
  calculateFraction,
  formatFraction,
  fractionToNumber,
  hasTerminatingDecimal,
  makeFraction,
  readIntegerField,
  toMixedNumber,
  type Fraction,
  type FractionOperator,
  type IntegerField,
} from "@/lib/calculators/fraction";
import type { CalcResult } from "@/lib/calculators/percentage";

const OPERATORS: { value: FractionOperator; label: string }[] = [
  { value: "+", label: "+ Add" },
  { value: "-", label: "− Subtract" },
  { value: "*", label: "× Multiply" },
  { value: "/", label: "÷ Divide" },
];

const inputClass = `w-full rounded-lg border border-border bg-surface px-2 py-2.5 text-center text-lg tabular-nums text-foreground aria-invalid:border-danger ${focusRing}`;

type FractionInputProps = {
  id: string;
  name: string;
  numerator: string;
  denominator: string;
  onNumerator: (value: string) => void;
  onDenominator: (value: string) => void;
  numeratorField: IntegerField;
  denominatorField: IntegerField;
  denominatorZero: boolean;
};

function FractionInput({
  id,
  name,
  numerator,
  denominator,
  onNumerator,
  onDenominator,
  numeratorField,
  denominatorField,
  denominatorZero,
}: FractionInputProps) {
  const numeratorError = numeratorField.status === "invalid" ? numeratorField.error : null;
  const denominatorError =
    denominatorField.status === "invalid" ? denominatorField.error : denominatorZero ? "The denominator can't be zero." : null;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-foreground">{name}</legend>
      <div className="mx-auto flex w-32 flex-col items-stretch gap-1.5">
        <label htmlFor={`${id}-n`} className="sr-only">
          {name} numerator
        </label>
        <input
          id={`${id}-n`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Top"
          value={numerator}
          onChange={(event) => onNumerator(event.target.value)}
          aria-invalid={numeratorError ? true : undefined}
          aria-describedby={numeratorError ? `${id}-n-error` : undefined}
          className={inputClass}
        />
        <div aria-hidden="true" className="h-0.5 rounded bg-foreground" />
        <label htmlFor={`${id}-d`} className="sr-only">
          {name} denominator
        </label>
        <input
          id={`${id}-d`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Bottom"
          value={denominator}
          onChange={(event) => onDenominator(event.target.value)}
          aria-invalid={denominatorError ? true : undefined}
          aria-describedby={denominatorError ? `${id}-d-error` : undefined}
          className={inputClass}
        />
      </div>
      {numeratorError && (
        <p id={`${id}-n-error`} className="mt-2 text-sm font-medium text-danger">
          {numeratorError}
        </p>
      )}
      {denominatorError && (
        <p id={`${id}-d-error`} className="mt-2 text-sm font-medium text-danger">
          {denominatorError}
        </p>
      )}
    </fieldset>
  );
}

function toFraction(n: IntegerField, d: IntegerField): CalcResult<Fraction> | null {
  if (n.status !== "ok" || d.status !== "ok") return null;
  return makeFraction(n.value, d.value);
}

export function FractionCalculator() {
  const id = useId();
  const [a, setA] = useState({ n: "", d: "" });
  const [b, setB] = useState({ n: "", d: "" });
  const [operator, setOperator] = useState<FractionOperator>("+");

  const fields = {
    an: readIntegerField(a.n, "The numerator"),
    ad: readIntegerField(a.d, "The denominator"),
    bn: readIntegerField(b.n, "The numerator"),
    bd: readIntegerField(b.d, "The denominator"),
  };
  const first = toFraction(fields.an, fields.ad);
  const second = toFraction(fields.bn, fields.bd);
  const result = first?.ok && second?.ok ? calculateFraction(first.value, operator, second.value) : null;

  let items: ResultItem[] | null = null;
  if (result?.ok) {
    const mixed = toMixedNumber(result.value);
    const exact = hasTerminatingDecimal(result.value);
    const decimal = formatNumber(fractionToNumber(result.value), { maxDecimals: 10 });
    items = [
      { label: "Result (simplified)", value: formatFraction(result.value), emphasis: true },
      ...(mixed ? [{ label: "Mixed number", value: mixed }] : []),
      { label: exact ? "Decimal" : "Decimal (rounded)", value: exact ? decimal : `≈ ${decimal}` },
    ];
  }

  return (
    <div className={cardClass}>
      <div className="grid items-start gap-6 sm:grid-cols-[1fr_auto_1fr]">
        <FractionInput
          id={`${id}-a`}
          name="First fraction"
          numerator={a.n}
          denominator={a.d}
          onNumerator={(n) => setA((prev) => ({ ...prev, n }))}
          onDenominator={(d) => setA((prev) => ({ ...prev, d }))}
          numeratorField={fields.an}
          denominatorField={fields.ad}
          denominatorZero={first?.ok === false}
        />
        <div className="sm:pt-9">
          <label htmlFor={`${id}-op`} className="mb-1 block text-sm font-medium text-foreground sm:sr-only">
            Operation
          </label>
          <select
            id={`${id}-op`}
            value={operator}
            onChange={(event) => setOperator(event.target.value as FractionOperator)}
            className={`min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-base text-foreground ${focusRing}`}
          >
            {OPERATORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <FractionInput
          id={`${id}-b`}
          name="Second fraction"
          numerator={b.n}
          denominator={b.d}
          onNumerator={(n) => setB((prev) => ({ ...prev, n }))}
          onDenominator={(d) => setB((prev) => ({ ...prev, d }))}
          numeratorField={fields.bn}
          denominatorField={fields.bd}
          denominatorZero={second?.ok === false}
        />
      </div>
      <p className="mt-4 text-xs text-muted">Whole numbers only, up to 12 digits each. Negative numbers are allowed.</p>

      <Results
        placeholder="Fill in both fractions to see the result."
        error={result && !result.ok ? result.error : null}
        items={items}
      />
    </div>
  );
}
