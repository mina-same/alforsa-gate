
/**
 * Call Sound Service
 * Handles playing sounds for incoming calls, outgoing ringback, and call termination.
 * Uses Web Audio API to generate tones or plays MP3 files if available.
 */

class CallSoundService {
    private static instance: CallSoundService;
    private audioContext: AudioContext | null = null;
    private ringingInterval: ReturnType<typeof setInterval> | null = null;
    private ringbackInterval: ReturnType<typeof setInterval> | null = null;

    // Audio elements for fallback/external files
    private ringerAudio: HTMLAudioElement | null = null;
    private endAudio: HTMLAudioElement | null = null;

    private constructor() {
        // Initialized on first use to comply with autoplay policies
    }

    public static getInstance(): CallSoundService {
        if (!CallSoundService.instance) {
            CallSoundService.instance = new CallSoundService();
        }
        return CallSoundService.instance;
    }

    private initContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
        }
        if (this.audioContext!.state === 'suspended') {
            this.audioContext!.resume();
        }
    }

    /**
     * Play an inbound ringing sound
     */
    public playRinging() {
        this.stopAll();

        // Try to play external file first if likely to exist
        // If not, we'll use the synthesized ringer
        this.ringerAudio = new Audio('/web/sounds/ringing.mp3');
        this.ringerAudio.loop = true;

        this.ringerAudio.play().catch(() => {
            // Fallback to synthesized sound if file missing or blocked
            this.startSynthesizedRinging();
        });
    }

    /**
     * Play an outbound ringback tone (the sound you hear when calling someone)
     */
    public playRingback() {
        this.stopAll();
        this.startSynthesizedRingback();
    }

    /**
     * Play a call ended sound
     */
    public playEnd() {
        this.stopAll();

        this.endAudio = new Audio('/web/sounds/call_ended.mp3');
        this.endAudio.play().catch(() => {
            // Fallback to synthesized beep
            this.initContext();
            if (!this.audioContext) return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.3);

            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.3);
        });
    }

    public stopAll() {
        if (this.ringerAudio) {
            this.ringerAudio.pause();
            this.ringerAudio.currentTime = 0;
            this.ringerAudio = null;
        }
        if (this.endAudio) {
            this.endAudio.pause();
            this.endAudio = null;
        }

        if (this.ringingInterval) {
            clearInterval(this.ringingInterval);
            this.ringingInterval = null;
        }
        if (this.ringbackInterval) {
            clearInterval(this.ringbackInterval);
            this.ringbackInterval = null;
        }
    }

    private startSynthesizedRinging() {
        this.initContext();
        if (!this.audioContext) return;

        const playMelody = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // WhatsApp-like melodic ringer (E5 -> C5 -> G4 rhythm)
            const notes = [
                { freq: 659.25, start: 0.0, end: 0.3 }, // E5
                { freq: 523.25, start: 0.4, end: 0.7 }, // C5
                { freq: 392.00, start: 0.8, end: 1.1 }  // G4
            ];

            notes.forEach(note => {
                const osc = this.audioContext!.createOscillator();
                const gain = this.audioContext!.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq, now + note.start);

                gain.gain.setValueAtTime(0, now + note.start);
                gain.gain.linearRampToValueAtTime(0.2, now + note.start + 0.05);
                gain.gain.setValueAtTime(0.2, now + note.end - 0.05);
                gain.gain.linearRampToValueAtTime(0, now + note.end);

                osc.connect(gain);
                gain.connect(this.audioContext!.destination);
                osc.start(now + note.start);
                osc.stop(now + note.end);
            });
        };

        playMelody();
        this.ringingInterval = setInterval(playMelody, 2500);
    }

    private startSynthesizedRingback() {
        this.initContext();
        if (!this.audioContext) return;

        const playTone = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // WhatsApp-style outgoing ringback (double pulse "doo-doo")
            const pulses = [0, 0.8];
            pulses.forEach(offset => {
                const osc1 = this.audioContext!.createOscillator();
                const osc2 = this.audioContext!.createOscillator();
                const gain = this.audioContext!.createGain();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(400, now + offset);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(450, now + offset);

                gain.gain.setValueAtTime(0, now + offset);
                gain.gain.linearRampToValueAtTime(0.1, now + offset + 0.1);
                gain.gain.setValueAtTime(0.1, now + offset + 0.6);
                gain.gain.linearRampToValueAtTime(0, now + offset + 0.7);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.audioContext!.destination);

                osc1.start(now + offset);
                osc2.start(now + offset);
                osc1.stop(now + offset + 0.7);
                osc2.stop(now + offset + 0.7);
            });
        };

        playTone();
        this.ringbackInterval = setInterval(playTone, 4000);
    }
}

export const callSoundService = CallSoundService.getInstance();
