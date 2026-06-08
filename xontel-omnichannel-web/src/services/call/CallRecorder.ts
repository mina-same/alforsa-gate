export class CallRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private savePromiseResolve: (() => void) | null = null;
  private audioContext: AudioContext | null = null;
  private mixedAudioStream: MediaStream | null = null;

  private recordedBlob: Blob | null = null;
  private autoDownload: boolean = true;

  public startRecording(localStream: MediaStream, remoteStream: MediaStream, autoDownload: boolean = true) {
    try {
      this.recordedChunks = [];
      this.recordedBlob = null;
      this.autoDownload = autoDownload;

      // Log stream info for debugging
      console.log(`%c[Recorder] Local stream audio tracks: ${localStream.getAudioTracks().length}`, 'color: #2196F3; font-size: 11px;');
      console.log(`%c[Recorder] Remote stream audio tracks: ${remoteStream.getAudioTracks().length}`, 'color: #2196F3; font-size: 11px;');

      // Create audio context for proper mixing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = audioContext;

      // Create an audio mixing graph
      const destination = audioContext.createMediaStreamDestination();

      // Add local audio stream
      if (localStream.getAudioTracks().length > 0) {
        const localSource = audioContext.createMediaStreamSource(localStream);
        const localGain = audioContext.createGain();
        localGain.gain.value = 0.7; // 70% volume for local audio
        localSource.connect(localGain);
        localGain.connect(destination);
        console.log('%c[Recorder] Local audio connected to mixer', 'color: #4CAF50; font-size: 11px;');
      }

      // Add remote audio stream
      if (remoteStream.getAudioTracks().length > 0) {
        const remoteSource = audioContext.createMediaStreamSource(remoteStream);
        const remoteGain = audioContext.createGain();
        remoteGain.gain.value = 0.7; // 70% volume for remote audio
        remoteSource.connect(remoteGain);
        remoteGain.connect(destination);
        console.log('%c[Recorder] Remote audio connected to mixer', 'color: #4CAF50; font-size: 11px;');
      }

      // Use the mixed stream
      const mixedStream = destination.stream;
      this.mixedAudioStream = mixedStream;

      if (mixedStream.getAudioTracks().length === 0) {
        throw new Error('No audio tracks in mixed stream');
      }

      this.mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // Collect all data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log(`%c[Recorder] Data chunk collected: ${(event.data.size / 1024).toFixed(2)}KB`, 'color: #888; font-size: 9px;');
        }
      };

      // Trigger action when recording stops
      this.mediaRecorder.onstop = () => {
        console.log(`%c[Recorder] Recording stopped. Total chunks: ${this.recordedChunks.length}`, 'color: #ff9800; font-weight: bold;');
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedBlob = blob;
        
        if (this.autoDownload) {
          this.saveFile(blob);
        } else {
            this.handleRecordingComplete();
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('[Recorder] MediaRecorder error:', event.error);
      };

      this.mediaRecorder.start();
      console.log("%c[Recorder] Recording started with audio mixing...", "color: #ff5722; font-weight: bold;");
    } catch (error) {
      console.error('[Recorder] Failed to start recording:', error);
      throw error;
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          console.warn('[Recorder] No active recording to stop');
          // Still clean up audio context
          this.cleanupAudioContext();
          resolve(this.recordedBlob);
          return;
        }

        // Set up the resolution to occur after save completes
        this.savePromiseResolve = () => resolve(this.recordedBlob);
        
        // Stop the recorder (triggers onstop -> saveFile/handleComplete -> resolve)
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('[Recorder] Error stopping recording:', error);
        this.cleanupAudioContext();
        reject(error);
      }
    });
  }

  private handleRecordingComplete() {
    this.cleanupAudioContext();
    if (this.savePromiseResolve) {
      this.savePromiseResolve();
      this.savePromiseResolve = null;
    }
  }

  private cleanupAudioContext() {
    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
    } catch (error) {
      console.warn('[Recorder] Error cleaning up audio context:', error);
    }
    this.audioContext = null;
    this.mixedAudioStream = null;
  }

  private saveFile(blob: Blob) {
    try {
      if (blob.size === 0) {
        console.warn('[Recorder] Warning: Recording blob is empty');
      }
      
      const url = URL.createObjectURL(blob);
      const fileName = `whatsapp-call-${Date.now()}.webm`;
      
      // Create and click anchor element (most reliable)
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Trigger download with click
      link.click();
      
      console.log(`%c[Recorder] File download initiated: ${fileName} (${(blob.size / 1024).toFixed(2)}KB)`, "color: #4caf50; font-weight: bold;");
      
      // Cleanup after download
      setTimeout(() => {
        try {
          // Ensure the link is actually removed
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          
          // Revoke the object URL to free memory
          URL.revokeObjectURL(url);
          
          this.handleRecordingComplete();
          
          console.log('%c[Recorder] Download cleanup completed', 'color: #4caf50; font-size: 10px;');
        } catch (cleanupError) {
          console.warn('[Recorder] Cleanup error:', cleanupError);
          this.handleRecordingComplete();
        }
      }, 200);
      
    } catch (error) {
      console.error('[Recorder] Error during file save:', error);
      this.handleRecordingComplete();
    }
  }
}
