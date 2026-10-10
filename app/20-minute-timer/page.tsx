import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("20-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="20-minute-timer" />;
}
