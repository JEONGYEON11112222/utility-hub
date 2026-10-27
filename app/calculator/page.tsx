import Link from "next/link";
import { BasicCalculator } from "@/components/calculators/basic-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("calculator");

export default function Page() {
  return (
    <CalculatorPage slug="calculator">
      <BasicCalculator />
      <p className="mt-4 text-sm text-muted">
        Need parentheses, powers, or square roots?{" "}
        <Link
          href="/scientific-calculator"
          className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Use the scientific calculator
        </Link>
        .
      </p>
    </CalculatorPage>
  );
}
