// Basic calculator as a pure reducer: digits, decimal point, + − × ÷, chained operations,
// sign toggle, backspace, clear, and equals. No eval(); every step is explicit arithmetic.

import { cleanNumber, formatCalculatorNumber } from "./format";

export type Operator = "+" | "-" | "*" | "/";

export type BasicState = {
  /** Text in the main display: the number being typed, or the latest result. */
  display: string;
  /** Left-hand value waiting for the next operand. */
  stored: number | null;
  operator: Operator | null;
  /** True when the next digit should replace the display (after an operator or result). */
  overwrite: boolean;
  /** Short history line shown above the display, e.g. "12 ×" or "12 × 3 =". */
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
  stored: null,
  operator: null,
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
      const current = displayValue(state.display);
      // Pressing another operator straight after one just replaces it.
      if (state.operator && state.overwrite && state.stored !== null) {
        return {
          ...state,
          operator: action.operator,
          expression: `${formatCalculatorNumber(state.stored)} ${operatorSymbols[action.operator]}`,
        };
      }
      let left = current;
      if (state.operator && state.stored !== null) {
        const result = applyOperator(state.stored, state.operator, current);
        if (!result.ok) return errorState(result.error);
        left = result.value;
      }
      const shown = formatCalculatorNumber(left);
      return {
        display: shown,
        stored: left,
        operator: action.operator,
        overwrite: true,
        expression: `${shown} ${operatorSymbols[action.operator]}`,
        error: null,
      };
    }

    case "equals": {
      if (!state.operator || state.stored === null) return state;
      const right = displayValue(state.display);
      const result = applyOperator(state.stored, state.operator, right);
      if (!result.ok) return errorState(result.error);
      return {
        display: formatCalculatorNumber(result.value),
        stored: null,
        operator: null,
        overwrite: true,
        expression: `${formatCalculatorNumber(state.stored)} ${operatorSymbols[state.operator]} ${formatCalculatorNumber(right)} =`,
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
