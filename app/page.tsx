import Link from "next/link";
import { TimerLinks } from "@/components/timer-links";
import { pageMetadata } from "@/lib/seo";
import { toolCategories } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/",
  title: "Utility Hub: Free Online Timer and Everyday Tools",
  description:
    "Free online tools that work right in your browser. Use an accurate countdown timer now, with everyday calculators and unit converters coming soon.",
  absoluteTitle: true,
});

const principles = [
  {
    title: "Works in your browser",
    body: "Tools run on your device. There is nothing to install, and the timer does not send what you enter to a server.",
  },
  {
    title: "No account needed",
    body: "Open a tool and use it straight away. No sign-up, email address, or login.",
  },
  {
    title: "Built for every screen",
    body: "Layouts adapt to phones, tablets, and desktops, and every control can be used with a keyboard or screen reader.",
  },
];

export default function Home() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Simple online tools for everyday tasks
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Utility Hub collects small, focused tools that do one job well. Time a
            workout, a meeting, or a study session with our countdown timer, and look
            out for calculators and unit converters as we add them.
          </p>
          <div className="mt-8">
            <Link
              href="/timer"
              className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 text-base font-semibold text-on-accent hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Open the timer
            </Link>
          </div>
        </div>
      </section>

      <section
        id="tools"
        aria-labelledby="tools-heading"
        className="mx-auto w-full max-w-5xl scroll-mt-6 px-4 py-14 sm:px-6"
      >
        <h2 id="tools-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Tools
        </h2>
        <p className="mt-2 text-muted">
          Choose a category. New tools are added once they are complete and tested.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {toolCategories.map((tool) => (
            <li
              key={tool.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tool.href
                  ? "border-border bg-surface shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-accent hover:shadow-md"
                  : "border-dashed border-border bg-muted-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {tool.href ? (
                    // The stretched link makes the whole card clickable while keeping one link per card.
                    <Link
                      href={tool.href}
                      className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                    >
                      {tool.name}
                    </Link>
                  ) : (
                    tool.name
                  )}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tool.href
                      ? "bg-accent-soft text-accent-strong"
                      : "border border-border text-muted"
                  }`}
                >
                  {tool.href ? "Available" : "Coming soon"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{tool.summary}</p>
              {tool.href && (
                <p aria-hidden="true" className="mt-4 text-sm font-semibold text-accent">
                  Use the {tool.name.toLowerCase()} →
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-foreground">Ready-to-start timers</h3>
          <p className="mt-1 text-sm text-muted">
            Open a timer with the time already set, or use the custom timer for any length.
          </p>
          <div className="mt-4">
            <TimerLinks includeCustom />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="mx-auto w-full max-w-5xl px-4 sm:px-6"
      >
        <h2
          id="principles-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          How Utility Hub works
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {principles.map((item) => (
            <li key={item.title}>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
