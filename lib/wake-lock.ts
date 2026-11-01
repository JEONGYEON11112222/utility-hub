// Screen Wake Lock status while a countdown runs. Support itself is read separately.
export type WakeLockStatus = "requesting" | "active" | "released" | "failed";

// The parts of the Screen Wake Lock API and document this uses, so it can be tested with fakes.
type WakeLockSentinelLike = {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
};
type WakeLockApi = { request(type: "screen"): Promise<WakeLockSentinelLike> };
type VisibilitySource = {
  readonly visibilityState: DocumentVisibilityState;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
};

/**
 * Holds a screen wake lock until the returned function is called. Requests only while the page
 * is visible, never runs two requests at once, never reuses a released sentinel, requests a new
 * lock when the page becomes visible again, and releases a lock that arrives after stopping.
 * Status is only reported asynchronously. Failures are reported, never thrown.
 */
export function holdScreenWakeLock(
  wakeLock: WakeLockApi,
  page: VisibilitySource,
  onStatus: (status: Exclude<WakeLockStatus, "requesting">) => void,
): () => void {
  let stopped = false;
  let pending = false;
  let sentinel: WakeLockSentinelLike | null = null;

  const request = async () => {
    if (stopped || pending || page.visibilityState !== "visible") return;
    if (sentinel && !sentinel.released) return;
    pending = true;
    try {
      const lock = await wakeLock.request("screen");
      if (stopped) {
        void lock.release().catch(() => {});
        return;
      }
      sentinel = lock;
      onStatus("active");
      // Browsers release the lock themselves when the page is hidden or for system reasons.
      lock.addEventListener("release", () => {
        if (sentinel !== lock) return;
        sentinel = null;
        if (!stopped) onStatus("released");
      });
    } catch {
      // Permission policy, battery saver, or a hidden page; the timer works regardless.
      if (!stopped) onStatus("failed");
    } finally {
      pending = false;
    }
  };

  const onVisibilityChange = () => {
    if (page.visibilityState === "visible") void request();
  };

  void request();
  page.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    stopped = true;
    page.removeEventListener("visibilitychange", onVisibilityChange);
    const lock = sentinel;
    sentinel = null;
    if (lock && !lock.released) void lock.release().catch(() => {});
  };
}
