import type { Metadata } from "next";
import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { TimerLinks } from "@/components/timer-links";
import { pageMetadata } from "@/lib/seo";
import { getTimerPage, timerPagePath, type TimerPageSlug } from "@/lib/timer-pages";

export function timerPageMetadata(slug: TimerPageSlug): Metadata {
  const page = getTimerPage(slug);
  return pageMetadata({
    path: timerPagePath(page),
    title: page.metaTitle,
    description: page.metaDescription,
  });
}

export function DurationTimerPage({ slug }: { slug: TimerPageSlug }) {
  const page = getTimerPage(slug);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-accent">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/timer" className="rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-accent">
              Timer
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {page.heading}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {page.heading}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">{page.intro}</p>
        </div>
        <section aria-label={`${page.heading} countdown`} className="lg:row-span-2">
          <CountdownTimer initialMinutes={page.minutes} />
        </section>

        <div className="space-y-10">
          <section aria-labelledby="uses-heading">
            <h2 id="uses-heading" className="text-xl font-semibold tracking-tight text-foreground">
              {page.usesHeading}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted">
              {page.uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tips-heading">
            <h2 id="tips-heading" className="text-xl font-semibold tracking-tight text-foreground">
              Tips
            </h2>
            <div className="mt-4 space-y-5">
              {page.tips.map((tip) => (
                <div key={tip.heading}>
                  <h3 className="font-semibold text-foreground">{tip.heading}</h3>
                  <p className="mt-1 leading-7 text-muted">{tip.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby="more-timers-heading" className="mt-14">
        <h2 id="more-timers-heading" className="text-xl font-semibold tracking-tight text-foreground">
          Other timer lengths
        </h2>
        <p className="mt-2 text-muted">
          Need a different length? Pick another preset, or use the custom timer to set any
          number of minutes and seconds.
        </p>
        <div className="mt-4">
          <TimerLinks exclude={page.slug} includeCustom />
        </div>
      </section>
    </div>
  );
}
