// Safe expression evaluator for the scientific calculator. It tokenizes the input and parses
// it with a small recursive-descent parser; nothing is ever passed to eval() or new Function().
//
// Grammar (lowest to highest precedence):
//   expression     = multiplicative { ("+" | "-") multiplicative }
//   multiplicative = unary { ("*" | "/") unary | implicit-multiplication unary }
//   unary          = ("-" | "+") unary | power
//   power          = postfix [ "^" unary ]          (right-associative: 2^3^2 = 2^9)
//   postfix        = primary { "%" }                 (x% means x ÷ 100)
//   primary        = number | constant | function "(" expression ")" | "(" expression ")"
// So -2^2 = -4, 2^-1 = 0.5, 2pi = 2 × π, and 2(3+1) = 8.

import { cleanNumber } from "./format";

export type AngleMode = "deg" | "rad";

export type EvaluationResult = { ok: true; value: number } | { ok: false; error: string };

export const MAX_EXPRESSION_LENGTH = 200;
const MAX_DEPTH = 64;

const FUNCTIONS = ["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "ln", "log"] as const;
type FunctionName = (typeof FUNCTIONS)[number];
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

type Token =
  | { kind: "number"; value: number }
  | { kind: "name"; name: string }
  | { kind: "op"; op: "+" | "-" | "*" | "/" | "^" | "%" }
  | { kind: "lparen" }
  | { kind: "rparen" };

class EvaluationError extends Error {}

const SYMBOL_ALIASES: Record<string, Token> = {
  "+": { kind: "op", op: "+" },
  "-": { kind: "op", op: "-" },
  "−": { kind: "op", op: "-" },
  "*": { kind: "op", op: "*" },
  "×": { kind: "op", op: "*" },
  "·": { kind: "op", op: "*" },
  "/": { kind: "op", op: "/" },
  "÷": { kind: "op", op: "/" },
  "^": { kind: "op", op: "^" },
  "%": { kind: "op", op: "%" },
  "(": { kind: "lparen" },
  ")": { kind: "rparen" },
  "π": { kind: "name", name: "pi" },
  "√": { kind: "name", name: "sqrt" },
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (/[\d.]/.test(char)) {
      const match = /^(\d+(\.\d*)?|\.\d+)/.exec(input.slice(i));
      if (!match) throw new EvaluationError(`"${char}" isn't a valid number.`);
      const text = match[0];
      const next = input[i + text.length];
      if (next === "." || (next !== undefined && /\d/.test(next))) {
        throw new EvaluationError(`"${text}${next}…" isn't a valid number.`);
      }
      tokens.push({ kind: "number", value: Number(text) });
      i += text.length;
      continue;
    }
    if (/[a-z]/i.test(char)) {
      const name = /^[a-z]+/i.exec(input.slice(i))![0].toLowerCase();
      if (!(name in CONSTANTS) && !(FUNCTIONS as readonly string[]).includes(name)) {
        throw new EvaluationError(`"${name}" isn't a supported function or constant.`);
      }
      tokens.push({ kind: "name", name });
      i += name.length;
      continue;
    }
    if (char === "²") {
      tokens.push({ kind: "op", op: "^" }, { kind: "number", value: 2 });
      i++;
      continue;
    }
    const alias = SYMBOL_ALIASES[char];
    if (!alias) throw new EvaluationError(`"${char}" isn't allowed in an expression.`);
    tokens.push(alias);
    i++;
  }
  return tokens;
}

function checked(value: number): number {
  if (Number.isNaN(value)) throw new EvaluationError("The result isn't a real number.");
  if (!Number.isFinite(value)) throw new EvaluationError("The result is too large to show.");
  return value;
}

const DEGREES_TO_RADIANS = Math.PI / 180;
/** Results this close to zero are treated as zero (e.g. sin(π) = 1.2e-16 in floating point). */
const ZERO_SNAP = 1e-12;

function snap(value: number): number {
  return Math.abs(value) < ZERO_SNAP ? 0 : value;
}

function applyFunction(name: FunctionName, x: number, angle: AngleMode): number {
  switch (name) {
    case "sqrt":
      if (x < 0) throw new EvaluationError("The square root of a negative number isn't a real number.");
      return Math.sqrt(x);
    case "ln":
    case "log":
      if (x <= 0) throw new EvaluationError(`${name} is only defined for numbers greater than zero.`);
      return name === "ln" ? Math.log(x) : Math.log10(x);
    case "sin":
    case "cos":
    case "tan": {
      if (angle === "deg") {
        // Reduce first so exact angles stay exact: sin(180°) = 0, tan(45°) = 1, tan(90°) is undefined.
        const degrees = ((x % 360) + 360) % 360;
        if (name === "tan" && degrees % 180 === 90) {
          throw new EvaluationError("tan is undefined at 90° plus any multiple of 180°.");
        }
        if (name === "sin" && degrees % 180 === 0) return 0;
        if (name === "cos" && degrees % 180 === 90) return 0;
        if (name === "tan" && degrees % 180 === 0) return 0;
        x = degrees * DEGREES_TO_RADIANS;
      } else if (name === "tan" && Math.abs(Math.cos(x)) < 1e-15) {
        throw new EvaluationError("tan is undefined at π/2 plus any multiple of π.");
      }
      const fn = name === "sin" ? Math.sin : name === "cos" ? Math.cos : Math.tan;
      return snap(fn(x));
    }
    case "asin":
    case "acos": {
      if (x < -1 || x > 1) throw new EvaluationError(`${name} needs a value between -1 and 1.`);
      const radians = name === "asin" ? Math.asin(x) : Math.acos(x);
      return angle === "deg" ? radians / DEGREES_TO_RADIANS : radians;
    }
    case "atan": {
      const radians = Math.atan(x);
      return angle === "deg" ? radians / DEGREES_TO_RADIANS : radians;
    }
  }
}

