"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cardClass, focusRing } from "@/components/calculators/fields";
import {
  evaluateExpression,
  MAX_EXPRESSION_LENGTH,
  type AngleMode,
  type EvaluationResult,
} from "@/lib/calculators/expression";
import { formatCalculatorNumber } from "@/lib/calculators/format";

type Key = {
  label: string;
  /** Accessible name when the label alone is unclear. */
  name?: string;
  /** Text inserted at the caret. */
  insert?: string;
  command?: "backspace" | "clear" | "submit";
  kind?: "function" | "digit" | "operator" | "command" | "equals";
};

const KEYS: Key[] = [
  { label: "sin", name: "Sine", insert: "sin(", kind: "function" },
  { label: "cos", name: "Cosine", insert: "cos(", kind: "function" },
  { label: "tan", name: "Tangent", insert: "tan(", kind: "function" },
  { label: "(", name: "Open parenthesis", insert: "(", kind: "function" },
  { label: ")", name: "Close parenthesis", insert: ")", kind: "function" },
  { label: "sin⁻¹", name: "Inverse sine", insert: "asin(", kind: "function" },
  { label: "cos⁻¹", name: "Inverse cosine", insert: "acos(", kind: "function" },
  { label: "tan⁻¹", name: "Inverse tangent", insert: "atan(", kind: "function" },
  { label: "xʸ", name: "Power", insert: "^", kind: "function" },
  { label: "x²", name: "Square", insert: "^2", kind: "function" },
  { label: "√", name: "Square root", insert: "sqrt(", kind: "function" },
  { label: "log", name: "Logarithm base 10", insert: "log(", kind: "function" },
  { label: "ln", name: "Natural logarithm", insert: "ln(", kind: "function" },
  { label: "π", name: "Pi", insert: "pi", kind: "function" },
  { label: "e", name: "Euler's number e", insert: "e", kind: "function" },
  { label: "7", insert: "7", kind: "digit" },
  { label: "8", insert: "8", kind: "digit" },
  { label: "9", insert: "9", kind: "digit" },
  { label: "÷", name: "Divide", insert: "÷", kind: "operator" },
  { label: "⌫", name: "Delete", command: "backspace", kind: "command" },
  { label: "4", insert: "4", kind: "digit" },
  { label: "5", insert: "5", kind: "digit" },
  { label: "6", insert: "6", kind: "digit" },
  { label: "×", name: "Multiply", insert: "×", kind: "operator" },
  { label: "AC", name: "Clear all", command: "clear", kind: "command" },
  { label: "1", insert: "1", kind: "digit" },
  { label: "2", insert: "2", kind: "digit" },
  { label: "3", insert: "3", kind: "digit" },
  { label: "−", name: "Subtract", insert: "−", kind: "operator" },
  { label: "%", name: "Percent", insert: "%", kind: "operator" },
  { label: "0", insert: "0", kind: "digit" },
  { label: ".", name: "Decimal point", insert: ".", kind: "digit" },
  { label: "x⁻¹", name: "Reciprocal (power of minus one)", insert: "^(-1)", kind: "function" },
  { label: "+", name: "Add", insert: "+", kind: "operator" },
  { label: "=", name: "Equals", command: "submit", kind: "equals" },
];

const keyStyles: Record<NonNullable<Key["kind"]>, string> = {
  digit: "bg-surface text-foreground border border-border hover:bg-muted-surface text-lg",
  operator: "bg-accent-soft text-accent-strong border border-border hover:brightness-95 text-lg",
  function: "bg-muted-surface text-foreground border border-border hover:brightness-95 text-sm sm:text-base",
  command: "bg-muted-surface text-foreground border border-border hover:brightness-95 text-base",
  equals: "bg-accent text-on-accent hover:bg-accent-strong text-lg",
};

const ANGLE_MODES: { value: AngleMode; label: string }[] = [
  { value: "deg", label: "Degrees" },
  { value: "rad", label: "Radians" },
];

