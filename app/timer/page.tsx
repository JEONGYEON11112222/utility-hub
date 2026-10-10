import { CountdownTimer } from "@/components/countdown-timer";
import { TimerLinks } from "@/components/timer-links";
import { pageMetadata } from "@/lib/seo";

const title = "Online Countdown Timer";

export const metadata = pageMetadata({
  path: "/timer",
  title,
  description:
    "Set a countdown in minutes and seconds, then start, pause, resume, or reset it. Stays accurate in background tabs and can play a chime when time is up.",
});

const faqs = [
  {
    question: "Does the timer keep running if I switch tabs?",
    answer:
      "Yes. The timer records the moment your countdown should end and measures the time left against your device's clock, so the time shown is correct whenever you look at it, even after switching tabs. The remaining time also appears in the tab title. Browsers can slow down pages in background tabs, so the alert may occasionally arrive a little late there. For the most dependable alert, keep the timer tab visible.",
  },
  {
    question: "Will I hear an alert when the time is up?",
    answer:
      "If “Play a chime when time is up” is checked, a short chime plays when the countdown reaches zero. Make sure your device is not muted. A completion message also appears on the page. On phones and tablets, the browser may pause the page while the screen is locked, so the chime may not play until you return to it.",
  },
  {
    question: "What is the longest countdown I can set?",
    answer:
      "You can enter up to 999 minutes and 59 seconds, which is just over 16 hours and 39 minutes.",
  },
  {
    question: "Can I use the timer with a keyboard?",
    answer:
      "Yes. Use Tab to move between fields and buttons. Press Enter in the minutes or seconds field to start, and use Space or Enter on the buttons to pause, resume, or reset.",
  },
];

export default function TimerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <header className="lg:pt-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Enter the minutes and seconds you need and press Start. The timer counts
            down to zero and lets you know when time is up. It works in any modern
            browser on your phone or computer, with no sign-up.
          </p>
        </header>
        <section aria-label="Countdown timer" className="lg:row-span-2">
          <CountdownTimer />
        </section>

        <div className="space-y-10">
          <section aria-labelledby="how-to-heading">
            <h2
              id="how-to-heading"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              How to use the timer
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-muted marker:text-foreground">
              <li>Type the minutes and seconds, or choose a quick preset.</li>
              <li>Press Start. The countdown begins immediately.</li>
              <li>Press Pause to stop the clock, then Resume to continue from where you left off.</li>
              <li>Press Reset at any time to go back to the time you entered.</li>
            </ol>
          </section>

          <section aria-labelledby="ideas-heading">
            <h2
              id="ideas-heading"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Ideas for using a countdown timer
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted">
              <li>Focused work blocks, such as 25 minutes of work followed by a 5 minute break.</li>
              <li>Exercise intervals, stretching, and rest periods between sets.</li>
              <li>Cooking and baking steps when your oven timer is already in use.</li>
              <li>Timed tests, presentations, and classroom activities.</li>
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="preset-timers-heading" className="mt-14">
        <h2
          id="preset-timers-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Timers for common lengths
        </h2>
        <p className="mt-2 text-muted">
          Each of these pages opens with the time already set, along with ideas for using
          that length of time.
        </p>
        <div className="mt-4">
          <TimerLinks />
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-14 max-w-3xl">
        <h2 id="faq-heading" className="text-xl font-semibold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-5">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
