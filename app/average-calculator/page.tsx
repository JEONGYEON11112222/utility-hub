import { AverageCalculator } from "@/components/calculators/average-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("average-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="average-calculator">
      <AverageCalculator />
    </CalculatorPage>
  );
}
