import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Phone,
  MoreVertical, Settings, Users, MessageSquare, Music, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppService } from '@/providers/whatsapp/WhatsAppService';
import { SOUNDSCAPES, SoundscapeType } from '@/services/call/backgroundMusicService';

interface VideoCallProps {
  name?: string;
  avatar?: string;
  onEnd?: () => void;
  onAccept?: () => Promise<void>;
  onDecline?: () => void;
  isVoiceOnly?: boolean;
  remoteStream?: MediaStream | null;
  ringing?: boolean;
  isIncoming?: boolean;
  status?: string;
  onMuteToggle?: (isMuted: boolean) => void;
  onVideoToggle?: (isVideoOff: boolean) => void;
  isAccepting?: boolean;
  onMinimize?: () => void;
  callDuration?: number;
  isMuted?: boolean;
}

export default function EnhancedVideoCallUI({
  name = "Participant",
  avatar,
  onEnd,
  onAccept,
  onDecline,
  isVoiceOnly = false,
  remoteStream,
  ringing = true,
  isIncoming = false,
  status,
  onMuteToggle,
  onVideoToggle,
  isAccepting: isAcceptingProp = false,
  onMinimize,
  callDuration = 0,
  isMuted: isMutedProp = false,
}: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(isMutedProp);
  const [isVideoOff, setIsVideoOff] = useState(isVoiceOnly);
  const [showControls, setShowControls] = useState(true);
  const [isInCall, setIsInCall] = useState(true);
  const [isAccepting, setIsAccepting] = useState(isAcceptingProp);

  // Sync isAccepting state with prop
  useEffect(() => {
    setIsAccepting(isAcceptingProp);
  }, [isAcceptingProp]);

  // Sync isMuted with prop
  useEffect(() => {
    setIsMuted(isMutedProp);
  }, [isMutedProp]);

  const [showSoundscapeMenu, setShowSoundscapeMenu] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const soundscapeMenuRef = useRef<HTMLDivElement>(null);

  const [isRinging, setIsRinging] = useState(ringing);

  // Sync isRinging with prop or stream presence (for incoming)
  useEffect(() => {
    if (isIncoming && remoteStream) {
      console.log('[Call UI] Remote stream detected (inbound), stopping local ringing state');
      setIsRinging(false);
    } else {
      // For outbound calls, we defer to the 'ringing' prop entirely
      // because remoteStream is present during ringback tone
      setIsRinging(ringing);
    }
  }, [remoteStream, ringing, isIncoming]);

  // Handle Remote Stream Audio Attachment
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      console.log('%c[WebRTC] Attaching remote stream tracks to audio element', 'color: #25D366; font-weight: bold;');

      // Ensure we are getting the stream correctly
      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
      }

      // Play the audio
      const playPromise = remoteAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('[WebRTC] Auto-play prevented. User interaction required:', error);
          // Some browsers require a user gesture to start audio
        });
      }
    }
  }, [remoteStream]);

  // Debugging Session Changes logic
  useEffect(() => {
    console.log(`%c[Session Update] Status: %c${isRinging ? 'RINGING' : 'CONNECTED'} %c| Muted: %c${isMuted} %c| Video: %c${!isVideoOff ? 'ON' : 'OFF'}`,
      'font-weight: bold; color: #888;',
      `font-weight: bold; color: ${isRinging ? '#FFA500' : '#25D366'};`,
      'font-weight: bold; color: #888;',
      `font-weight: bold; color: ${isMuted ? '#FF0000' : '#25D366'};`,
      'font-weight: bold; color: #888;',
      `font-weight: bold; color: ${!isVideoOff ? '#25D366' : '#FF0000'};`
    );
  }, [isRinging, isMuted, isVideoOff]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls logic
  const handleMouseMove = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  // Camera Stream Preview (Video only, audio is handled by WhatsAppService tracks)
  useEffect(() => {
    async function enableCamera() {
      if (isVideoOff) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }

    if (isInCall && !isVideoOff) {
      enableCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall, isVideoOff]);

  // Toggle video on/off
  const toggleVideo = () => {
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);

    if (onVideoToggle) {
      onVideoToggle(newVideoState);
    }

    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !newVideoState;
      }
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Call the external handler (WhatsAppService or SIP)
    if (onMuteToggle) {
      onMuteToggle(newMutedState);
    }

    // Also mute any local preview audio tracks if they exist
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !newMutedState;
      });
    }
  };

  // Handle soundscape selection
  const handleSoundscapeSelect = async (soundscapeId: SoundscapeType) => {
    try {
      const whatsappService = WhatsAppService.getInstance();
      await whatsappService.toggleSoundscape(soundscapeId);
      setCurrentSoundscape(soundscapeId === currentSoundscape ? 'none' : soundscapeId);
      setShowSoundscapeMenu(false);
    } catch (error) {
      console.error('Failed to toggle soundscape:', error);
    }
  };

  // Close soundscape menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (soundscapeMenuRef.current && !soundscapeMenuRef.current.contains(event.target as Node)) {
        setShowSoundscapeMenu(false);
      }
    };

    if (showSoundscapeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSoundscapeMenu]);


  const [isSpeakingWhileMuted, setIsSpeakingWhileMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'm':
          toggleAudio();
          break;
        case 'v':
          toggleVideo();
          break;
        case 'escape':
          if (showSoundscapeMenu) {
            setShowSoundscapeMenu(false);
          } else {
            endCall();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, isVideoOff, showSoundscapeMenu]);

  // Speaking while muted detection
  useEffect(() => {
    if (!isMuted || !isInCall) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsSpeakingWhileMuted(false);
      return;
    }

    async function monitorAudio() {
      try {
        // Redundant getUserMedia can cause conflicts with the main call stream in some browsers
        // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        // const audioContext = new AudioContextClass();
        // const source = audioContext.createMediaStreamSource(stream);
        return; // Disable for now to test core connectivity
        // const analyser = audioContext.createAnalyser();
        // analyser.fftSize = 256;
        // source.connect(analyser);

        // audioContextRef.current = audioContext;
        // analyserRef.current = analyser;

        // const bufferLength = analyser.frequencyBinCount;
        // const dataArray = new Uint8Array(bufferLength);

        // const checkVolume = () => {
        //   if (!analyserRef.current) return;
        //   analyserRef.current.getByteFrequencyData(dataArray);
        //   const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
        //   if (average > 30) { // Threshold for speaking
        //     setIsSpeakingWhileMuted(true);
        //     setTimeout(() => setIsSpeakingWhileMuted(false), 2000);
        //   }
          
        //   animationFrameRef.current = requestAnimationFrame(checkVolume);
        // };

        // checkVolume();
      } catch (err) {
        console.warn("Speech detection unavailable:", err);
      }
    }

    monitorAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isMuted, isInCall]);




  // End call
  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsInCall(false);
    onEnd?.();
    console.log('Call ended');
  };

  return (
    <div
      className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-slate-50 transition-colors duration-700"
      onMouseMove={handleMouseMove}
      style={{
        background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)'
      }}
    >
      {/* Speaking while muted alert */}
      <div className={`fixed top-1/4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${isSpeakingWhileMuted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
        <div className="bg-red-500/90 text-white px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border border-white/20 flex items-center gap-3">
          <MicOff className="w-6 h-6 animate-bounce" />
          <span className="font-bold tracking-tight">You are muted!</span>
        </div>
      </div>
      {/* --- Custom CSS Animations --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse-recording {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ripple-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: ripple 3s infinite cubic-bezier(0.24, 0, 0.38, 1);
        }
        .ripple-circle:nth-child(2) { animation-delay: 1s; }
        .ripple-circle:nth-child(3) { animation-delay: 2s; }
      `}} />

      {/* --- Remote Audio --- */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* --- Main Remote Participant (Background) --- */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Animated Background Ripples for Ringing State */}
        {isRinging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="ripple-circle w-32 h-32" />
            <div className="ripple-circle w-32 h-32" />
            <div className="ripple-circle w-32 h-32" />
          </div>
        )}

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className={`relative w-32 h-32 mb-6 transition-all duration-500 ${isRinging ? 'scale-110' : 'scale-100'}`}>
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700/50 overflow-hidden shadow-2xl">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-12 h-12 text-slate-500" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            {name}
          </h2>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${isRinging ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-slate-300 text-sm font-medium">
              {isAccepting ? 'Connecting...' : (status && status !== 'Connected' ? status : (isRinging ? (isIncoming ? 'Incoming Call' : 'Calling...') : formatTime(callDuration)))}
            </p>
          </div>
        </div>
      </div>

      {/* --- Local Preview (Picture-in-Picture) --- */}
      <div className={`absolute top-6 right-6 w-32 h-24 sm:w-48 sm:h-32 md:w-64 md:h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-sm z-20 group transition-all duration-500 ${!isVideoOff ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] sm:text-[10px] font-semibold tracking-wider text-white/80 border border-white/5 uppercase">
          You
        </div>
      </div>

      {/* --- Top Header Overlay --- */}
      <div className={`absolute top-0 left-0 right-0 p-4 sm:p-8 flex justify-between items-start transition-all duration-500 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-2 sm:gap-4 bg-white/5 backdrop-blur-2xl px-3 py-2 sm:px-5 sm:py-3 rounded-2xl border border-white/10 shadow-lg">
          <div className="w-10 h-10  rounded-xl bg-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold shadow-inner overflow-hidden">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
          </div>
          <div className="max-w-[120px] sm:max-w-none">
            <p className="text-xs sm:text-sm font-bold leading-tight truncate">{name}</p>
            <p className="text-[9px] sm:text-[11px] text-emerald-400 font-medium flex items-center gap-1 sm:gap-1.5 mt-0.5">
              <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-emerald-400 ${isRinging ? '' : 'animate-pulse'}`} />
              <span className="truncate">{isAccepting ? 'Encrypted' : (isRinging ? 'Secure Line' : 'Live')}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-3">
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              title="Minimize (Back to Chat)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8M9 15l-6 6m6-6v4.8m0-4.8H4.2M9 9 3 3m6 6V4.2M9 9H4.2m5.8-6l6 6m-6-6v4.8m0-4.8h4.8" /></svg>
            </Button>
          )}
          {/* <Button variant="ghost" size="icon" className=" w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 transition-all active:scale-95">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </Button> */}
          {/* <Button variant="ghost" size="icon" className=" w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 transition-all active:scale-95">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </Button> */}
        </div>
      </div>

      {/* --- Bottom Controls --- */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col items-center gap-4 sm:gap-6 transition-all duration-500 z-50 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>

        {/* Incoming Call Accept/Decline */}
        {isIncoming && isRinging && !isAccepting && (
          <div className="flex items-center gap-6 sm:gap-8 px-6 sm:px-10 py-5 sm:py-8 bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] scale-100 sm:scale-110">
            <Button
              onClick={async () => {
                setIsAccepting(true);
                try {
                  if (onAccept) {
                    await onAccept();
                  }
                } catch (error) {
                  console.error('[Call UI] Failed to accept call:', error);
                  alert('Failed to accept call. Please try again.');
                  setIsAccepting(false);
                }
              }}
              disabled={isAccepting}
              className="w-10 h-10  rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center border-4 border-emerald-500/20"
              title="Accept Call"
            >
              {isVoiceOnly ? (
                <Phone className="w-10 h-10  fill-current" />
              ) : (
                <Video className="w-10 h-10  fill-current" />
              )}
            </Button>

            <Button
              onClick={() => {
                if (onDecline) onDecline();
                onEnd?.();
              }}
              className="w-10 h-10  rounded-full bg-red-500 hover:bg-red-400 text-white transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center justify-center border-4 border-red-500/20"
              title="Decline Call"
            >
              <PhoneOff className="w-7 h-7 " />
            </Button>
          </div>
        )}

        {/* Status Pills */}
        {(!(isIncoming && isRinging) || isAccepting) && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {isMuted && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
                <MicOff className="w-3  h-3  text-red-400" />
                <span>Muted</span>
              </div>
            )}
            {isVideoOff && !isVoiceOnly && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-500/10 border border-slate-500/30 rounded-full text-slate-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
                <VideoOff className="w-3  h-3  text-slate-400" />
                <span>Camera Off</span>
              </div>
            )}
          </div>
        )}

        {/* Call Controls Main Panel */}
        {(!(isIncoming && isRinging) || isAccepting) && (
          <div className="relative flex flex-col items-center w-full" ref={soundscapeMenuRef}>
            {showSoundscapeMenu && (
              <div className="absolute bottom-full mb-6 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden z-[100] w-[220px] sm:w-72 p-2 sm:p-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
                <div className="px-4 py-3 mb-2 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Atmosphere</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-1 sm:space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                  {Object.values(SOUNDSCAPES).map((soundscape) => (
                    <button
                      key={soundscape.id}
                      onClick={() => handleSoundscapeSelect(soundscape.id)}
                      className={`w-full text-left px-4 py-3 sm:py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group relative overflow-hidden ${
                        currentSoundscape === soundscape.id
                          ? 'bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/25'
                          : 'hover:bg-white/5 text-slate-300 hover:translate-x-1'
                      }`}
                    >
                      {currentSoundscape === soundscape.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent" />
                      )}
                      <span className={`text-lg sm:text-2xl w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        currentSoundscape === soundscape.id ? 'bg-white/20' : 'bg-white/5'
                      }`}>
                        {soundscape.icon}
                      </span>
                      <div className="flex-1 overflow-hidden z-10">
                        <div className="text-xs sm:text-sm font-bold truncate tracking-tight">{soundscape.label}</div>
                        <div className={`text-[9px] sm:text-[10px] opacity-60 truncate ${currentSoundscape === soundscape.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {currentSoundscape === soundscape.id ? 'Currently Active' : 'Select Atmosphere'}
                        </div>
                      </div>
                      {currentSoundscape === soundscape.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-5 bg-white/5 backdrop-blur-3xl rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto no-scrollbar">
            <Button
              onClick={toggleAudio}
              className={`w-11 h-11  shrink-0 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 border border-white/5 ${isMuted ? 'bg-red-500 hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
            >
              {isMuted ? <MicOff className="w-6 h-6 " /> : <Mic className="w-6 h-6 " />}
            </Button>

            {!isVoiceOnly && (
              <Button
                onClick={toggleVideo}
                className={`w-11 h-11  shrink-0 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 border border-white/5 ${isVideoOff ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                title={isVideoOff ? "Start Video (V)" : "Stop Video (V)"}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 " /> : <Video className="w-6 h-6 " />}
              </Button>
            )}

            <div className="w-[1px] h-8 sm:h-10 bg-white/10 mx-1 sm:mx-2 shrink-0" />


            <div className="relative shrink-0">
              <Button
                onClick={() => setShowSoundscapeMenu(!showSoundscapeMenu)}
                className={`w-10 h-10  rounded-xl sm:rounded-2xl transition-all active:scale-95 border border-white/5 ${currentSoundscape !== 'none' ? 'bg-indigo-500/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                title="Audio Soundscapes"
              >
                <Music className="w-6 h-6 " />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-10 h-10 shrink-0 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 hidden sm:flex"
            >
              <MoreVertical className="w-6 h-6 " />
            </Button>

            <div className="w-[1px] h-8 sm:h-10 bg-white/10 mx-1 sm:mx-2 shrink-0" />

            <Button
              onClick={endCall}
              className="w-10 h-10  shrink-0 rounded-xl sm:rounded-2xl bg-red-500 hover:bg-red-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.2)] border border-red-500/20 group"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6  text-white group-active:scale-90 transition-transform" />
            </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Overlay Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />
    </div>
  );
}