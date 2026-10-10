// Content for the fixed-duration timer landing pages (/1-minute-timer, /5-minute-timer, ...).
// Each route file under app/ picks its entry by slug, so adding a page means adding an
// entry here plus a small route file. Keep each entry's copy specific to its duration.

export type TimerPageSlug =
  | "1-minute-timer"
  | "5-minute-timer"
  | "10-minute-timer"
  | "15-minute-timer"
  | "20-minute-timer"
  | "25-minute-timer"
  | "30-minute-timer"
  | "60-minute-timer";

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
    slug: "1-minute-timer",
    minutes: 1,
    heading: "1 Minute Timer",
    metaTitle: "1 Minute Timer for Quick Drills and Challenges",
    metaDescription:
      "A free 60-second countdown timer that's ready to start. Use it for plank holds, speaking practice, quick-write prompts, and one-minute games.",
    intro:
      "Sixty seconds goes faster than you'd expect, so it's worth timing properly. This timer is already set to one minute: press Start and it counts down to zero, then shows a message and plays a chime.",
    usesHeading: "What to do in one minute",
    uses: [
      "Hold a plank, wall sit, or stretch for a full minute without checking a clock.",
      "Practice a short self-introduction or elevator pitch and see what fits in 60 seconds.",
      "Run a one-minute quick-write or a rapid-recall round in class.",
      "Keep turns fair in party games where each player gets one minute.",
    ],
    tips: [
      {
        heading: "Repeat it for intervals",
        body: "When the minute is up, press Start again to run another round. Reset returns to one minute if you paused partway through.",
      },
      {
        heading: "Need a few extra seconds?",
        body: "Change the seconds field before you start, for example 1 minute 30 seconds for a slightly longer hold.",
      },
    ],
  },
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
    slug: "15-minute-timer",
    minutes: 15,
    heading: "15 Minute Timer",
    metaTitle: "15 Minute Timer for Study Blocks and Short Rests",
    metaDescription:
      "A free 15-minute countdown timer for homework blocks, presentation practice, short rests, and quarter-hour planning sessions.",
    intro:
      "A quarter of an hour works well for a single focused task. The timer is set to 15 minutes. Start it, pause it if you're interrupted, and resume where you left off.",
    usesHeading: "Ways to use 15 minutes",
    uses: [
      "A homework or revision block for younger students, followed by a short break.",
      "Rehearsing a presentation or speech to check that it fits the time you've been given.",
      "A short rest. Lie down or close your eyes without worrying about oversleeping.",
      "Planning tomorrow: review your calendar, list priorities, and clear your inbox.",
    ],
    tips: [
      {
        heading: "Pause instead of restarting",
        body: "If someone interrupts you, press Pause. Resume continues from the exact time left rather than starting over.",
      },
      {
        heading: "Adjust before you start",
        body: "You can change the minutes or seconds before starting, for example to 12 minutes for a shorter talk.",
      },
    ],
  },
  {
    slug: "20-minute-timer",
    minutes: 20,
    heading: "20 Minute Timer",
    metaTitle: "20 Minute Timer for Focus, Exercise, and Screen Breaks",
    metaDescription:
      "A free 20-minute countdown timer for study sessions, a walk or run, screen-break reminders, and timed activities, with an alert at zero.",
    intro:
      "Twenty minutes gives you room to settle into a task without committing to a full hour. This timer is set to 20 minutes and alerts you on screen, and with an optional chime, when time is up.",
    usesHeading: "When a 20 minute timer helps",
    uses: [
      "A focused study or writing session with one clear goal.",
      "A walk, an easy run, or a yoga session.",
      "A screen-break reminder. The commonly recommended 20-20-20 rule suggests looking at something about 20 feet away for 20 seconds every 20 minutes.",
      "Timed classroom or team activities where each stage needs a clear limit.",
    ],
    tips: [
      {
        heading: "Repeat for regular reminders",
        body: "When the chime sounds, take your break, then press Start again for the next 20 minutes.",
      },
      {
        heading: "Keep the tab open",
        body: "The timer keeps accurate time in a background tab. Leave this page open in its own tab while you work.",
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
        body: "Twenty-five minutes is a starting point, not a rule. If longer sessions suit you, try the 30 or 60 minute timer.",
      },
    ],
  },
  {
    slug: "30-minute-timer",
    minutes: 30,
    heading: "30 Minute Timer",
    metaTitle: "30 Minute Timer for Workouts, Meetings, and Reading",
    metaDescription:
      "A free 30-minute countdown timer for workouts, meetings, reading, and timed practice sections. Pause, resume, and reset whenever you need.",
    intro:
      "Half an hour suits a full workout, a focused meeting, or a solid stretch of reading. This timer is set to 30 minutes and stays accurate even if your device puts the tab in the background.",
    usesHeading: "What to time in half an hour",
    uses: [
      "A complete workout, including warm-up and cool-down.",
      "A meeting with a fixed end time so the agenda stays on track.",
      "Reading, practicing an instrument, or language study.",
      "A timed section of a practice test.",
    ],
    tips: [
      {
        heading: "Split it into parts",
        body: "For a mixed session, glance at the time left to switch activities, for example warm up until 25:00 remains.",
      },
      {
        heading: "Check your volume",
        body: "Make sure your device isn't muted if you're relying on the chime to know when time is up.",
      },
    ],
  },
  {
    slug: "60-minute-timer",
    minutes: 60,
    heading: "60 Minute Timer",
    metaTitle: "60 Minute Timer (1 Hour Countdown)",
    metaDescription:
      "A free one-hour countdown timer for deep work, practice exams, longer study sessions, and activities that need a clear end time.",
    intro:
      "An hour gives you time for deep, uninterrupted work or a full practice session. This timer is set to 60 minutes and shows hours, minutes, and seconds as it counts down.",
    usesHeading: "Good uses for a one-hour timer",
    uses: [
      "A deep work block on a single demanding task.",
      "A full-length practice exam or timed assignment.",
      "A longer study or rehearsal session, with a break when the chime sounds.",
      "Setting a clear limit for screen time, gaming, or an activity with a set end time.",
    ],
    tips: [
      {
        heading: "Plan a break afterward",
        body: "After an hour of focus, step away for a few minutes before you start the next session.",
      },
      {
        heading: "Longer than an hour?",
        body: "Enter any time up to 999 minutes in the minutes field, for example 90 minutes for a longer session.",
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
