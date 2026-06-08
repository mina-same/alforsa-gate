import { useState, useEffect, useCallback, useRef } from 'react';
import { sipService, SIPConfig } from '@/services/sipService';
import { Session, SessionState } from 'sip.js';

export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

interface UseSIPReturn {
    callStatus: CallStatus;
    isRegistered: boolean;
    remoteIdentity: string;
    callDuration: number;
    remoteStream: MediaStream | null;
    makeCall: (target: string) => Promise<void>;
    answerCall: () => Promise<void>;
    hangup: () => Promise<void>;
    toggleMute: (muted: boolean) => void;
    isMuted: boolean;
}

export const useSIP = (config?: SIPConfig): UseSIPReturn => {
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [isRegistered, setIsRegistered] = useState(false);
    const [remoteIdentity, setRemoteIdentity] = useState('');
    const [callDuration, setCallDuration] = useState(0);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // If config is provided, initialize the service
        if (config) {
            sipService.initialize(config).catch(console.error);
        }

        const onRegistered = () => setIsRegistered(true);
        const onUnregistered = () => setIsRegistered(false);

        const onIncoming = (session: Session) => {
            setCallStatus('ringing');
            setRemoteIdentity(session.remoteIdentity.displayName || session.remoteIdentity.uri.user || 'Unknown');
            setRemoteStream(null);
        };

        const onAccepted = (session: Session) => {
            setCallStatus('connected');
            setRemoteStream(sipService.getRemoteStream());

            // Start duration timer
            setCallDuration(0);
            timerRef.current = window.setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        };

        const onEnded = () => {
            setCallStatus('ended');
            setRemoteStream(null);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setTimeout(() => setCallStatus('idle'), 3000);
        };

        const onFailed = () => {
            setCallStatus('ended');
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setTimeout(() => setCallStatus('idle'), 3000);
        };

        sipService.on('registered', onRegistered);
        sipService.on('unregistered', onUnregistered);
        sipService.on('call_incoming', onIncoming);
        sipService.on('call_accepted', onAccepted);
        sipService.on('call_ended', onEnded);
        sipService.on('call_failed', onFailed);

        return () => {
            sipService.off('registered', onRegistered);
            sipService.off('unregistered', onUnregistered);
            sipService.off('call_incoming', onIncoming);
            sipService.off('call_accepted', onAccepted);
            sipService.off('call_ended', onEnded);
            sipService.off('call_failed', onFailed);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [config]);

    const makeCall = useCallback(async (target: string) => {
        setCallStatus('connecting');
        setRemoteIdentity(target);
        try {
            await sipService.makeCall(target);
        } catch (error) {
            setCallStatus('idle');
            throw error;
        }
    }, []);

    const answerCall = useCallback(async () => {
        try {
            await sipService.answerCall();
        } catch (error) {
            console.error('Failed to answer SIP call', error);
        }
    }, []);

    const hangup = useCallback(async () => {
        await sipService.hangup();
    }, []);

    const toggleMute = useCallback((muted: boolean) => {
        sipService.toggleMute(muted);
        setIsMuted(muted);
    }, []);

    return {
        callStatus,
        isRegistered,
        remoteIdentity,
        callDuration,
        remoteStream,
        makeCall,
        answerCall,
        hangup,
        toggleMute,
        isMuted
    };
};
