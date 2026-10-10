import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("30-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="30-minute-timer" />;
}
