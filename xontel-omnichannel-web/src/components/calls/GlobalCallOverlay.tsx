import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIDispatch, setActiveCall } from '@/contexts/UIContext';
import SimpleVideoCallUI from './SimpleVideoCallUI';
import FloatingCallBar from './FloatingCallBar';
import IncomingCallNotification from './IncomingCallNotification';
import { WhatsAppService } from '@/providers/whatsapp/WhatsAppService';
import { useSIP } from '@/hooks/useSIP';
import { useWhatsAppCall } from '@/hooks/useWhatsAppCall';
import { useContact } from "@/api/contacts/hooks";
import { useInboxes } from '@/api/inboxes/hooks';
import { notificationService } from '@/services/notificationService';
import { callSoundService } from '@/services/call/callSoundService';
import { useWebSocketContext } from '@/providers/WebSocketProvider';


const isPhoneNumber = (val?: string) => !val || /^\+?\d+$/.test(val.replace(/[\s\(\)\-\+]/g, ''));

export default function GlobalCallOverlay() {
    const uiDispatch = useUIDispatch();
    const [isMinimized, setIsMinimized] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStartTime, setCallStartTime] = useState<number | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [showFullUI, setShowFullUI] = useState(false);


    const [callInfo, setCallInfo] = useState<{
        from: string;
        callId?: string;
        name?: string;
        outbound?: boolean;
        sdpOffer?: string;
        type: 'whatsapp' | 'sip';
        contactId?: number;
        channelId?: number;
        conversationId?: number;
    } | null>(null);
    const contactId = callInfo?.contactId;

    const { data: contactData } = useContact(contactId!);
    const { data: inboxes } = useInboxes();
    const inboxItems = inboxes?.items || [];
    const whatsappInbox = inboxItems.find((i: any) => i.channel_type === 'whatsapp');
    const waChannelId = whatsappInbox?.channel_id || 0;
    const waChannelIdRef = useRef<number>(waChannelId);

    useEffect(() => {
        waChannelIdRef.current = waChannelId;
    }, [waChannelId]);


    const avatarUrl = contactData?.avatar_url;



    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isRinging, setIsRinging] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isIgnored, setIsIgnored] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { sendMessage } = useWebSocketContext();

    // WhatsApp Integration
    const { acceptCall: acceptWhatsApp, endCall: endWhatsApp, isAccepting: isAcceptingWhatsApp } = useWhatsAppCall();

    // SIP Integration
    const {
        callStatus,
        remoteIdentity,
        remoteStream: sipStream,
        answerCall: answerSip,
        hangup: hangupSip,
        toggleMute: toggleSipMute
    } = useSIP();

    const [status, setStatus] = useState<'idle' | 'ringing' | 'connected' | 'rejected' | 'ended'>('idle');

    // Refs for use in event listeners to avoid stale closures
    const callInfoRef = useRef<any>(callInfo);
    const statusRef = useRef<string>(status);

    useEffect(() => {
        callInfoRef.current = callInfo;
    }, [callInfo]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Manage call timer
    useEffect(() => {
        if (!isRinging && status === 'connected' && callInfo?.type) {
            // Start duration timer
            if (!callStartTime) {
                setCallStartTime(Date.now());
                console.log(`%c[Global Call] Timer started for call`, 'color: #25D366;');
            }

            if (callTimerRef.current) clearInterval(callTimerRef.current);

            callTimerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = callStartTimeRef.current ? Math.floor((now - callStartTimeRef.current) / 1000) :
                    (callStartTime ? Math.floor((now - callStartTime) / 1000) : 0);
                setCallDuration(elapsed);
            }, 1000);
        } else {
            // Stop timer but don't reset duration unless call ended or idle
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
                callTimerRef.current = null;
            }

            if (status === 'idle' || status === 'ended') {
                setCallDuration(0);
                setCallStartTime(null);
            }
        }

        return () => {
            if (callTimerRef.current) clearInterval(callTimerRef.current);
        };
    }, [isRinging, status, callInfo?.type, callStartTime]);

    const callStartTimeRef = useRef(callStartTime);
    useEffect(() => { callStartTimeRef.current = callStartTime; }, [callStartTime]);

    // Sync SIP state to UI
    useEffect(() => {
        if (callStatus === 'ringing') {
            setCallInfo({
                from: remoteIdentity,
                name: remoteIdentity, // For SIP we usually only have the identity/number
                type: 'sip',
                outbound: false,
                contactId: callInfo?.contactId

            });
            setIsRinging(true);
            setStatus('ringing');
            setShowNotification(true);
            setShowFullUI(false);
        } else if (callStatus === 'connecting') {
            setCallInfo({
                from: remoteIdentity,
                name: remoteIdentity,
                type: 'sip',
                outbound: true,
                contactId: callInfo?.contactId

            });
            setIsRinging(true);
            setStatus('ringing'); // Ringing/Calling state
            setShowNotification(false);
            setShowFullUI(true);
        } else if (callStatus === 'connected') {
            if (!callInfo || callInfo.type !== 'sip') {
                setCallInfo(prev => prev || {
                    from: remoteIdentity,
                    name: remoteIdentity,
                    type: 'sip',
                    outbound: true,
                    contactId: callInfo?.contactId

                });
            }
            setShowNotification(false);
            setShowFullUI(true);
            setIsRinging(false);
            setStatus('connected');
            setRemoteStream(sipStream);
        } else if (callStatus === 'ended' || callStatus === 'idle') {
            if (callInfo?.type === 'sip') {
                // Dismiss system notification if exists
                if (callInfo?.callId) {
                    notificationService.dismissCallNotification(callInfo.callId);
                }

                setShowNotification(false);
                setShowFullUI(false);
                setRemoteStream(null);
                setCallInfo(null);
                setStatus('idle');
                setIsMinimized(false);
            }
        }
    }, [callStatus, remoteIdentity, sipStream, callInfo]);

    useEffect(() => {
        if (callInfo) {
            uiDispatch(setActiveCall({ isInCall: true, conversationId: callInfo.from }));
        } else {
            uiDispatch(setActiveCall({ isInCall: false, conversationId: null }));
        }
    }, [callInfo, uiDispatch]);

    // Manage Call Sounds (Ringing, Calling, End)
    useEffect(() => {
        if (status === 'ringing') {
            if (callInfo?.outbound) {
                console.log('%c[Global Call] Playing ringback tone (outbound)', 'color: #34b7f1;');
                callSoundService.playRingback();
            } else {
                console.log('%c[Global Call] Playing ringing ringer (inbound)', 'color: #25D366;');
                callSoundService.playRinging();
            }
        } else if (status === 'ended' || status === 'rejected') {
            console.log('%c[Global Call] Playing call ended sound', 'color: #FF0000;');
            callSoundService.playEnd();
        } else {
            // Stop all sounds for connected, idle, or accepting states
            console.log('%c[Global Call] Stopping all sounds (status: ' + status + ')', 'color: #888;');
            callSoundService.stopAll();
        }

        return () => {
            // Always cleanup sounds on unmount or state change
            callSoundService.stopAll();
        };
    }, [status, callInfo?.outbound]);

    // Event handler functions - defined BEFORE the useEffect that uses them
    const handleCallEnded = useCallback((e: any) => {
        const remoteCallId = e.detail?.callId;
        console.log(`%c[Global Call] Call ended by remote event (ID: ${remoteCallId})`, 'color: #FF0000; font-weight: bold;');

        // Only end local call if the ID matches or if we don't have an ID (legacy)
        if (callInfoRef.current && remoteCallId && callInfoRef.current.callId !== remoteCallId) {
            console.log(`%c[Global Call] Ignoring end event for different call ID: ${remoteCallId}`, 'color: #888;');
            return;
        }

        // Dismiss system notification if exists
        if (callInfoRef.current?.callId) {
            notificationService.dismissCallNotification(callInfoRef.current.callId);
        }

        setStatus('ended');
        setIsAccepting(false);
        setTimeout(() => {
            setShowNotification(false);
            setShowFullUI(false);
            setRemoteStream(null);
            setCallInfo(null);
            setStatus('idle');
            setIsIgnored(false);
            setIsMinimized(false);
            setIsMuted(false);
        }, 2000);
    }, []);

    const handleIncomingCall = useCallback((e: any) => {
        const { from, to, callId, name, outbound, sdpOffer, sdpType, contact_id, channel_id, conversation_id } = e.detail;

        // IGNORE if we are already connected to this call
        if (statusRef.current === 'connected' && callInfoRef.current?.callId === callId) {
            console.log('%c[Global Call] Ignoring incoming event for already connected call', 'color: #888;');
            return;
        }

        console.log(`%c[Global Call] Handling ${outbound ? 'Outbound' : 'Incoming'} ${sdpType || ''} Call: ${name || from}`, 'color: #25D366; font-weight: bold;');

        setCallInfo(prev => {
            if (prev && prev.callId === callId) {
                const currentNameIsBetter = prev.name && !isPhoneNumber(prev.name);
                return {
                    ...prev,
                    from: prev.from ? prev.from : from,
                    name: (currentNameIsBetter && isPhoneNumber(name)) ? prev.name : (name || prev.name),
                    sdpOffer: sdpOffer || prev.sdpOffer,
                    outbound: outbound !== undefined ? outbound : prev.outbound,
                    contactId: prev?.contactId || contact_id,
                    channelId: channel_id ?? prev?.channelId ?? waChannelIdRef.current,
                    conversationId: conversation_id ?? prev?.conversationId
                };
            }
            return { from, callId, name, outbound, sdpOffer, type: 'whatsapp', contactId: contact_id, channelId: channel_id ?? waChannelIdRef.current, conversationId: conversation_id };
        });

        // Determine if we should show the notification (toast) or full UI
        if (outbound || sdpType === 'answer') {
            if (statusRef.current !== 'connected') {
                setIsRinging(true);
                setStatus('ringing');
            }
            setShowNotification(false);
            setShowFullUI(true);
        } else {
            setIsRinging(true);
            setStatus('ringing');
            setShowNotification(true);
            setShowFullUI(false);
            setIsIgnored(false);

            notificationService.sendIncomingCallNotification(
                name || from,
                callId,
                contact_id,
                from
            );
        }
    }, []);

    const handleCallStatus = useCallback((e: any) => {
        const { status: callStatus, callId } = e.detail;
        console.log(`%c[Global Call] Status Update: ${callStatus}`, 'color: #34b7f1;');

        if (callInfoRef.current && callId && callInfoRef.current.callId !== callId) {
            console.log(`%c[Global Call] Ignoring status update for different call ID: ${callId}`, 'color: #888;');
            return;
        }

        if (callStatus === 'ACCEPTED' || callStatus === 'connected') {
            console.log(`%c[Global Call] Call accepted/connected, stopping ringing`, 'color: #25D366; font-weight: bold;');
            setIsRinging(false);
            setIsAccepting(false);
            setStatus('connected');
            if (!callStartTimeRef.current) {
                setCallStartTime(Date.now());
            }
        } else if (callStatus === 'RINGING' && statusRef.current !== 'connected') {
            setIsRinging(true);
            setStatus('ringing');
        } else if (callStatus === 'REJECTED') {
            if (callInfoRef.current?.callId) {
                notificationService.dismissCallNotification(callInfoRef.current.callId);
            }
            setStatus('rejected');
            setTimeout(() => {
                setShowFullUI(false);
                setShowNotification(false);
                setCallInfo(null);
                setStatus('idle');
                setIsIgnored(false);
                setIsMinimized(false);
            }, 3000);
        } else if (callStatus === 'FAILED') {
            if (callInfoRef.current?.callId) {
                notificationService.dismissCallNotification(callInfoRef.current.callId);
            }
            setTimeout(() => {
                setShowFullUI(false);
                setShowNotification(false);
                setCallInfo(null);
                setStatus('idle');
                setIsIgnored(false);
                setIsMinimized(false);
            }, 3000);
        }
    }, []);

    // Handler for socket call_event messages
    const handleCallEvent = useCallback((e: any) => {
        const { type, data } = e.detail;

        console.log(`%c[Global Call] Received socket event: ${type}`, 'color: #FF6B35; font-weight: bold;', data);

        if (type !== 'call_event') return;

        console.log(`%c[Global Call] Received call_event:`, 'color: #FF6B35; font-weight: bold;', data);

        const { status: msgStatus, call_action, call_id, contact_name, contact_phone, direction, event, sdp, sdp_type, contact_id, channel_id, conversation_id } = data;

        // Handle Answer / ACCEPTED / Status update
        const isAccepted = event === 'accepted' || event === 'accept' || msgStatus === 'accepted' || msgStatus === 'ACCEPTED' || call_action === 'call_accepted' || (event === 'status' && msgStatus === 'accepted') || (call_action === 'call_started' && msgStatus === 'ANSWERED');
        const isEnded = event === 'terminate' || msgStatus === 'COMPLETED' || call_action === 'call_ended' || call_action === 'terminate' || msgStatus === 'FAILED' || msgStatus === 'REJECTED';
        const isCandidate = event === 'candidate' || event === 'ice_candidate';

        if (isEnded) {
            console.log(`%c[Global Call] Detected Call ended via socket event (${call_action || event || msgStatus})`, 'color: #FF0000; font-weight: bold;');
            handleCallEnded({ detail: { callId: call_id } });
            return;
        }

        if (isCandidate) {
            console.log('%c[Global Call] Detected Remote ICE Candidate via socket.', 'color: #888; font-size: 10px;');
            const whatsapp = WhatsAppService.getInstance();
            whatsapp.handleCallSignaling({
                id: call_id,
                event: 'candidate',
                candidate: data.candidate,
                sdp_mid: data.sdp_mid,
                sdp_m_line_index: data.sdp_m_line_index
            }, channel_id ?? waChannelIdRef.current);
            return;
        }

        if (isAccepted) {
            console.log(`%c[Global Call] Detected Call accepted (from socket event: ${direction})!`, 'color: #25D366; font-weight: bold;');

            // If we are still ringing for an inbound call, another agent accepted it — dismiss
            if (statusRef.current === 'ringing' && !callInfoRef.current?.outbound) {
                console.log('%c[Global Call] Another agent accepted the call, dismissing ringing...', 'color: #888;');
                if (callInfoRef.current?.callId) {
                    notificationService.dismissCallNotification(callInfoRef.current.callId);
                }
                callSoundService.stopAll();
                setShowNotification(false);
                setShowFullUI(false);
                setCallInfo(null);
                setStatus('idle');
                setIsIgnored(false);
                setIsMinimized(false);
                return;
            }

            setIsRinging(false);
            setIsAccepting(false);
            setStatus('connected');
            if (!callStartTimeRef.current) {
                setCallStartTime(Date.now());
            }
            // For outbound calls, recording starts here (when remote actually accepted)
            if (direction === 'outbound') {
                WhatsAppService.getInstance().notifyCallAccepted();
            }
            return;
        }

        // Handle SDP Answer (Establishing media path for ringback tone)
        if (sdp_type === 'answer' || (event === 'connect' && sdp && sdp_type === 'answer')) {
            console.log('%c[Global Call] Establishing Media for Outbound Call (Ringback established).', 'color: #34b7f1; font-weight: bold;');
            const whatsapp = WhatsAppService.getInstance();
            whatsapp.handleCallSignaling({
                id: call_id,
                event: 'connect',
                session: {
                    sdp: sdp,
                    sdp_type: 'answer'
                },
                from: contact_phone
            }, channel_id ?? waChannelIdRef.current);

            // For outbound calls, stay in ringing UI but establish media
            if (direction === 'outbound' && statusRef.current !== 'connected') {
                setIsRinging(true);
                setStatus('ringing');
            }
            return;
        }

        // Handle different call events
        if (event === 'connect' && call_action === 'new_call') {
            console.log(`%c[Global Call] New call assigned: ${contact_name} (${contact_phone})`, 'color: #25D366; font-weight: bold;');

            setCallInfo(prev => {
                if (prev && prev.callId === call_id) {
                    const currentNameIsBetter = prev.name && !isPhoneNumber(prev.name);
                    return {
                        ...prev,
                        from: contact_phone || prev.from,
                        name: (currentNameIsBetter && isPhoneNumber(contact_name)) ? prev.name : (contact_name || prev.name),
                        outbound: direction === 'outbound',
                        sdpOffer: sdp_type === 'offer' ? sdp : prev.sdpOffer,
                        contactId: contact_id,
                        channelId: channel_id ?? prev?.channelId ?? waChannelIdRef.current,
                        conversationId: conversation_id ?? prev?.conversationId
                    };
                }
                return {
                    from: contact_phone,
                    callId: call_id,
                    name: contact_name,
                    outbound: direction === 'outbound',
                    type: 'whatsapp',
                    contactId: contact_id,
                    channelId: channel_id ?? waChannelIdRef.current,
                    conversationId: conversation_id,
                    sdpOffer: sdp_type === 'offer' ? sdp : undefined
                };
            });

            if (statusRef.current !== 'connected') {
                setIsRinging(true);
                setStatus('ringing');
            }

            if (direction === 'outbound') {
                setShowNotification(false);
                setShowFullUI(true);
            } else {
                setShowNotification(true);
                setShowFullUI(false);
                setIsIgnored(false);

                notificationService.sendIncomingCallNotification(
                    contact_name || contact_phone,
                    call_id,
                    contact_id,
                    contact_phone
                );
            }
        } else if (event === 'ringing' || event === 'new_call' || call_action === 'new_call') {
            // Handle ringing and other new call events
            console.log(`%c[Global Call] Call ringing/new event: ${event}`, 'color: #25D366; font-weight: bold;');

            setCallInfo(prev => {
                if (prev && prev.callId === call_id) {
                    const currentNameIsBetter = prev.name && !isPhoneNumber(prev.name);
                    return {
                        ...prev,
                        from: contact_phone || prev.from,
                        name: (currentNameIsBetter && isPhoneNumber(contact_name)) ? prev.name : (contact_name || prev.name),
                        outbound: direction === 'outbound',
                        sdpOffer: sdp_type === 'offer' ? sdp : prev.sdpOffer,
                        contactId: contact_id,
                        channelId: channel_id ?? prev?.channelId ?? waChannelIdRef.current,
                        conversationId: conversation_id ?? prev?.conversationId
                    };
                }
                return {
                    from: contact_phone,
                    callId: call_id,
                    name: contact_name,
                    outbound: direction === 'outbound',
                    type: 'whatsapp',
                    contactId: contact_id,
                    channelId: channel_id ?? waChannelIdRef.current,
                    conversationId: conversation_id,
                    sdpOffer: sdp_type === 'offer' ? sdp : undefined
                };
            });

            if (statusRef.current !== 'connected') {
                setIsRinging(true);
                setStatus('ringing');
            }

            if (direction === 'outbound') {
                setShowNotification(false);
                setShowFullUI(true);
            } else {
                setShowNotification(true);
                setShowFullUI(false);
                setIsIgnored(false);

                notificationService.sendIncomingCallNotification(
                    contact_name || contact_phone,
                    call_id,
                    contact_id,
                    contact_phone
                );
            }
        } else if (event === 'offer' || sdp_type === 'offer') {
            // Handle SDP offer events (incoming call offers)
            console.log(`%c[Global Call] SDP Offer received for incoming call`, 'color: #25D366; font-weight: bold;');

            setCallInfo(prev => {
                if (prev && prev.callId === call_id) {
                    return {
                        ...prev,
                        from: contact_phone || prev.from,
                        name: contact_name || prev.name,
                        outbound: false,
                        sdpOffer: sdp,
                        contactId: contact_id,
                        channelId: channel_id ?? prev?.channelId ?? waChannelIdRef.current,
                        conversationId: conversation_id ?? prev?.conversationId
                    };
                }
                return {
                    from: contact_phone,
                    callId: call_id,
                    name: contact_name,
                    outbound: false,
                    type: 'whatsapp',
                    contactId: contact_id,
                    channelId: channel_id ?? waChannelIdRef.current,
                    conversationId: conversation_id,
                    sdpOffer: sdp
                };
            });

            if (statusRef.current !== 'connected') {
                setIsRinging(true);
                setStatus('ringing');
                setShowNotification(true);
                setShowFullUI(false);
                setIsIgnored(false);

                notificationService.sendIncomingCallNotification(
                    contact_name || contact_phone,
                    call_id,
                    contact_id,
                    contact_phone
                );
            }
        }
    }, [handleCallEnded]);

    // Effect 1: Attach event listeners immediately on mount (no dependencies)
    useEffect(() => {
        console.log('[GlobalCallOverlay] Attaching event listeners immediately');
        
        window.addEventListener('whatsapp-incoming-call', handleIncomingCall);
        window.addEventListener('whatsapp-call-status', handleCallStatus);
        window.addEventListener('whatsapp-call-ended', handleCallEnded);
        window.addEventListener('socket-message', handleCallEvent);

        return () => {
            console.log('[GlobalCallOverlay] Removing event listeners');
            window.removeEventListener('whatsapp-incoming-call', handleIncomingCall);
            window.removeEventListener('whatsapp-call-status', handleCallStatus);
            window.removeEventListener('whatsapp-call-ended', handleCallEnded as any);
            window.removeEventListener('socket-message', handleCallEvent);
        };
    }, [handleIncomingCall, handleCallStatus, handleCallEnded, handleCallEvent]);

    // Effect 2: Initialize WhatsApp service when channel becomes available
    useEffect(() => {
        const initWhatsAppWithChannel = async () => {
            if (!waChannelId || waChannelId <= 0) return;
            
            try {
                console.log(`[GlobalCallOverlay] Initializing WhatsApp with channel ${waChannelId}`);
                await WhatsAppService.initWithChannel(waChannelId);
                
                const whatsapp = WhatsAppService.getInstance();
                console.log(`[GlobalCallOverlay] Service ready, channel: ${whatsapp.getChannelId()}`);
                
                // Update callInfo with correct channelId if we have an active call with channel 0 or missing
                setCallInfo(prev => {
                    if (prev && (!prev.channelId || prev.channelId === 0)) {
                        console.log(`[GlobalCallOverlay] Updating callInfo channelId from ${prev.channelId || 'undefined'} to ${waChannelId}`);
                        return { ...prev, channelId: waChannelId };
                    }
                    return prev;
                });
                
                // Setup callbacks
                whatsapp.onRemoteStream((stream: MediaStream) => {
                    console.log('%c[Global Call] Remote track detected', 'color: #25D366;');
                    setRemoteStream(stream);

                    if (!callInfoRef.current?.outbound) {
                        console.log('%c[Global Call] Inbound stream → connected', 'color: #25D366;');
                        setIsRinging(false);
                        setIsAccepting(false);
                        setStatus('connected');
                    } else {
                        console.log('%c[Global Call] Outbound stream → ringback', 'color: #34b7f1;');
                        setIsAccepting(false);
                    }
                });

                whatsapp.onCallEnded(() => {
                    console.log(`%c[Global Call] Call ended callback`, 'color: #FF0000; font-weight: bold;');
                    if (callInfoRef.current?.callId) {
                        notificationService.dismissCallNotification(callInfoRef.current.callId);
                    }
                    setStatus('ended');
                    setIsAccepting(false);
                    setTimeout(() => {
                        setShowNotification(false);
                        setShowFullUI(false);
                        setRemoteStream(null);
                        setCallInfo(null);
                        setStatus('idle');
                        setIsIgnored(false);
                        setIsMinimized(false);
                        setIsMuted(false);
                    }, 2000);
                });
            } catch (error) {
                console.error('[GlobalCallOverlay] WhatsApp init with channel failed:', error);
            }
        };

        initWhatsAppWithChannel();
    }, [waChannelId]);

    const handleAcceptCall = useCallback(async () => {
        setIsIgnored(false);
        setIsMinimized(false);
        setShowNotification(false);

        // Dismiss system notification if exists
        if (callInfo?.callId) {
            notificationService.dismissCallNotification(callInfo.callId);
        }

        if (callInfo?.type === 'sip') {
            await answerSip();
            setShowFullUI(true);
            setStatus('connected');
            if (!callStartTime) {
                setCallStartTime(Date.now());
            }
            return;
        }

        if (!callInfo?.callId || !callInfo?.sdpOffer || callInfo?.channelId == null) {
            alert('Missing call information or channel ID');
            return;
        }

        try {
            setIsAccepting(true);
            console.log(`%c[Global Call] Accepting WhatsApp call: ${callInfo.callId} on channel: ${callInfo.channelId}`, 'color: #25D366; font-weight: bold;');

            // Ensure WhatsApp service is initialized with the correct channel.
            // Do NOT re-register onRemoteStream/onCallEnded here — doing so replaces the
            // callbacks set in initWhatsAppWithChannel which correctly distinguish inbound
            // vs outbound streams. Re-registering without that check causes the call timer
            // to fire immediately on the NEXT outgoing call (the onRemoteStream for ringback
            // media would incorrectly mark the call as connected).
            await WhatsAppService.initWithChannel(callInfo.channelId);

            await acceptWhatsApp(callInfo.channelId, callInfo.callId, callInfo.sdpOffer, callInfo.from);

            console.log(`%c[Global Call] Call accepted successfully`, 'color: #25D366;');

            // Notify other agents via WebSocket so they stop ringing
            sendMessage({
                type: "call_event",
                data: {
                    event: "accepted",
                    call_action: "call_accepted",
                    call_id: callInfo.callId,
                    status: "ACCEPTED",
                    direction: "inbound",
                    channel_id: callInfo.channelId,
                    conversation_id: callInfo.conversationId,
                },
            });

            // Stop all sounds when call is accepted
            callSoundService.stopAll();
            
            // Hide notification and show full call UI
            setShowNotification(false);
            setShowFullUI(true);
            setStatus('connected');
            if (!callStartTime) {
                setCallStartTime(Date.now());
            }
        } catch (error) {
            console.error('[Global Call] Failed to accept call:', error);
            setIsAccepting(false);
            alert('Failed to accept call. Please try again.');
        }
    }, [callInfo, acceptWhatsApp, answerSip, callStartTime, sendMessage]);

    const handleDeclineCall = useCallback(() => {
        // Dismiss system notification if exists
        if (callInfo?.callId) {
            notificationService.dismissCallNotification(callInfo.callId);
        }

        // Stop all sounds when declining
        callSoundService.stopAll();

        if (callInfo?.type === 'sip') {
            hangupSip();
        } else if (callInfo?.callId) {
            endWhatsApp(callInfo.callId, callInfo.channelId ?? waChannelIdRef.current);
        }
        setShowNotification(false);
        setShowFullUI(false);
        setIsAccepting(false);
        setIsIgnored(false);
        setStatus('ended');
    }, [callInfo, endWhatsApp, hangupSip]);

    const handleIgnoreCall = useCallback(() => {
        // Dismiss system notification if exists
        if (callInfo?.callId) {
            notificationService.dismissCallNotification(callInfo.callId);
        }

        // Stop all sounds when ignoring
        callSoundService.stopAll();

        setShowNotification(false);
        setIsIgnored(true);
    }, [callInfo]);

    const handleRestoreCall = useCallback(() => {
        setIsIgnored(false);
        setIsMinimized(false);
        if (status === 'ringing' && !callInfo?.outbound) {
            setShowNotification(true);
        } else {
            setShowFullUI(true);
        }
    }, [status, callInfo]);

    // Handle cross-tab/SW messages for call actions
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'ACCEPT_CALL') {
                console.log('%c[Global Call] Received ACCEPT_CALL from system notification', 'color: #25D366; font-weight: bold;');
                handleAcceptCall();
            } else if (event.data?.type === 'REJECT_CALL') {
                console.log('%c[Global Call] Received REJECT_CALL from system notification', 'color: #FF0000; font-weight: bold;');
                handleDeclineCall();
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleMessage);
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
            }
        };
    }, [handleAcceptCall, handleDeclineCall]);

    const handleMuteToggle = (muted: boolean) => {
        console.log(`[Global Call] Mute Toggle: ${muted}, Type: ${callInfo?.type}`);
        setIsMuted(muted);
        if (callInfo?.type === 'sip') {
            toggleSipMute(muted);
        } else {
            WhatsAppService.getInstance().toggleMic(muted);
        }
    };

    const handleVideoToggle = (isVideoOff: boolean) => {
        console.log(`[Global Call] Video Toggle: ${isVideoOff}`);
        if (callInfo?.type === 'whatsapp') {
            WhatsAppService.getInstance().toggleVideo(isVideoOff);
        }
    };

    // Show incoming notification (toast-like)
    if (showNotification) {
        return (
            <IncomingCallNotification
                name={callInfo?.name || callInfo?.from}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
                onIgnore={handleIgnoreCall}
            />
        );
    }

    // Show full call UI after accept
    if (showFullUI && !isMinimized) {
        return (
            <div className="fixed inset-0 z-[99999] bg-black">
                <SimpleVideoCallUI
                    name={callInfo?.name || callInfo?.from}
                    avatar={avatarUrl}
                    isVoiceOnly={true} // For now WhatsAppService handles audio
                    onAccept={handleAcceptCall}
                    onDecline={handleDeclineCall}
                    status={
                        status === 'ringing' ? (isAccepting ? 'Connecting...' : (callInfo?.outbound ? 'Calling...' : 'Ringing...')) :
                            status === 'connected' ? 'Connected' :
                                status === 'rejected' ? 'User Busy / Rejected' :
                                    status === 'ended' ? 'Call Ended' :
                                        undefined
                    }
                    callDuration={callDuration}
                    onEnd={() => {
                        if (callInfo?.type === 'sip') {
                            hangupSip();
                        } else if (callInfo?.callId) {
                            endWhatsApp(callInfo.callId, callInfo.channelId ?? waChannelIdRef.current);
                        }
                        setShowFullUI(false);
                        setIsAccepting(false);
                        setIsMinimized(false);
                    }}
                    onMinimize={() => setIsMinimized(true)}
                    onMuteToggle={handleMuteToggle}
                    onVideoToggle={handleVideoToggle}
                    remoteStream={remoteStream}
                    ringing={isRinging}
                    isIncoming={!callInfo?.outbound}
                    isAccepting={isAccepting}
                    isMuted={isMuted}
                />
            </div>
        );
    }

    // Show floating call bar when call is active and minimized
    if (isMinimized && status === 'connected') {
        return (
            <>
                {/* Persistent audio element - plays even when minimized */}
                {remoteStream && (
                    <audio
                        autoPlay
                        playsInline
                        ref={(el) => {
                            if (el && el.srcObject !== remoteStream) {
                                el.srcObject = remoteStream;
                                el.play().catch(e => console.warn('[GlobalCallOverlay] Audio play prevented:', e));
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                )}
                <FloatingCallBar
                    name={callInfo?.name || callInfo?.from}
                    callDuration={callDuration}
                    avatar={avatarUrl}
                    isMuted={isMuted}
                    onEndCall={() => {
                        if (callInfo?.type === 'sip') {
                            hangupSip();
                        } else if (callInfo?.callId) {
                            WhatsAppService.getInstance().endCall(callInfo.callId, callInfo.channelId);
                        }
                        setShowFullUI(false);
                        setIsAccepting(false);
                        setIsMinimized(false);
                    }}
                    onMuteToggle={handleMuteToggle}
                    onExpandCall={() => {
                        setIsMinimized(false);
                    }}
                />
            </>
        );
    }

    // Show floating pill if ignored but still ringing or if minimized
    if ((isIgnored && status === 'ringing' && !showNotification) || (isMinimized && showFullUI)) {
        return (
            <>
                {/* Persistent audio element - plays even when minimized */}
                {remoteStream && status === 'connected' && (
                    <audio
                        autoPlay
                        playsInline
                        ref={(el) => {
                            if (el && el.srcObject !== remoteStream) {
                                el.srcObject = remoteStream;
                                el.play().catch(e => console.warn('[GlobalCallOverlay] Audio play prevented:', e));
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                )}
                <div
                    onClick={handleRestoreCall}
                    className={`fixed top-24 right-6 z-[99999] ${status === 'ringing' ? 'animate-bounce' : ''}`}
                >
                    <div className={`${status === 'connected' ? 'bg-xon-blue shadow-[0_8px_30px_rgba(59,130,246,0.4)]' : 'bg-xon-green shadow-[0_8px_30px_rgba(37,211,102,0.4)]'} text-white px-4 py-2.5 rounded-full cursor-pointer flex items-center gap-3 transition-all hover:scale-110 active:scale-95 border-2 border-white/20 backdrop-blur-md`}>
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 leading-none">
                                {status === 'connected' ? 'Ongoing Call...' : 'Ringing...'}
                            </span>
                            <span className="font-bold text-sm leading-tight">{callInfo?.name || callInfo?.from}</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return null;
}

