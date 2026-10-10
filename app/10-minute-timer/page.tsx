import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("10-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="10-minute-timer" />;
}
