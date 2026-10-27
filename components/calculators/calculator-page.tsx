import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CalculatorLinks } from "@/components/calculators/calculator-links";
import {
  calculatorPagePath,
  getCalculatorPage,
  type CalculatorSlug,
} from "@/lib/calculator-pages";
import { pageMetadata } from "@/lib/seo";

export function calculatorPageMetadata(slug: CalculatorSlug): Metadata {
  const page = getCalculatorPage(slug);
  return pageMetadata({
    path: calculatorPagePath(page),
    title: page.metaTitle,
    description: page.metaDescription,
  });
}

const crumbLinkClass =
  "rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * Shared layout for every calculator page. The route passes in its own calculator widget as
 * children, so each page only ships the client code for that one calculator.
 */
export function CalculatorPage({ slug, children }: { slug: CalculatorSlug; children: ReactNode }) {
  const page = getCalculatorPage(slug);
  const isHub = slug === "calculator";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted sm:mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className={crumbLinkClass}>
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {!isHub && (
            <>
              <li>
                <Link href="/calculator" className={crumbLinkClass}>
                  Calculators
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="text-foreground">
            {page.name}
          </li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {page.heading}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted sm:mt-4 sm:text-lg sm:leading-8">{page.intro}</p>
      </div>

      <section aria-label={page.name} className="mt-6 max-w-3xl sm:mt-8">
        {children}
      </section>

      <div className="mt-12 max-w-3xl space-y-10">
        <section aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="text-xl font-semibold tracking-tight text-foreground">
            How to use the {page.name.toLowerCase()}
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-muted marker:text-foreground">
            {page.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Worked examples
          </h2>
          <div className="mt-4 space-y-5">
            {page.examples.map((example) => (
              <div key={example.title}>
                <h3 className="font-semibold text-foreground">{example.title}</h3>
                <p className="mt-1 leading-7 text-muted">{example.body}</p>
              </div>
            ))}
          </div>
        </section>

        {page.notes && (
          <section aria-labelledby="notes-heading">
            <h2 id="notes-heading" className="text-xl font-semibold tracking-tight text-foreground">
              Good to know
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted">
              {page.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section aria-labelledby="more-calculators-heading" className="mt-14">
        <h2
          id="more-calculators-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {isHub ? "More calculators" : "Related calculators"}
        </h2>
        <div className="mt-4">
          <CalculatorLinks exclude={slug} first={page.related} />
        </div>
        <p className="mt-4 text-sm text-muted">
          Looking for something else?{" "}
          <Link href="/#tools" className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            See all tools
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
