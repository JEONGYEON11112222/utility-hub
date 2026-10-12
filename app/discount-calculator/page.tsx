import { DiscountCalculator } from "@/components/calculators/discount-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("discount-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="discount-calculator">
      <DiscountCalculator />
    </CalculatorPage>
  );
}
