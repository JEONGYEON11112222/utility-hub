// The "time's up" sound, built with the Web Audio API so no audio file or service is needed.

export function playChime(ctx: AudioContext) {
  const start = ctx.currentTime;
  [0, 0.35, 0.7].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.3, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.32);
  });
}

/** A short tone for interval changes: higher and doubled for work, single and lower for rest. */
export function playBeep(ctx: AudioContext, { frequency = 660, count = 1 } = {}) {
  const start = ctx.currentTime;
  for (let i = 0; i < count; i++) {
    const offset = i * 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.3, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.16);
  }
}
