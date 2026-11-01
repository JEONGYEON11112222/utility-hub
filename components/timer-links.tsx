import Link from "next/link";
import { pillLinkClass } from "@/components/link-styles";
import { timerPagePath, timerPages, type TimerPageSlug } from "@/lib/timer-pages";

type TimerLinksProps = {
  /** Omit the page the visitor is already on. */
  exclude?: TimerPageSlug;
  /** Add a link to the custom-length timer at /timer. */
  includeCustom?: boolean;
};


export function TimerLinks({ exclude, includeCustom = false }: TimerLinksProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {timerPages
        .filter((page) => page.slug !== exclude)
        .map((page) => (
          <li key={page.slug}>
            <Link href={timerPagePath(page)} className={pillLinkClass}>
              {page.heading}
            </Link>
          </li>
        ))}
      {includeCustom && (
        <li>
          <Link href="/timer" className={pillLinkClass}>
            Custom timer
          </Link>
        </li>
      )}
    </ul>
  );
}
