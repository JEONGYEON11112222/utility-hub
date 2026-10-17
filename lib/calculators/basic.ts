// Basic calculator as a pure reducer: digits, decimal point, + − × ÷ with standard order of
// operations (× and ÷ before + and −, left to right within each level), sign toggle, backspace,
// clear, and equals. No eval(); every step is explicit arithmetic.

import { cleanNumber, formatCalculatorNumber } from "./format";

export type Operator = "+" | "-" | "*" | "/";

/** A left-hand value waiting for its right-hand operand. */
type PendingOperation = { value: number; operator: Operator };

export type BasicState = {
  /** Text in the main display: the number being typed, or the latest (partial) result. */
  display: string;
  /**
   * Operations not yet applied, oldest first. Each entry's operator binds less tightly than the
   * one after it, so there are at most two: e.g. 2 + 3 × is [2 +, 3 ×].
   */
  pending: PendingOperation[];
  /** True when the next digit should replace the display (after an operator or result). */
  overwrite: boolean;
  /** Numbers and operator symbols entered since the last result, e.g. ["2", "+", "3", "×"]. */
  tokens: string[];
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
  pending: [],
  overwrite: false,
  tokens: [],
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
      if (state.overwrite) return { ...state, display: action.digit, overwrite: false };
      if (state.display === "0") return { ...state, display: action.digit };
      if (state.display === "-0") return { ...state, display: `-${action.digit}` };
      if (state.display.replace(/\D/g, "").length >= MAX_DIGITS) return state;
      return { ...state, display: state.display + action.digit };
    }

    case "decimal": {
      if (state.overwrite) return { ...state, display: "0.", overwrite: false };
      if (state.display.includes(".")) return state;
      return { ...state, display: `${state.display}.` };
    }

    case "operator": {
      const symbol = operatorSymbols[action.operator];
      let pending: PendingOperation[];
      let operand: number;
      let tokens: string[];
      if (state.pending.length > 0 && state.overwrite) {
        // Pressing another operator straight after one replaces it. The last pending value is
        // the operand again, so 2 + 3 × then + gives 2 + 3 +.
        const last = state.pending[state.pending.length - 1];
        pending = state.pending.slice(0, -1);
        operand = last.value;
        tokens = [...state.tokens.slice(0, -1), symbol];
      } else {
        // After a result the history starts again from the displayed number.
        operand = displayValue(state.display);
        pending = state.pending;
        tokens = [...(pending.length > 0 ? state.tokens : []), formatCalculatorNumber(operand), symbol];
      }
      // Apply everything that binds at least as tightly as the new operator, left to right.
      const collapsed = collapse(pending, operand, precedence(action.operator));
      if (!collapsed.ok) return errorState(collapsed.error);
      return {
        display: formatCalculatorNumber(collapsed.value),
        pending: [...collapsed.pending, { value: collapsed.value, operator: action.operator }],
        overwrite: true,
        tokens,
        expression: formatExpression(tokens),
        error: null,
      };
    }

    case "equals": {
      if (state.pending.length === 0) return state;
      const right = displayValue(state.display);
      const result = collapse(state.pending, right, 0);
      if (!result.ok) return errorState(result.error);
      return {
        display: formatCalculatorNumber(result.value),
        pending: [],
        overwrite: true,
        tokens: [],
        expression: formatExpression([...state.tokens, formatCalculatorNumber(right), "="]),
        error: null,
      };
    }

    case "toggleSign": {
      if (state.display === "0" || state.display === "0.") {
        // Lets users start typing a negative number: ± then digits.
        return { ...state, display: `-${state.display}`, overwrite: false };
      }
      const toggled = state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}`;
      return { ...state, display: toggled };
    }

    case "backspace": {
      // A result or operator boundary is not edited digit by digit.
      if (state.overwrite) return state;
      const shortened = state.display.slice(0, -1);
      const display = shortened === "" || shortened === "-" ? "0" : shortened;
      return { ...state, display };
    }

    case "clear":
      return initialBasicState;
  }
}
