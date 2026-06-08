/**
 * Background Music / Soundscapes Service
 * Manages sounds for audio calls including nature sounds, ambient noise, etc.
 */

export type SoundscapeType = 'none' | 'rain' | 'forest' ;

interface Soundscape {
  id: SoundscapeType;
  label: string;
  icon: string;
  description: string;
  url: string;
}

export const SOUNDSCAPES: Record<SoundscapeType, Soundscape> = {
  none: {
    id: 'none',
    label: 'None',
    icon: '🔇',
    description: 'No background sound',
    url: ''
  },
  rain: {
    id: 'rain',
    label: 'Rain',
    icon: '🌧️',
    description: 'Gentle rain ambiance',
    url: '/web/sounds/rain.mp3'
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    icon: '🌲',
    description: 'Forest birds and wind',
    url: '/web/sounds/forest.mp3'
  }

};

export class BackgroundMusicService {
  private static instance: BackgroundMusicService;
  private audioContext: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private soundscapeSource: MediaElementAudioSourceNode | null = null;
  private localStreamSource: MediaStreamAudioSourceNode | null = null;
  private soundscapeGainNode: GainNode | null = null;
  private micGainNode: GainNode | null = null;
  private soundscapeDestination: MediaStreamAudioDestinationNode | null = null;
  private currentSoundscape: SoundscapeType = 'none';
  private isActive: boolean = false;
  private localStream: MediaStream | null = null;

  private constructor() {}

  public static getInstance(): BackgroundMusicService {
    if (!BackgroundMusicService.instance) {
      BackgroundMusicService.instance = new BackgroundMusicService();
    }
    return BackgroundMusicService.instance;
  }

  /**
   * Initialize audio context for mixing background music with microphone
   */
  public initializeAudioContext(localStream?: MediaStream): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Create new context if doesn't exist or recreate if closed
    if (!this.audioContext || this.audioContext.state === 'closed') {
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (error) {
        console.error('[Background Music] Failed to create audio context:', error);
        return;
      }
    }

