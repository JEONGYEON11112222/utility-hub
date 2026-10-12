import { BasicCalculator } from "@/components/calculators/basic-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("calculator");

export default function Page() {
  return (
    <CalculatorPage slug="calculator">
      <BasicCalculator />
    </CalculatorPage>
  );
}
