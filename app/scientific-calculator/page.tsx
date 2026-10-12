import { ScientificCalculator } from "@/components/calculators/scientific-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("scientific-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="scientific-calculator">
      <ScientificCalculator />
    </CalculatorPage>
  );
}
