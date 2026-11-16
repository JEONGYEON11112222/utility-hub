import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";
import { WeightedAverageCalculator } from "@/components/calculators/weighted-average-calculator";

export const metadata = calculatorPageMetadata("weighted-average-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="weighted-average-calculator">
      <WeightedAverageCalculator />
    </CalculatorPage>
  );
}
