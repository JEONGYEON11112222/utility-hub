import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/components/json-ld";
import { crumbLinkClass } from "@/components/link-styles";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { name: string; path: `/${string}` };

type BreadcrumbsProps = {
  /** From the home page down to the current page, which is shown but not linked. */
  items: Crumb[];
  /** Spacing below the trail, which differs between page layouts. */
  className?: string;
};

/** The visible breadcrumb trail plus matching BreadcrumbList structured data, from one list. */
export function Breadcrumbs({ items, className = "mb-6" }: BreadcrumbsProps) {
  const current = items[items.length - 1];
  const parents = items.slice(0, -1);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className={`text-sm text-muted ${className}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {parents.map((crumb) => (
            <Fragment key={crumb.path}>
              <li>
                <Link href={crumb.path} className={crumbLinkClass}>
                  {crumb.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </Fragment>
          ))}
          <li aria-current="page" className="text-foreground">
            {current.name}
          </li>
        </ol>
      </nav>
    </>
  );
}
