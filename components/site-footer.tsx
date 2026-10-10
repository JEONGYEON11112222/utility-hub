import Link from "next/link";
import { siteConfig, toolCategories } from "@/lib/site";
import { timerPagePath, timerPages } from "@/lib/timer-pages";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1.5fr]">
        <div>
          <p className="font-semibold text-foreground">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Simple online tools that run in your browser. No account or download needed.
          </p>
        </div>
        <nav aria-label="Tools">
          <p className="font-semibold text-foreground">Tools</p>
          <ul className="mt-2 space-y-1 text-sm">
            {toolCategories.map((tool) => (
              <li key={tool.name}>
                {tool.href ? (
                  <Link
                    href={tool.href}
                    className="rounded text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {tool.name}
                  </Link>
                ) : (
                  <span className="text-muted">
                    {tool.name} <span className="text-xs">(coming soon)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Timers">
          <p className="font-semibold text-foreground">Timers</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {timerPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={timerPagePath(page)}
                  className="rounded text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {page.heading}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
