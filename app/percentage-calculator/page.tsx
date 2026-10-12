import { PercentageCalculator } from "@/components/calculators/percentage-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("percentage-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="percentage-calculator">
      <PercentageCalculator />
    </CalculatorPage>
  );
}
