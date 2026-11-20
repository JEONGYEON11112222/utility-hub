// Content for the fixed-duration timer landing pages (/5-minute-timer, /10-minute-timer, /25-minute-timer).
// Each route file under app/ picks its entry by slug, so adding a page means adding an
// entry here plus a small route file. Keep each entry's copy specific to its duration.

export type TimerPageSlug =
  | "5-minute-timer"
  | "10-minute-timer"
  | "25-minute-timer";

export type TimerPage = {
  slug: TimerPageSlug;
  minutes: number;
  /** Visible H1 and the short label used in links. */
  heading: string;
  /** Page title before the site name suffix. */
  metaTitle: string;
  metaDescription: string;
  intro: string;
  usesHeading: string;
  uses: string[];
  tips: { heading: string; body: string }[];
};

export const timerPages: TimerPage[] = [
  {
    slug: "5-minute-timer",
    minutes: 5,
    heading: "5 Minute Timer",
    metaTitle: "5 Minute Timer for Breaks and Quick Tasks",
    metaDescription:
      "A free five-minute countdown timer for short breaks, tidy-up sprints, warm-ups, and steeping tea. Start, pause, and reset with one click.",
    intro:
      "Five minutes is enough to finish a small task or take a real break, and short enough that it's easy to commit to. The timer below is set to five minutes and lets you know when the time is up.",
    usesHeading: "Good uses for five minutes",
    uses: [
      "A short break between focused work sessions: stand up, stretch, refill your water.",
      "A tidy-up sprint: clear a desk, a counter, or one drawer before the chime.",
      "A warm-up before exercise, or a short cool-down stretch afterward.",
      "Steeping tea. Brewing times vary by tea, so check the package for the time it suggests.",
    ],
    tips: [
      {
        heading: "Use it to get started",
        body: "If a task feels hard to begin, commit to just five minutes. Once the timer ends you can stop, or carry on with a longer session.",
      },
      {
        heading: "Pair it with a longer timer",
        body: "Five minutes works well as the break after a 25 minute focus session. See the 25 minute timer for that routine.",
      },
    ],
  },
  {
    slug: "10-minute-timer",
    minutes: 10,
    heading: "10 Minute Timer",
    metaTitle: "10 Minute Timer for Meditation, Workouts, and Meetings",
    metaDescription:
      "A free ten-minute countdown timer for meditation, short workouts, reading sessions, and stand-up meetings, with a chime when time is up.",
    intro:
      "Ten minutes is long enough to get something meaningful done and short enough to fit into a busy day. This timer is set to ten minutes, keeps counting correctly if you switch tabs, and chimes at zero.",
    usesHeading: "What fits in ten minutes",
    uses: [
      "A short meditation or breathing exercise, with no need to watch the clock.",
      "A quick bodyweight workout or a brisk walk around the block.",
      "A daily reading habit: one chapter or a few articles.",
      "Keeping a stand-up meeting or a brainstorming round on schedule.",
    ],
    tips: [
      {
        heading: "Mute the chime if you need quiet",
        body: "Uncheck “Play a chime when time is up” if you're in a shared space. The completion message still appears on screen.",
      },
      {
        heading: "Glance at the tab title",
        body: "While the timer runs, the time left appears in your browser tab, so you can keep working in another tab and still see it.",
      },
    ],
  },
  {
    slug: "25-minute-timer",
    minutes: 25,
    heading: "25 Minute Timer",
    metaTitle: "25 Minute Timer for Pomodoro Focus Sessions",
    metaDescription:
      "A free 25-minute countdown timer for Pomodoro-style focus sessions. Work until the chime, then take a short break and repeat.",
    intro:
      "Twenty-five minutes is the work interval used in the Pomodoro Technique, a time management method created by Francesco Cirillo. The timer is set to 25 minutes so you can begin a focus session right away.",
    usesHeading: "How to run a Pomodoro session",
    uses: [
      "Pick one task and write it down so you know what the session is for.",
      "Start the 25 minute timer and work only on that task until the chime.",
      "Take a short break of about five minutes. The 5 minute timer works for this.",
      "After about four sessions, take a longer break before starting again.",
    ],
    tips: [
      {
        heading: "Note distractions instead of acting on them",
        body: "If something comes to mind mid-session, jot it down and get back to the task. Deal with it during your break.",
      },
      {
        heading: "Adapt the length if you need to",
        body: "Twenty-five minutes is a starting point, not a rule. If longer sessions suit you, set any length you like on the custom timer.",
      },
    ],
  },
];

export function getTimerPage(slug: TimerPageSlug): TimerPage {
  const page = timerPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown timer page: ${slug}`);
  return page;
}

export function timerPagePath(page: TimerPage): `/${TimerPageSlug}` {
  return `/${page.slug}`;
}
