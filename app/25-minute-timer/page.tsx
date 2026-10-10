import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("25-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="25-minute-timer" />;
}