const TRIG = /\b(a?sin|a?cos|a?tan)\(/;

type Evaluation = { expression: string; angle: AngleMode; result: EvaluationResult };

/** Turns a result back into text the parser accepts, e.g. 1.5e+20 → 1.5×10^(20). */
function resultAsExpression(value: number): string {
  const text = formatCalculatorNumber(value);
  const match = /^(-?[\d.]+)e([+-]\d+)$/.exec(text);
  return match ? `${match[1]}×10^(${Number(match[2])})` : text;
}

export function ScientificCalculator() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const [expression, setExpression] = useState("");
  const [angle, setAngle] = useState<AngleMode>("deg");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  // Restore the caret after a button edits the expression, without moving focus (which would
  // open the on-screen keyboard on phones).
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && caretRef.current !== null) {
      input.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
    }
  }, [expression]);

  function selection(): [number, number] {
    const input = inputRef.current;
    const end = expression.length;
    return [input?.selectionStart ?? end, input?.selectionEnd ?? end];
  }

  function insert(text: string) {
    const [start, end] = selection();
    const next = expression.slice(0, start) + text + expression.slice(end);
    if (next.length > MAX_EXPRESSION_LENGTH) return;
    caretRef.current = start + text.length;
    setExpression(next);
  }

  function backspace() {
    const [start, end] = selection();
    if (start !== end) {
      caretRef.current = start;
      setExpression(expression.slice(0, start) + expression.slice(end));
    } else if (start > 0) {
      caretRef.current = start - 1;
      setExpression(expression.slice(0, start - 1) + expression.slice(start));
    }
  }

  function clear() {
    caretRef.current = 0;
    setExpression("");
    setEvaluation(null);
  }

  function evaluate() {
    setEvaluation({ expression, angle, result: evaluateExpression(expression, angle) });
  }

  function applyAnswer() {
    if (!evaluation?.result.ok) return;
    const text = resultAsExpression(evaluation.result.value);
    caretRef.current = text.length;
    setExpression(text);
  }

  function runKey(key: Key) {
    if (key.insert) insert(key.insert);
    else if (key.command === "backspace") backspace();
    else if (key.command === "clear") clear();
    else if (key.command === "submit") evaluate();
  }

  const angleLabel = (mode: AngleMode) => (mode === "deg" ? "degrees" : "radians");

  return (
    <form
      className={`${cardClass} max-w-xl`}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        evaluate();
      }}
    >
      <label htmlFor={`${id}-expr`} className="mb-1 block text-sm font-medium text-foreground">
        Expression
      </label>
      <input
        ref={inputRef}
        id={`${id}-expr`}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={MAX_EXPRESSION_LENGTH}
        placeholder="e.g. 2 + 3 × 4 or sqrt(16)"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clear();
          }
        }}
        aria-describedby={`${id}-expr-hint`}
        className={`w-full rounded-lg border border-border bg-surface px-3 py-3 font-mono text-xl text-foreground placeholder:text-muted/70 ${focusRing}`}
      />
      <p id={`${id}-expr-hint`} className="mt-1 text-xs text-muted">
        Press Enter or = to calculate, Escape to clear. Supports + − × ÷ ^ ( ) %, sqrt, sin, cos, tan, asin, acos, atan,
        log, ln, pi, and e.
      </p>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-foreground">Angle unit for trigonometry</legend>
        <div className="mt-2 inline-flex rounded-lg border border-border p-1">
          {ANGLE_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium ${
                angle === mode.value ? "bg-accent text-on-accent" : "text-foreground hover:bg-muted-surface"
              }`}
            >
              <input
                type="radio"
                name={`${id}-angle`}
                value={mode.value}
                checked={angle === mode.value}
                onChange={() => setAngle(mode.value)}
                className={`size-4 accent-(--accent) ${focusRing}`}
              />
              {mode.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-4 min-h-20 rounded-xl bg-muted-surface px-4 py-3">
        {evaluation ? (
          <>
            <p className="truncate font-mono text-sm text-muted">
              {evaluation.expression}
              {TRIG.test(evaluation.expression) ? ` (${angleLabel(evaluation.angle)})` : ""}
            </p>
            {evaluation.result.ok ? (
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <output className="font-mono text-3xl font-semibold tabular-nums break-all text-foreground">
                  = {formatCalculatorNumber(evaluation.result.value)}
                </output>
                <button
                  type="button"
                  onClick={applyAnswer}
                  className={`min-h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-surface ${focusRing}`}
                >
                  Use answer
                </button>
              </div>
            ) : (
              <p className="mt-1 font-medium text-danger">{evaluation.result.error}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">The result appears here.</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2" role="group" aria-label="Calculator keys">
        {KEYS.map((key) => (
          <button
            key={key.label}
            type={key.command === "submit" ? "submit" : "button"}
            aria-label={key.name}
            onClick={key.command === "submit" ? undefined : () => runKey(key)}
            className={`min-h-12 rounded-xl font-semibold ${keyStyles[key.kind ?? "digit"]} ${focusRing}`}
          >
            {key.label}
          </button>
        ))}
      </div>
    </form>
  );
}
