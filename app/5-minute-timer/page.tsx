import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("5-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="5-minute-timer" />;
}
