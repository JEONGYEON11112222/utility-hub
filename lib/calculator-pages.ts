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
  /** Questions people search for, answered in a few sentences. Keep answers checkable. */
  faqs: { question: string; answer: string }[];
  /** Most relevant other calculators, shown first in the related links. */
  related: CalculatorSlug[];
};

export const calculatorPages: CalculatorPage[] = [
  {
    slug: "calculator",
    name: "Basic Calculator",
    heading: "Online Calculator",
    metaTitle: "Free Online Calculator: Add, Subtract, Multiply & Divide",
    metaDescription:
      "A free, simple online calculator. Add, subtract, multiply, and divide with decimals and negative numbers, using the buttons or your keyboard. No sign-up.",
    intro:
      "Add, subtract, multiply, and divide using the buttons below or your keyboard. Decimals and negative numbers are supported.",
    steps: [
      "Enter a number, choose an operator (+, −, ×, or ÷), then enter the next number.",
      "Press = to see the result, or press another operator to keep going. Multiplication (×) and division (÷) are worked out before addition (+) and subtraction (−), and operations at the same level go from left to right.",
      "Use ± to make the current number negative, ⌫ to delete the last digit, and C to start over.",
      "On a keyboard, type digits and + - * /, press Enter or = for the result, Backspace to delete, and Escape to clear.",
    ],
    examples: [
      { title: "Splitting a cost", body: "84 ÷ 4 = 21. Four people sharing an 84 bill each pay 21." },
      {
        title: "Decimals",
        body: "12.5 × 4 = 50, and 19.99 + 5.01 = 25. Results skip the tiny rounding errors computers can produce, so 0.1 + 0.2 shows 0.3.",
      },
      {
        title: "Chained operations",
        body: "2 + 3 × 4 = 14, because multiplication comes before addition: 3 × 4 = 12, then 2 + 12 = 14. For calculations with parentheses, such as (2 + 3) × 4, use the scientific calculator.",
      },
      { title: "Working with negatives", body: "5 − 8 = −3, and −3 × −2 = 6." },
    ],
    notes: [
      "Results are rounded to 12 significant digits, and very large or very small results use exponent notation, such as 1.5e+20.",
      "Dividing by zero shows an error. Enter a new number or press C to continue.",
    ],
    faqs: [
      {
        question: "Can I use the calculator with my keyboard?",
        answer:
          "Yes. Type digits and + - * / (or x for multiply), press Enter or = for the result, Backspace to delete the last digit, and Escape to clear. It works anywhere on the page without clicking the calculator first.",
      },
      {
        question: "Does the calculator follow the order of operations?",
        answer:
          "Yes. Multiplication and division are worked out before addition and subtraction, so 2 + 3 × 4 = 14, not 20. For calculations with parentheses, such as (2 + 3) × 4, use the scientific calculator.",
      },
      {
        question: "How do I enter a negative number?",
        answer:
          "Press ± before or after typing the number. For example, 5 ± × 2 = gives −10, and 3 × ± 2 = gives −6.",
      },
      {
        question: "Why does 0.1 + 0.2 show 0.3 here but 0.30000000000000004 elsewhere?",
        answer:
          "Computers store decimals in binary, which adds tiny errors. This calculator rounds results to 12 significant digits, which removes those errors without changing real answers.",
      },
    ],
    related: ["scientific-calculator", "percentage-calculator", "fraction-calculator"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    heading: "Percentage Calculator",
    metaTitle: "Percentage Calculator: % of a Number, % Change & More",
    metaDescription:
      "Find X% of a number, what percent one number is of another, and percentage increase or decrease. 15% of 80 is 12. Instant answers, with formulas.",
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
    faqs: [
      {
        question: "How do I calculate a percentage of a number?",
        answer:
          "Divide the percentage by 100 and multiply by the number. 20% of 150 is 0.20 × 150 = 30.",
      },
      {
        question: "How do I find what percentage one number is of another?",
        answer:
          "Divide the part by the whole and multiply by 100. 45 out of 60 is 45 ÷ 60 × 100 = 75%.",
      },
      {
        question: "How do I calculate a percentage increase or decrease?",
        answer:
          "Subtract the original value from the new value, divide by the original value, and multiply by 100. Going from 40 to 50 is (50 − 40) ÷ 40 × 100 = a 25% increase. A negative answer is a decrease.",
      },
      {
        question: "What is the difference between a percentage change and percentage points?",
        answer:
          "Percentage points measure the gap between two percentages, while percentage change compares it to the starting value. A rate going from 10% to 12% rises by 2 percentage points, which is a 20% increase.",
      },
    ],
    related: ["discount-calculator", "sales-tax-calculator", "tip-calculator"],
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    heading: "Discount Calculator",
    metaTitle: "Discount Calculator: Price After % Off & Amount Saved",
    metaDescription:
      "How much is 25% off $80? See the sale price ($60.00) and how much you save ($20.00) instantly. Works with any currency, plus tips for stacked discounts.",
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
      "Amounts are rounded to the cent, and the final price is the original price minus the rounded saving, so the two always add up. Stores may round differently, and sales tax is not included.",
      "You can type prices with a $, £, or € sign and the discount with a % sign.",
    ],
    faqs: [
      {
        question: "How do I calculate a discount?",
        answer:
          "Multiply the price by the discount percentage and divide by 100 to get the amount saved, then subtract it from the price. 25% off 80 saves 80 × 25 ÷ 100 = 20, so you pay 60.",
      },
      {
        question: "How much is 20% off $50?",
        answer: "20% of $50 is $10, so the sale price is $40.",
      },
      {
        question: "How can I work out a discount in my head?",
        answer:
          "Find 10% by moving the decimal point one place left, then scale it. For 30% off $70: 10% is $7, so 30% is $21, and you pay $49. For 15%, add 10% and half of that again.",
      },
      {
        question: "How do I find the discount percentage from the original and sale prices?",
        answer:
          "Subtract the sale price from the original price, divide by the original price, and multiply by 100. A price cut from 80 to 60 is (80 − 60) ÷ 80 × 100 = 25% off.",
      },
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "tip-calculator"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    heading: "Tip Calculator",
    metaTitle: "Tip Calculator: Tip, Total & Split the Bill Per Person",
    metaDescription:
      "Work out a 15%, 18%, or 20% tip, the total, and each person's share when you split the bill. Free, instant, and works with any currency.",
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
    faqs: [
      {
        question: "How do I calculate a 20% tip?",
        answer:
          "Multiply the bill by 0.20. A quick way in your head is to find 10% by moving the decimal point one place left, then double it: on a $45 bill, 10% is $4.50, so 20% is $9.",
      },
      {
        question: "How much should I tip?",
        answer:
          "It depends on the country and the service. In the US, 15% to 20% is common for table service. In the UK and Australia, tipping is smaller and often optional, and some UK restaurants add a service charge to the bill, so check before adding more.",
      },
      {
        question: "Should I tip on the amount before or after tax?",
        answer:
          "Either is common. Tipping on the pre-tax amount gives a slightly smaller tip. This calculator uses whatever amount you enter, so enter the pre-tax subtotal if you prefer that.",
      },
      {
        question: "How do I split a bill evenly?",
        answer:
          "Divide the total, including the tip, by the number of people. When the total doesn't divide evenly into cents, the shares can be a cent short, so one person adds the difference. The calculator tells you when that happens.",
      },
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "calculator"],
  },
  {
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    heading: "Sales Tax Calculator",
    metaTitle: "Sales Tax Calculator: Add or Remove Tax from a Price",
    metaDescription:
      "Add sales tax to a price or remove it from a total: $100 plus 8.25% tax is $108.25. Also shows how to calculate sales tax by hand and find the rate.",
    intro:
      "Add tax to a pre-tax price, or work backwards from a total that already includes tax. You enter the rate yourself, because sales tax, VAT, and GST rates depend on where you are and what you are buying.",
    steps: [
      "Choose whether you want to add tax to a price or remove it from a total.",
      "Enter the amount and the tax rate as a percentage.",
      "Read the tax amount, the price before tax, and the total.",
    ],
    examples: [
      { title: "Adding tax", body: "100 at a tax rate of 8.25% has 8.25 of tax, for a total of 108.25." },
      {
        title: "How to add sales tax to a price by hand",
        body: "Turn the rate into a decimal (8.25% is 0.0825) and multiply it by the price to get the tax: 105 × 0.0825 = 8.66. Add that to the price for the total: 105 + 8.66 = 113.66. In one step, multiply by 1 plus the rate: 105 × 1.0825 = 113.66.",
      },
      { title: "Removing tax", body: "A 115 total that includes 15% tax was 100 before tax, with 15 of tax." },
      {
        title: "Finding the tax rate from a receipt",
        body: "Divide the tax by the price before tax and multiply by 100. A receipt showing 4.50 of tax on a 60.00 purchase has a rate of 4.50 ÷ 60 × 100 = 7.5%.",
      },
      {
        title: "Why you can't just subtract the rate",
        body: "Taking 15% off 115 gives 97.75, not 100, because the tax was 15% of the pre-tax price, not of the total. Removing tax divides by 1.15 instead.",
      },
    ],
    notes: [
      "This calculator does not know your local tax rate and is not tax advice. Check the rate with your local tax authority or on your receipt.",
      "In the US, sales tax is set by states, counties, and cities, so the combined rate depends on where you buy. Prices are usually shown before tax.",
      "Outside the US, prices usually already include tax, so use Remove tax to see the pre-tax amount. The standard rates are 20% VAT in the UK and 10% GST in Australia. Canada adds 5% GST, plus provincial sales tax or a combined HST in most provinces.",
      "Amounts are rounded to the cent, and the parts always add up to the total. Businesses may round tax line by line, so a receipt can differ by a cent. You can type amounts with a $, £, or € sign and the rate with a % sign.",
    ],
    faqs: [
      {
        question: "How do you add sales tax to a price?",
        answer:
          "Multiply the price by 1 plus the tax rate as a decimal. With a 7% rate, $50 × 1.07 = $53.50, which is $3.50 of tax.",
      },
      {
        question: "How do I find the price before tax?",
        answer:
          "Divide the total by 1 plus the tax rate as a decimal. A $108.25 total with 8.25% tax was $108.25 ÷ 1.0825 = $100 before tax.",
      },
      {
        question: "Why is my receipt a cent different from the calculator?",
        answer:
          "Stores often work out tax on each item and round each one, while this calculator taxes the total once. The rounding can differ by a cent or two.",
      },
      {
        question: "Is sales tax the same as VAT or GST?",
        answer:
          "They are all taxes on purchases. US sales tax is usually added at the register, while VAT and GST are usually already included in the shelf price. To see the tax inside a VAT- or GST-inclusive price, use Remove tax from a total.",
      },
    ],
    related: ["discount-calculator", "percentage-calculator", "tip-calculator"],
  },
  {
    slug: "average-calculator",
    name: "Average Calculator",
    heading: "Average Calculator",
    metaTitle: "Average Calculator: Find the Mean of a List of Numbers",
    metaDescription:
      "Paste a list of numbers to get the average (mean), sum, and count instantly. Works with a column copied from Excel or Google Sheets, or numbers in a row.",
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
      "Thousands separators work when numbers are separated by spaces, new lines, or a comma and a space: 1,500, 2,000 averages to 1,750. If you use commas with no spaces, every comma separates numbers, so 1,500,2,000 is read as 1, 500, 2, and 0. Use a period for decimals.",
      "This is the arithmetic mean. It does not calculate the median, mode, or a weighted average.",
    ],
    faqs: [
      {
        question: "How do you calculate an average?",
        answer: "Add up all the numbers and divide by how many there are. For 4, 8, and 9: 4 + 8 + 9 = 21, and 21 ÷ 3 = 7.",
      },
      {
        question: "What is the difference between the mean, median, and mode?",
        answer:
          "The mean is the sum divided by the count. The median is the middle value once the numbers are sorted, and the mode is the value that appears most often. For 2, 3, 3, and 8, the mean is 4, the median is 3, and the mode is 3. This calculator gives the mean.",
      },
      {
        question: "Can I paste numbers from Excel or Google Sheets?",
        answer:
          "Yes. Copy a column or row of cells and paste it into the box. Each cell becomes one number, and thousands separators such as 1,500 are understood when the numbers are on separate lines.",
      },
      {
        question: "How do I average percentages or grades?",
        answer:
          "Enter the values without the % sign, for example 85, 92, 78. This gives a simple average, where every value counts equally. If some grades count more than others, you need a weighted average instead.",
      },
    ],
    related: ["percentage-calculator", "calculator", "scientific-calculator"],
  },
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    heading: "Fraction Calculator",
    metaTitle: "Fraction Calculator: Simplified Answers & Mixed Numbers",
    metaDescription:
      "Add, subtract, multiply, and divide fractions and get an exact answer in lowest terms, plus the mixed number and decimal. For example, 1/2 + 1/3 = 5/6.",
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
    faqs: [
      {
        question: "How do I convert a fraction to a decimal?",
        answer:
          "Divide the numerator by the denominator: 3/8 = 3 ÷ 8 = 0.375. In this calculator, enter the fraction, choose ×, and multiply by 1/1 to see its decimal value.",
      },
      {
        question: "How do I simplify a fraction?",
        answer:
          "Divide the top and bottom by their greatest common factor. For 18/24, the greatest common factor is 6, so it simplifies to 3/4. Multiplying a fraction by 1/1 here shows it in lowest terms.",
      },
      {
        question: "How do I add fractions with different denominators?",
        answer:
          "Rewrite both fractions with a common denominator, then add the numerators. For 1/4 + 1/6, use 12: 3/12 + 2/12 = 5/12.",
      },
      {
        question: "How do I enter a mixed number like 2 1/3?",
        answer:
          "Convert it to an improper fraction first: multiply the whole number by the denominator and add the numerator. 2 1/3 becomes (2 × 3 + 1)/3 = 7/3.",
      },
    ],
    related: ["calculator", "percentage-calculator", "scientific-calculator"],
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    heading: "Scientific Calculator",
    metaTitle: "Scientific Calculator Online: Trig, Logs, Powers & Roots",
    metaDescription:
      "Free online scientific calculator with parentheses, powers, roots, sin, cos, tan, and logs, in degrees or radians. Type an expression or tap the buttons.",
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
    faqs: [
      {
        question: "Does the calculator use degrees or radians?",
        answer:
          "Degrees by default. Switch to Radians before using sin, cos, tan, or their inverses if your angle is in radians. In degrees, sin(90) = 1; in radians, sin(pi/2) = 1.",
      },
      {
        question: "How do I type a square root or a power?",
        answer:
          "Use sqrt(...) for a square root, such as sqrt(81) = 9, and ^ for a power, such as 3^4 = 81. A fractional power gives other roots: 27^(1/3) = 3.",
      },
      {
        question: "What is the difference between log and ln?",
        answer:
          "log is the base-10 logarithm, so log(100) = 2. ln is the natural logarithm, with base e (about 2.718), so ln(e) = 1.",
      },
      {
        question: "Why do I get a message instead of an answer for sqrt(-4)?",
        answer:
          "The square root of a negative number is not a real number, and this calculator works with real numbers only. It explains the problem instead of showing NaN.",
      },
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
