import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { IntervalTimer } from "@/components/interval-timer";
import { TimerLinks } from "@/components/timer-links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/interval-timer",
  title: "Interval Timer: Free Tabata & HIIT Timer with Beeps",
  description:
    "Set work and rest times and the number of rounds, or pick Tabata (20s on, 10s off, 8 rounds). Beeps at every switch and counts down the last 3 seconds.",
});

const faqs = [
  {
    question: "What is a Tabata workout?",
    answer:
      "Tabata is 8 rounds of 20 seconds of hard work followed by 10 seconds of rest, which takes 4 minutes in total (3 minutes 50 seconds without the final rest, which this timer skips). Press the Tabata preset to set it up, then Start. The timer adds a 10 second get-ready countdown before the first round.",
  },
  {
    question: "Is there a rest after the last round?",
    answer:
      "No. The workout ends when the last work interval ends, so a 30/30 workout of 10 rounds has 10 work intervals and 9 rests. The total shown under the clock already accounts for this.",
  },
  {
    question: "What sounds does the interval timer make?",
    answer:
      "Two high beeps mean work starts, one lower beep means rest starts, and short ticks count down the last 3 seconds of each interval. A chime plays when the workout is complete. Uncheck the sound option to run silently. Make sure your device isn't muted, and keep the page open: phones may pause web pages while the screen is locked.",
  },
  {
    question: "Can I use it without rest, like an EMOM?",
    answer:
      "Yes. Set rest to 0 and the timer runs one work interval after another. The EMOM 10 preset does this with 1 minute intervals for 10 rounds, so you start a new set at the top of every minute.",
  },
  {
    question: "Does it keep time if I switch apps or tabs?",
    answer:
      "The timer measures against your device's clock, so the round and time shown are correct whenever you come back. Browsers can delay sounds in background tabs, so keep the timer visible for the most reliable beeps. While it runs, supported browsers are asked to keep the screen awake.",
  },
];

export default function IntervalTimerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Timer", path: "/timer" },
          { name: "Interval timer", path: "/interval-timer" },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Interval Timer
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            A free HIIT and Tabata timer. Set how long to work, how long to rest, and how many
            rounds, then press Start. It shows the current interval and round in large type,
            beeps when it&apos;s time to switch, and counts you down through the last 3 seconds.
          </p>
        </header>
        <section aria-label="Interval timer" className="lg:row-span-2">
          <IntervalTimer />
        </section>

        <div className="space-y-10">
          <section aria-labelledby="how-to-heading">
            <h2 id="how-to-heading" className="text-xl font-semibold tracking-tight text-foreground">
              How to use the interval timer
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-muted marker:text-foreground">
              <li>Pick a preset, or enter your own work time, rest time, and number of rounds.</li>
              <li>Optionally set a get-ready countdown to get into position before round 1.</li>
              <li>Press Start. Listen for the beeps, or glance at the large Work and Rest label.</li>
              <li>Press Pause any time, then Resume to continue in the same round.</li>
            </ol>
          </section>

          <section aria-labelledby="presets-heading">
            <h2 id="presets-heading" className="text-xl font-semibold tracking-tight text-foreground">
              Common interval workouts
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Interval presets with their total length</caption>
                <thead className="border-b border-border text-foreground">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-semibold">Workout</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Work / rest</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Rounds</th>
                    <th scope="col" className="py-2 font-semibold">Good for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted">
                  <tr>
                    <th scope="row" className="py-2 pr-4 font-medium text-foreground">Tabata</th>
                    <td className="py-2 pr-4">20s / 10s</td>
                    <td className="py-2 pr-4">8</td>
                    <td className="py-2">Short, all-out bursts: sprints, burpees, bike</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 font-medium text-foreground">30/30</th>
                    <td className="py-2 pr-4">30s / 30s</td>
                    <td className="py-2 pr-4">10</td>
                    <td className="py-2">Beginners and steady circuits</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 font-medium text-foreground">40/20</th>
                    <td className="py-2 pr-4">40s / 20s</td>
                    <td className="py-2 pr-4">8</td>
                    <td className="py-2">Bodyweight and kettlebell circuits</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 font-medium text-foreground">45/15</th>
                    <td className="py-2 pr-4">45s / 15s</td>
                    <td className="py-2 pr-4">10</td>
                    <td className="py-2">Longer sets with quick transitions</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-4 font-medium text-foreground">EMOM 10</th>
                    <td className="py-2 pr-4">60s / none</td>
                    <td className="py-2 pr-4">10</td>
                    <td className="py-2">A set at the start of every minute</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Total length = work × rounds + rest × (rounds − 1) + get ready. For example, 40/20
              for 8 rounds with a 10 second get-ready is 320 + 140 + 10 = 470 seconds, or 7:50.
            </p>
          </section>
        </div>
      </div>

      <section aria-labelledby="other-timers-heading" className="mt-14">
        <h2 id="other-timers-heading" className="text-xl font-semibold tracking-tight text-foreground">
          Other timers
        </h2>
        <p className="mt-2 text-muted">
          Need a single countdown instead? Use the custom timer or open one with the time already set.
        </p>
        <div className="mt-4">
          <TimerLinks includeCustom includeInterval={false} />
        </div>
      </section>

      <FaqSection faqs={faqs} className="mt-14 max-w-3xl" />
    </div>
  );
}
