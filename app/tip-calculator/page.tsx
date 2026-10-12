import { TipCalculator } from "@/components/calculators/tip-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("tip-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="tip-calculator">
      <TipCalculator />
    </CalculatorPage>
  );
}