    // Resume audio context if suspended (required for autoplay)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(err => {
        console.warn('[Background Music] Failed to resume audio context:', err);
      });
    }

    // Update local stream reference
    if (localStream && localStream !== this.localStream) {
      this.localStream = localStream;
      
      // Disconnect old local stream source if exists
      if (this.localStreamSource) {
        this.localStreamSource.disconnect();
        this.localStreamSource = null;
      }
    }

    try {
      if (this.audioContext) {
        // Create destination for output if needed (includes soundscape + mic)
        if (!this.soundscapeDestination || this.soundscapeDestination.context.state === 'closed') {
          this.soundscapeDestination = this.audioContext.createMediaStreamDestination();
        }

        // Create soundscape gain node if needed
        if (!this.soundscapeGainNode || this.soundscapeGainNode.context.state === 'closed') {
          this.soundscapeGainNode = this.audioContext.createGain();
          this.soundscapeGainNode.gain.value = 0.3; // 30% volume for background music
          this.soundscapeGainNode.connect(this.soundscapeDestination);
        }

        // Create microphone gain node if needed
        if (!this.micGainNode || this.micGainNode.context.state === 'closed') {
          this.micGainNode = this.audioContext.createGain();
          this.micGainNode.gain.value = 1.0;
          this.micGainNode.connect(this.soundscapeDestination);
        }

        // Connect local stream to mic gain if available and not already connected
        if (localStream && !this.localStreamSource) {
          try {
            this.localStreamSource = this.audioContext.createMediaStreamSource(localStream);
            this.localStreamSource.connect(this.micGainNode);
            console.log('%c[Background Music] Local stream connected to mixer', 'color: #25D366; font-weight: bold;');
          } catch (error) {
            console.warn('[Background Music] Failed to connect local stream:', error);
          }
        }
      }
      console.log('%c[Background Music] Audio Context initialized', 'color: #25D366; font-weight: bold;');
    } catch (error) {
      console.error('[Background Music] Failed to initialize audio context:', error);
    }
  }

  /**
   * Play a soundscape (sends to local + remote)
   */
  public async playSoundscape(soundscapeId: SoundscapeType, localStream?: MediaStream): Promise<void> {
    try {
      // If requesting 'none', stop current playback
      if (soundscapeId === 'none') {
        this.stopSoundscape();
        return;
      }

      const soundscape = SOUNDSCAPES[soundscapeId];
      if (!soundscape || !soundscape.url) {
        console.warn('[Background Music] Invalid soundscape:', soundscapeId);
        return;
      }

      // Stop previous soundscape to properly cleanup
      if (this.currentAudioElement) {
        this.stopSoundscape();
      }

      // Initialize or reinitialize audio context with fresh local stream
      this.initializeAudioContext(localStream);
      
      if (!this.audioContext || !this.soundscapeGainNode) {
        console.error('[Background Music] Audio context not properly initialized');
        return;
      }

      // Create NEW audio element for this soundscape
      this.currentAudioElement = new Audio();
      this.currentAudioElement.src = soundscape.url;
      this.currentAudioElement.loop = true;
      this.currentAudioElement.crossOrigin = 'anonymous';
      this.currentAudioElement.volume = 1.0; // Let gain node control volume

      // IMPORTANT: Create NEW MediaElementSource for each new audio element
      // (createMediaElementSource can only be called once per audio element)
      try {
        // Disconnect old soundscapeSource if exists
        if (this.soundscapeSource) {
          this.soundscapeSource.disconnect();
          this.soundscapeSource = null;
        }
        
        // Create and connect new soundscapeSource
        this.soundscapeSource = this.audioContext.createMediaElementSource(this.currentAudioElement);
        this.soundscapeSource.connect(this.soundscapeGainNode);
        console.log(`%c[Background Music] Soundscape source created and connected`, 'color: #25D366; font-size: 10px;');
      } catch (error) {
        console.error('[Background Music] Failed to create media element source:', error);
        return;
      }

      // Play the soundscape
      try {
        await this.currentAudioElement.play();
        console.log(`%c[Background Music] Playing: ${soundscape.label}`, 'color: #25D366; font-weight: bold;');
      } catch (err) {
        console.warn('[Background Music] Autoplay blocked, waiting for user interaction:', err);
        // Try to play again after a short delay
        setTimeout(() => {
          this.currentAudioElement?.play().catch(e => 
            console.warn('[Background Music] Retry play failed:', e)
          );
        }, 100);
      }

      this.currentSoundscape = soundscapeId;
      this.isActive = true;
      
      // Log mixed stream info for debugging
      const mixedStream = this.getMixedStream();
      console.log(`%c[Background Music] Mixed stream tracks: ${mixedStream?.getTracks().length || 0}`, 'color: #25D366; font-size: 10px;');
    } catch (error) {
      console.error('[Background Music] Failed to play soundscape:', error);
    }
  }

  /**
   * Stop current soundscape playback
   */
  public async stopSoundscape(): Promise<void> {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    
    // Disconnect soundscapeSource to prevent conflicts
    if (this.soundscapeSource) {
      this.soundscapeSource.disconnect();
      this.soundscapeSource = null;
    }
    
    this.currentSoundscape = 'none';
    this.isActive = false;
    console.log('%c[Background Music] Stopped', 'color: #34b7f1; font-weight: bold;');
  }

  /**
   * Set volume for background music
   */
  public setVolume(volume: number): void {
    if (this.soundscapeGainNode) {
      this.soundscapeGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Set microphone volume
   */
  public setMicVolume(volume: number): void {
    if (this.micGainNode) {
      this.micGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get mixed audio stream (soundscape + microphone)
   */
  public getMixedStream(): MediaStream | null {
    return this.soundscapeDestination?.stream || null;
  }

  /**
   * Get current soundscape
   */
  public getCurrentSoundscape(): SoundscapeType {
    return this.currentSoundscape;
  }

  /**
   * Check if soundscape is active
   */
  public isPlaying(): boolean {
    return this.isActive && this.currentAudioElement !== null && !this.currentAudioElement.paused;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopSoundscape();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.soundscapeGainNode = null;
    this.micGainNode = null;
    this.soundscapeSource = null;
    this.localStreamSource = null;
    this.soundscapeDestination = null;
    this.localStream = null;
  }

  /**
   * Get all available soundscapes
   */
  public getAvailableSoundscapes(): Soundscape[] {
    return Object.values(SOUNDSCAPES);
  }

  /**
   * Toggle soundscape (turn on/off)
   */
  public toggleSoundscape(soundscapeId: SoundscapeType, localStream?: MediaStream): Promise<void> {
    if (this.currentSoundscape === soundscapeId && this.isPlaying()) {
      this.stopSoundscape();
      return Promise.resolve();
    } else {
      return this.playSoundscape(soundscapeId, localStream);
    }
  }
}

export const backgroundMusicService = BackgroundMusicService.getInstance();
