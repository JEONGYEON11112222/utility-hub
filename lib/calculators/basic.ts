// Basic calculator as a pure reducer: digits, decimal point, + − × ÷ with standard order of
// operations (× and ÷ before + and −, left to right within each level), sign toggle, backspace,
// clear, and equals. The expression is only evaluated on equals. No eval(); every step is
// explicit arithmetic.

import { cleanNumber, formatCalculatorNumber } from "./format";

export type Operator = "+" | "-" | "*" | "/";

/** A number the user finished entering, followed by the operator typed after it. */
type Entry = { value: string; operator: Operator };

/** A left-hand value waiting for its right-hand operand during evaluation. */
type PendingOperation = { value: number; operator: Operator };

export type BasicState = {
  /** Text in the main display: the number being typed, or the latest result. */
  display: string;
  /** The expression entered so far, oldest first: 2 + 3 × is [2 +, 3 ×]. */
  entries: Entry[];
  /**
   * True when the next digit should replace the display: straight after an operator (the
   * display then repeats the last entry's number) or after a result.
   */
  overwrite: boolean;
  /** History line shown above the display, e.g. "2 + 3 ×" or "2 + 3 × 4 =". */
  expression: string;
  error: string | null;
};

export type BasicAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "toggleSign" }
  | { type: "backspace" }
  | { type: "clear" };

export const initialBasicState: BasicState = {
  display: "0",
  entries: [],
  overwrite: false,
  expression: "",
  error: null,
};

/** Display symbols for operators. */
export const operatorSymbols: Record<Operator, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/** Longest number a user can type (digits only, not counting sign or decimal point). */
const MAX_DIGITS = 15;

type Outcome = { ok: true; value: number } | { ok: false; error: string };

export function applyOperator(left: number, operator: Operator, right: number): Outcome {
  if (operator === "/" && right === 0) return { ok: false, error: "Can't divide by zero" };
  const raw =
    operator === "+" ? left + right : operator === "-" ? left - right : operator === "*" ? left * right : left / right;
  if (!Number.isFinite(raw)) return { ok: false, error: "Result is too large" };
  return { ok: true, value: cleanNumber(raw) };
}

function precedence(operator: Operator): number {
  return operator === "*" || operator === "/" ? 2 : 1;
}

/**
 * Applies pending operations from the newest back, while they bind at least as tightly as
 * `minPrecedence`, using `value` as the right-hand operand of the newest one.
 */
function collapse(
  pending: PendingOperation[],
  value: number,
  minPrecedence: number,
): { ok: true; pending: PendingOperation[]; value: number } | { ok: false; error: string } {
  const rest = [...pending];
  let result = value;
  while (rest.length > 0 && precedence(rest[rest.length - 1].operator) >= minPrecedence) {
    const { value: left, operator } = rest.pop()!;
    const outcome = applyOperator(left, operator, result);
    if (!outcome.ok) return outcome;
    result = outcome.value;
  }
  return { ok: true, pending: rest, value: result };
}

/** Evaluates the entries followed by `last`, multiplying and dividing before adding and subtracting. */
function evaluate(entries: Entry[], last: number): Outcome {
  let pending: PendingOperation[] = [];
  for (const entry of entries) {
    const collapsed = collapse(pending, Number(entry.value), precedence(entry.operator));
    if (!collapsed.ok) return collapsed;
    pending = [...collapsed.pending, { value: collapsed.value, operator: entry.operator }];
  }
  const result = collapse(pending, last, 0);
  return result.ok ? { ok: true, value: result.value } : result;
}

function entryTokens(entries: Entry[]): string[] {
  return entries.flatMap((entry) => [entry.value, operatorSymbols[entry.operator]]);
}

/** Longest history line kept before older tokens are dropped, so the latest input stays visible. */
const MAX_EXPRESSION_LENGTH = 32;

function formatExpression(tokens: string[]): string {
  // Tokens alternate number, operator, so dropping two at a time keeps a number first.
  let start = 0;
  while (start + 2 < tokens.length && tokens.slice(start).join(" ").length > MAX_EXPRESSION_LENGTH) {
    start += 2;
  }
  const text = tokens.slice(start).join(" ");
  return start > 0 ? `… ${text}` : text;
}

function displayValue(display: string): number {
  // The display only ever holds text this reducer produced, so it always parses.
  const value = Number(display);
  return Number.isFinite(value) ? value : 0;
}

