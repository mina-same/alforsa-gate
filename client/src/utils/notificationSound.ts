let ctx: AudioContext | null = null;

const getCtx = () => {
  if (!ctx) ctx = new AudioContext();
  return ctx;
};

export function playNotificationSound() {
  try {
    const audioCtx = getCtx();
    // Resume context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc1  = audioCtx.createOscillator();
    const osc2  = audioCtx.createOscillator();
    const gain  = audioCtx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Two-tone chime: E5 → G#5
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(830.61, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.15);
    osc2.start(audioCtx.currentTime + 0.12);
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch {
    // Audio not available — silent fallback
  }
}
