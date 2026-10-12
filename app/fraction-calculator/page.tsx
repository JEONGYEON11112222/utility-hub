import { FractionCalculator } from "@/components/calculators/fraction-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("fraction-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="fraction-calculator">
      <FractionCalculator />
    </CalculatorPage>
  );
}
