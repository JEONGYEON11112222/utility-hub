import { SalesTaxCalculator } from "@/components/calculators/sales-tax-calculator";
import { CalculatorPage, calculatorPageMetadata } from "@/components/calculators/calculator-page";

export const metadata = calculatorPageMetadata("sales-tax-calculator");

export default function Page() {
  return (
    <CalculatorPage slug="sales-tax-calculator">
      <SalesTaxCalculator />
    </CalculatorPage>
  );
}
