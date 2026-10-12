// Content for the calculator pages. Each route file under app/ picks its entry by slug and
// renders its own calculator component, so a page only loads the code for its calculator.
// Keep each entry's copy specific to that calculator, and keep worked examples accurate.

export type CalculatorSlug =
  | "calculator"
  | "percentage-calculator"
  | "discount-calculator"
  | "tip-calculator"
  | "sales-tax-calculator"
  | "average-calculator"
  | "fraction-calculator"
  | "scientific-calculator";

export type CalculatorPage = {
  slug: CalculatorSlug;
  /** Short name used in links and breadcrumbs. */
  name: string;
  /** Visible H1. */
  heading: string;
  /** Page title before the site name suffix. */
  metaTitle: string;
  metaDescription: string;
  intro: string;
  steps: string[];
  examples: { title: string; body: string }[];
  /** Limits, conventions, and disclaimers worth stating plainly. */
  notes?: string[];
  /** Most relevant other calculators, shown first in the related links. */
  related: CalculatorSlug[];
};

export const calculatorPages: CalculatorPage[] = [
  {
    slug: "calculator",
    name: "Basic Calculator",
    heading: "Basic Calculator",
    metaTitle: "Basic Online Calculator for Everyday Math",
    metaDescription:
      "A free online calculator for everyday arithmetic. Add, subtract, multiply, and divide with decimals and negative numbers, using buttons or your keyboard.",
    intro:
      "A straightforward calculator for everyday sums. Tap the buttons or type on your keyboard, and chain operations together. Results are shown without the long trailing decimals that computers sometimes produce, so 0.1 + 0.2 shows 0.3.",
    steps: [
      "Enter a number, choose an operator (+, −, ×, or ÷), then enter the next number.",
      "Press = to see the result, or press another operator to keep going. Operations are applied in the order you enter them.",
      "Use ± to make the current number negative, ⌫ to delete the last digit, and C to start over.",
      "On a keyboard, type digits and + - * /, press Enter or = for the result, Backspace to delete, and Escape to clear.",
    ],
    examples: [
      { title: "Splitting a cost", body: "84 ÷ 4 = 21. Four people sharing an 84 bill each pay 21." },
      {
        title: "Chained operations",
        body: "2 + 3 × 4 entered in that order gives 20, because each step is applied as you go: 2 + 3 = 5, then 5 × 4 = 20. For standard order of operations (which gives 14), use the scientific calculator.",
      },
      { title: "Working with negatives", body: "5 − 8 = −3, and −3 × −2 = 6." },
    ],
    notes: [
      "Results are rounded to 12 significant digits, and very large or very small results use exponent notation, such as 1.5e+20.",
      "Dividing by zero shows an error. Enter a new number or press C to continue.",
    ],
    related: ["scientific-calculator", "percentage-calculator", "fraction-calculator"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    heading: "Percentage Calculator",
    metaTitle: "Percentage Calculator: Percent Of and % Change",
    metaDescription:
      "Work out X percent of a number, what percentage one number is of another, and the percentage increase or decrease between two values.",
    intro:
      "Three common percentage questions in one place. Fill in any of the calculators below and the answer updates as you type.",
    steps: [
      "Pick the question that matches what you need to know.",
      "Enter the two numbers. Decimals and negative numbers are fine.",
      "Read the result below the fields. Each calculator works on its own.",
    ],
    examples: [
      { title: "Percent of a number", body: "15% of 80 is 12, because 15 ÷ 100 × 80 = 12." },
      { title: "What percentage", body: "30 is 25% of 120, because 30 ÷ 120 × 100 = 25." },
      {
        title: "Percentage change",
        body: "A price going from 50 to 65 is a 30% increase: (65 − 50) ÷ 50 × 100 = 30. Going from 80 to 60 is a 25% decrease.",
      },
    ],
    notes: [
      "Percentage change is (new − original) ÷ |original| × 100. A change from an original value of zero has no percentage, so it is reported as an error.",
    ],
    related: ["discount-calculator", "sales-tax-calculator", "tip-calculator"],
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    heading: "Discount Calculator",
    metaTitle: "Discount Calculator: Sale Price and Amount Saved",
    metaDescription:
      "Find the sale price after a percentage discount and how much you save. Enter the original price and the discount percentage; works with any currency.",
    intro:
      "See what an item costs after a percentage-off sale and how much you save. The calculator works with any currency, since it only uses the numbers you enter.",
    steps: [
      "Enter the original price.",
      "Enter the discount percentage, from 0 to 100.",
      "Read the amount saved and the final price.",
    ],
    examples: [
      { title: "25% off", body: "An item that costs 80 with 25% off saves 20 and costs 60." },
      { title: "Odd prices", body: "19.99 with 15% off saves 3.00 (2.9985 rounded) and costs 16.99." },
      {
        title: "Two discounts in a row",
        body: "20% off and then another 10% off is not 30% off. 100 becomes 80, then 72, which is 28% off in total. Calculate each step separately by using the first final price as the next original price.",
      },
    ],
    notes: [
      "Amounts are rounded to 2 decimal places for display. Stores may round differently, and sales tax is not included.",
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "tip-calculator"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    heading: "Tip Calculator",
    metaTitle: "Tip Calculator: Tip, Total, and Split Per Person",
    metaDescription:
      "Calculate the tip and total for a bill and split it between any number of people. Choose a common tip percentage or enter your own.",
    intro:
      "Work out the tip on a bill, the total to pay, and each person's share when you split it. Tipping customs differ from country to country, so choose the percentage that fits where you are.",
    steps: [
      "Enter the bill amount.",
      "Choose a tip percentage, or type your own.",
      "Enter how many people are splitting the bill. Use 1 if you are paying alone.",
    ],
    examples: [
      { title: "Tip on a bill", body: "An 18% tip on a 60 bill is 10.80, for a total of 70.80." },
      { title: "Splitting three ways", body: "That 70.80 total split between 3 people is 23.60 each, including 3.60 of tip each." },
      {
        title: "Uneven cents",
        body: "A 100 total split 3 ways is 33.33 each, which adds up to 99.99, so one person needs to add the missing cent.",
      },
    ],
    notes: [
      "The tip is calculated on the amount you enter. If you prefer to tip on the pre-tax amount, enter the bill before tax.",
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "calculator"],
  },
  {
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    heading: "Sales Tax Calculator",
    metaTitle: "Sales Tax Calculator: Add or Remove Tax from a Price",
    metaDescription:
      "Add sales tax to a price, or work out the price before tax from a tax-inclusive total. Enter the tax rate that applies to you.",
    intro:
      "Add tax to a pre-tax price, or work backwards from a total that already includes tax. You enter the rate yourself, because sales tax, VAT, and GST rates depend on where you are and what you are buying.",
    steps: [
      "Choose whether you want to add tax to a price or remove it from a total.",
      "Enter the amount and the tax rate as a percentage.",
      "Read the tax amount, the price before tax, and the total.",
    ],
    examples: [
      { title: "Adding tax", body: "100 at a tax rate of 8.25% has 8.25 of tax, for a total of 108.25." },
      { title: "Removing tax", body: "A 115 total that includes 15% tax was 100 before tax, with 15 of tax." },
      {
        title: "Why you can't just subtract the rate",
        body: "Taking 15% off 115 gives 97.75, not 100, because the tax was 15% of the pre-tax price, not of the total. Removing tax divides by 1.15 instead.",
      },
    ],
    notes: [
      "This calculator does not know your local tax rate and is not tax advice. Check the rate with your local tax authority or on your receipt.",
      "Amounts are rounded to 2 decimal places for display; businesses may round tax line by line.",
    ],
    related: ["discount-calculator", "percentage-calculator", "tip-calculator"],
  },
  {
    slug: "average-calculator",
    name: "Average Calculator",
    heading: "Average Calculator",
    metaTitle: "Average Calculator: Mean of a List of Numbers",
    metaDescription:
      "Paste or type a list of numbers to get the count, sum, and average (arithmetic mean). Separate numbers with commas, spaces, or new lines.",
    intro:
      "Find the average of a list of numbers. Paste a column from a spreadsheet or type numbers separated by commas, spaces, or new lines, and the count, sum, and mean update as you type.",
    steps: [
      "Type or paste your numbers into the box.",
      "Separate them with commas, spaces, semicolons, or new lines.",
      "Read the count, sum, and average. Anything that isn't a number is listed so you can fix it.",
    ],
    examples: [
      { title: "Test scores", body: "The average of 72, 85, 90, and 93 is 85: they add up to 340, and 340 ÷ 4 = 85." },
      { title: "Including negatives", body: "The average of -4, 2, and 8 is 2, because the sum is 6 and 6 ÷ 3 = 2." },
    ],
    notes: [
      "Because commas separate numbers, don't use thousands separators: write 1500, not 1,500. Use a period for decimals.",
      "This is the arithmetic mean. It does not calculate the median, mode, or a weighted average.",
    ],
    related: ["percentage-calculator", "calculator", "scientific-calculator"],
  },
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    heading: "Fraction Calculator",
    metaTitle: "Fraction Calculator with Simplified Answers",
    metaDescription:
      "Add, subtract, multiply, and divide two fractions and get an exact, simplified answer, with the mixed number and decimal shown too.",
    intro:
      "Calculate with two fractions and get an exact answer in lowest terms. The result is also shown as a mixed number when it is larger than 1, and as a decimal.",
    steps: [
      "Enter the numerator (top) and denominator (bottom) of the first fraction.",
      "Choose the operation.",
      "Enter the second fraction and read the simplified result.",
    ],
    examples: [
      { title: "Adding", body: "1/2 + 1/3 = 3/6 + 2/6 = 5/6." },
      { title: "Subtracting", body: "3/4 − 5/6 = 9/12 − 10/12 = −1/12." },
      { title: "Dividing", body: "2/3 ÷ 4/9 = 2/3 × 9/4 = 18/12, which simplifies to 3/2, or 1 1/2." },
    ],
    notes: [
      "Numerators and denominators must be whole numbers with up to 12 digits. To enter a mixed number like 2 1/3, convert it first: 2 × 3 + 1 = 7, so enter 7/3.",
      "Results are exact. Decimals that repeat forever, like 1/3, are shown rounded and marked with ≈.",
    ],
    related: ["calculator", "percentage-calculator", "scientific-calculator"],
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    heading: "Scientific Calculator",
    metaTitle: "Scientific Calculator: Powers, Roots, Trig, and Logs",
    metaDescription:
      "An online scientific calculator with powers, square roots, parentheses, percentages, sin, cos, tan, their inverses, and logarithms, in degrees or radians.",
    intro:
      "Type a full expression or build it with the buttons. The calculator follows the standard order of operations, supports parentheses, powers, roots, trigonometry, and logarithms, and explains the problem instead of showing NaN when an input has no real answer.",
    steps: [
      "Type an expression such as 2 + 3 × 4 or sqrt(16), or use the buttons to insert functions and symbols.",
      "Choose Degrees or Radians before using sin, cos, tan, or their inverses.",
      "Press = or Enter to calculate. Missing closing parentheses at the end are added for you.",
    ],
    examples: [
      { title: "Order of operations", body: "2 + 3 × 4 = 14, because multiplication comes before addition. (2 + 3) × 4 = 20." },
      { title: "Powers and roots", body: "2^10 = 1024, sqrt(144) = 12, and 5² = 25. A negative exponent gives a reciprocal: 2^-1 = 0.5." },
      { title: "Trigonometry", body: "In degrees, sin(30) = 0.5 and tan(45) = 1. In radians, sin(pi/2) = 1." },
      { title: "Logarithms", body: "log(1000) = 3 (base 10) and ln(e) = 1 (natural log)." },
    ],
    notes: [
      "Supported: + − × ÷, ^ (powers), parentheses, % (divides by 100), sqrt, sin, cos, tan, asin, acos, atan, log (base 10), ln, and the constants pi and e. Writing 2pi or 3(4+1) multiplies.",
      "Not supported: factorials, complex numbers, exponent notation such as 2e3 (write 2 × 10^3), memory keys, and graphing. Results are rounded to 12 significant digits.",
    ],
    related: ["calculator", "fraction-calculator", "percentage-calculator"],
  },
];

export function getCalculatorPage(slug: CalculatorSlug): CalculatorPage {
  const page = calculatorPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown calculator page: ${slug}`);
  return page;
}

export function calculatorPagePath(page: CalculatorPage): `/${CalculatorSlug}` {
  return `/${page.slug}`;
}
