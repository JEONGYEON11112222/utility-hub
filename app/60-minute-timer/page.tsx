import { DurationTimerPage, timerPageMetadata } from "@/components/duration-timer-page";

export const metadata = timerPageMetadata("60-minute-timer");

export default function Page() {
  return <DurationTimerPage slug="60-minute-timer" />;
}