function power(base: number, exponent: number): number {
  if (base === 0 && exponent < 0) throw new EvaluationError("Can't divide by zero (0 to a negative power).");
  if (base < 0 && !Number.isInteger(exponent)) {
    throw new EvaluationError("A negative number to a fractional power isn't a real number.");
  }
  return checked(base ** exponent);
}

class Parser {
  private position = 0;
  private depth = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly angle: AngleMode,
  ) {}

  parse(): number {
    const value = this.expression();
    const extra = this.peek();
    if (extra) {
      throw new EvaluationError(
        extra.kind === "rparen" ? "There's a closing parenthesis without a matching opening one." : "Unexpected input after the end of the expression.",
      );
    }
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private isOp(op: string): boolean {
    const token = this.peek();
    return token?.kind === "op" && token.op === op;
  }

  private enter() {
    if (++this.depth > MAX_DEPTH) throw new EvaluationError("The expression is nested too deeply.");
  }

  private expression(): number {
    this.enter();
    let value = this.multiplicative();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.tokens[this.position++] as { op: string }).op;
      const right = this.multiplicative();
      value = checked(op === "+" ? value + right : value - right);
    }
    this.depth--;
    return value;
  }

  private multiplicative(): number {
    let value = this.unary();
    for (;;) {
      const next = this.peek();
      if (this.isOp("*") || this.isOp("/")) {
        const op = (this.tokens[this.position++] as { op: string }).op;
        const right = this.unary();
        if (op === "/" && right === 0) throw new EvaluationError("Can't divide by zero.");
        value = checked(op === "*" ? value * right : value / right);
      } else if (next?.kind === "name" || next?.kind === "lparen") {
        // Implicit multiplication: 2pi, 3(4+1), (1+2)(3+4), 2sqrt(9)
        value = checked(value * this.unary());
      } else if (next?.kind === "number") {
        // "2 3" or "2e3" is ambiguous, so it is rejected instead of silently multiplied.
        const previous = this.tokens[this.position - 1];
        throw new EvaluationError(
          previous?.kind === "name" && previous.name === "e"
            ? "For powers of ten, write 2 × 10^3 instead of 2e3."
            : "Add an operator, such as + or ×, between the two numbers.",
        );
      } else {
        return value;
      }
    }
  }

  private unary(): number {
    this.enter();
    let value: number;
    if (this.isOp("-")) {
      this.position++;
      value = -this.unary();
    } else if (this.isOp("+")) {
      this.position++;
      value = this.unary();
    } else {
      value = this.power();
    }
    this.depth--;
    return value;
  }

  private power(): number {
    const base = this.postfix();
    if (!this.isOp("^")) return base;
    this.position++;
    return power(base, this.unary());
  }

  private postfix(): number {
    let value = this.primary();
    while (this.isOp("%")) {
      this.position++;
      value = value / 100;
    }
    return value;
  }

  private primary(): number {
    const token = this.peek();
    if (!token) throw new EvaluationError("The expression ends too early. Add a number or close it off.");
    this.position++;
    switch (token.kind) {
      case "number":
        return token.value;
      case "name": {
        if (token.name in CONSTANTS) return CONSTANTS[token.name];
        if (this.peek()?.kind !== "lparen") {
          throw new EvaluationError(`Use parentheses after ${token.name}, for example ${token.name}(30).`);
        }
        this.position++;
        const argument = this.expression();
        this.expectClosing();
        return checked(applyFunction(token.name as FunctionName, argument, this.angle));
      }
      case "lparen": {
        const value = this.expression();
        this.expectClosing();
        return value;
      }
      case "rparen":
        throw new EvaluationError("There's an empty pair of parentheses or a misplaced \")\".");
      case "op":
        throw new EvaluationError(`"${token.op}" needs a number before it.`);
    }
  }

  private expectClosing() {
    if (this.peek()?.kind !== "rparen") throw new EvaluationError("A parenthesis is missing a closing \")\".");
    this.position++;
  }
}

/**
 * Evaluates an expression such as "2 + 3 × 4", "sqrt(16)", or "sin(30)". Missing closing
 * parentheses at the end are added automatically, as on most calculators.
 */
export function evaluateExpression(input: string, angle: AngleMode): EvaluationResult {
  if (input.trim() === "") return { ok: false, error: "Enter an expression first." };
  if (input.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, error: `Expressions can be at most ${MAX_EXPRESSION_LENGTH} characters long.` };
  }
  try {
    const tokens = tokenize(input);
    let open = 0;
    for (const token of tokens) {
      if (token.kind === "lparen") open++;
      else if (token.kind === "rparen") open--;
    }
    for (; open > 0; open--) tokens.push({ kind: "rparen" });
    const value = new Parser(tokens, angle).parse();
    return { ok: true, value: cleanNumber(checked(value)) };
  } catch (error) {
    if (error instanceof EvaluationError) return { ok: false, error: error.message };
    throw error;
  }
}
