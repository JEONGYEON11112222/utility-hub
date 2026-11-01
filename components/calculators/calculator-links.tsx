import Link from "next/link";
import { pillLinkClass } from "@/components/link-styles";
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


export function CalculatorLinks({ exclude, first = [] }: CalculatorLinksProps) {
  const ordered = [
    ...first.map((slug) => calculatorPages.find((page) => page.slug === slug)!),
    ...calculatorPages.filter((page) => !first.includes(page.slug)),
  ].filter((page) => page.slug !== exclude);

  return (
    <ul className="flex flex-wrap gap-2">
      {ordered.map((page) => (
        <li key={page.slug}>
          <Link href={calculatorPagePath(page)} className={pillLinkClass}>
            {page.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
