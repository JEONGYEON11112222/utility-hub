"use client";

import { useEffect, useReducer, useRef } from "react";
import { cardClass, focusRing } from "@/components/calculators/fields";
import {
  basicReducer,
  initialBasicState,
  type BasicAction,
  type Operator,
} from "@/lib/calculators/basic";

type Key = { label: string; action: BasicAction; name?: string; kind: "digit" | "operator" | "function" | "equals"; wide?: boolean };

const digit = (d: string): Key => ({ label: d, action: { type: "digit", digit: d }, kind: "digit" });
const op = (operator: Operator, label: string, name: string): Key => ({
  label,
  name,
  action: { type: "operator", operator },
  kind: "operator",
});

const KEYS: Key[] = [
  { label: "C", name: "Clear", action: { type: "clear" }, kind: "function" },
  { label: "±", name: "Change sign", action: { type: "toggleSign" }, kind: "function" },
  { label: "⌫", name: "Delete last digit", action: { type: "backspace" }, kind: "function" },
  op("/", "÷", "Divide"),
  digit("7"), digit("8"), digit("9"), op("*", "×", "Multiply"),
  digit("4"), digit("5"), digit("6"), op("-", "−", "Subtract"),
  digit("1"), digit("2"), digit("3"), op("+", "+", "Add"),
  { ...digit("0"), wide: true },
  { label: ".", name: "Decimal point", action: { type: "decimal" }, kind: "digit" },
  { label: "=", name: "Equals", action: { type: "equals" }, kind: "equals" },
];

/** Maps a keyboard key to a calculator action. */
function keyToAction(key: string): BasicAction | null {
  if (/^\d$/.test(key)) return { type: "digit", digit: key };
  switch (key) {
    case ".":
    case ",":
      return { type: "decimal" };
    case "+":
    case "-":
    case "*":
    case "/":
      return { type: "operator", operator: key };
    case "x":
    case "X":
      return { type: "operator", operator: "*" };
    case "Enter":
    case "=":
      return { type: "equals" };
    case "Backspace":
      return { type: "backspace" };
    case "Escape":
    case "Delete":
      return { type: "clear" };
    default:
      return null;
  }
}

const keyStyles: Record<Key["kind"], string> = {
  digit: "bg-surface text-foreground border border-border hover:bg-muted-surface",
  operator: "bg-accent-soft text-accent-strong border border-border hover:brightness-95",
  function: "bg-muted-surface text-foreground border border-border hover:brightness-95",
  equals: "bg-accent text-on-accent hover:bg-accent-strong",
};

export function BasicCalculator() {
  const [state, dispatch] = useReducer(basicReducer, initialBasicState);

  const rootRef = useRef<HTMLDivElement>(null);

  // Keyboard support anywhere on the page, except while typing in a form field. Enter on a
  // focused link or button outside the calculator is left to the browser. Inside the calculator,
  // Enter always means "=", and preventDefault stops it from also clicking the focused key
  // (Space still activates the focused key).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (
        event.key === "Enter" &&
        target?.closest("button, a, summary") &&
        !rootRef.current?.contains(target)
      ) {
        return;
      }
      const action = keyToAction(event.key);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Announce results and errors, not every digit.
  const announcement = state.error
    ? `Error: ${state.error}`
    : state.expression.endsWith("=")
      ? `${state.expression} ${state.display}`
      : "";

  return (
    <div ref={rootRef} className={`${cardClass} max-w-sm`}>
      <div className="rounded-xl bg-muted-surface px-4 py-3 text-right">
        <p className="min-h-6 truncate text-sm text-muted" aria-hidden="true">
          {state.expression || " "}
        </p>
        <output
          aria-label="Display"
          className={`block font-mono text-4xl font-semibold tabular-nums break-all ${
            state.error ? "text-danger" : "text-foreground"
          }`}
        >
          {state.display}
        </output>
        {state.error && <p className="mt-1 text-sm font-medium text-danger">{state.error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label="Calculator keys">
        {KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            aria-label={key.name}
            onClick={() => dispatch(key.action)}
            className={`min-h-14 rounded-xl text-xl font-semibold ${keyStyles[key.kind]} ${
              key.wide ? "col-span-2" : ""
            } ${focusRing}`}
          >
            {key.label}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
