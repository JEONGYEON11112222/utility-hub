import Link from "next/link";
import {
  calculatorPagePath,
  calculatorPages,
  type CalculatorSlug,
} from "@/lib/calculator-pages";

type CalculatorLinksProps = {
  /** Omit the page the visitor is already on. */
  exclude?: CalculatorSlug;
  /** Show these first, in this order; the rest follow in catalog order. */
  first?: CalculatorSlug[];
};

const pillClass =
  "inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function CalculatorLinks({ exclude, first = [] }: CalculatorLinksProps) {
  const ordered = [
    ...first.map((slug) => calculatorPages.find((page) => page.slug === slug)!),
    ...calculatorPages.filter((page) => !first.includes(page.slug)),
  ].filter((page) => page.slug !== exclude);

  return (
    <ul className="flex flex-wrap gap-2">
      {ordered.map((page) => (
        <li key={page.slug}>
          <Link href={calculatorPagePath(page)} className={pillClass}>
            {page.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
