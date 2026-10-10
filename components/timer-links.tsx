import Link from "next/link";
import { timerPagePath, timerPages, type TimerPageSlug } from "@/lib/timer-pages";

type TimerLinksProps = {
  /** Omit the page the visitor is already on. */
  exclude?: TimerPageSlug;
  /** Add a link to the custom-length timer at /timer. */
  includeCustom?: boolean;
};

const pillClass =
  "inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function TimerLinks({ exclude, includeCustom = false }: TimerLinksProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {timerPages
        .filter((page) => page.slug !== exclude)
        .map((page) => (
          <li key={page.slug}>
            <Link href={timerPagePath(page)} className={pillClass}>
              {page.heading}
            </Link>
          </li>
        ))}
      {includeCustom && (
        <li>
          <Link href="/timer" className={pillClass}>
            Custom timer
          </Link>
        </li>
      )}
    </ul>
  );
}
