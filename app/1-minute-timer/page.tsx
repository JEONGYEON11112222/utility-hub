import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("1-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="1-minute-timer" />;
}
