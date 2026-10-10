import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("15-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="15-minute-timer" />;
}