function errorState(error: string): BasicState {
  return { ...initialBasicState, display: "Error", error };
}

/**
 * The history line to keep when the display changes. Straight after a result, editing the
 * number starts a new calculation, so "2 + 3 =" no longer describes what is shown.
 */
function keptExpression(state: BasicState): string {
  return state.overwrite && state.entries.length === 0 ? "" : state.expression;
}

export function basicReducer(state: BasicState, action: BasicAction): BasicState {
  // After an error, any input starts fresh; operators and equals are ignored until then.
  if (state.error) {
    if (action.type === "digit" || action.type === "decimal") {
      return basicReducer(initialBasicState, action);
    }
    if (action.type === "clear" || action.type === "backspace") return initialBasicState;
    return state;
  }

  switch (action.type) {
    case "digit": {
      if (!/^\d$/.test(action.digit)) return state;
      if (state.overwrite) {
        return { ...state, display: action.digit, overwrite: false, expression: keptExpression(state) };
      }
      if (state.display === "0") return { ...state, display: action.digit };
      if (state.display === "-0") return { ...state, display: `-${action.digit}` };
      if (state.display.replace(/\D/g, "").length >= MAX_DIGITS) return state;
      return { ...state, display: state.display + action.digit };
    }

    case "decimal": {
      if (state.overwrite) {
        return { ...state, display: "0.", overwrite: false, expression: keptExpression(state) };
      }
      if (state.display.includes(".")) return state;
      return { ...state, display: `${state.display}.` };
    }

    case "operator": {
      let entries: Entry[];
      if (state.entries.length > 0 && state.overwrite) {
        // Pressing another operator straight after one replaces it: 2 + 3 × then + gives 2 + 3 +.
        const last = state.entries[state.entries.length - 1];
        entries = [...state.entries.slice(0, -1), { ...last, operator: action.operator }];
      } else {
        // After a result the entries are empty, so the expression starts from the displayed number.
        const value = formatCalculatorNumber(displayValue(state.display));
        entries = [...state.entries, { value, operator: action.operator }];
      }
      const last = entries[entries.length - 1];
      return {
        display: last.value,
        entries,
        overwrite: true,
        expression: formatExpression(entryTokens(entries)),
        error: null,
      };
    }

    case "equals": {
      if (state.entries.length === 0) return state;
      const right = displayValue(state.display);
      const result = evaluate(state.entries, right);
      if (!result.ok) return errorState(result.error);
      return {
        display: formatCalculatorNumber(result.value),
        entries: [],
        overwrite: true,
        expression: formatExpression([
          ...entryTokens(state.entries),
          formatCalculatorNumber(right),
          "=",
        ]),
        error: null,
      };
    }

    case "toggleSign": {
      if (state.overwrite && state.entries.length > 0) {
        // Straight after an operator the display only repeats the last number, so ± starts the
        // next number as a negative one instead of flipping that copy: 3 × ± 2 is 3 × -2.
        return { ...state, display: "-0", overwrite: false };
      }
      if (state.display === "0" || state.display === "0.") {
        // Lets users start typing a negative number: ± then digits.
        return { ...state, display: `-${state.display}`, overwrite: false, expression: keptExpression(state) };
      }
      const toggled = state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}`;
      return { ...state, display: toggled, expression: keptExpression(state) };
    }

    case "backspace": {
      if (state.overwrite) {
        // A result is not edited digit by digit.
        if (state.entries.length === 0) return state;
        // Straight after an operator: remove it, and the number before it can be edited again.
        const entries = state.entries.slice(0, -1);
        const removed = state.entries[state.entries.length - 1];
        return {
          ...state,
          display: removed.value,
          entries,
          overwrite: false,
          expression: formatExpression(entryTokens(entries)),
        };
      }
      // Exponent notation such as 1.5e+20 is cleared as a whole rather than cut into another number.
      const shortened = state.display.includes("e") ? "" : state.display.slice(0, -1);
      if (shortened !== "" && shortened !== "-") return { ...state, display: shortened };
      // The number is now empty. With an operator before it, go back to the state right after
      // that operator was pressed, so the next Backspace removes the operator.
      if (state.entries.length > 0) {
        return { ...state, display: state.entries[state.entries.length - 1].value, overwrite: true };
      }
      return { ...state, display: "0" };
    }

    case "clear":
      return initialBasicState;
  }
}
