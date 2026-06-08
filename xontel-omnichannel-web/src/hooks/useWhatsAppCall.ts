import { useAcceptCall, useInitiateCall, useTerminateCall } from "@/api/whatsapp-calls/hooks";
import { WhatsAppService } from "@/providers/whatsapp/WhatsAppService";
import { useCallback } from "react";

/**
 * Hook to manage WhatsApp calls using backend APIs with channel credentials
 */
export const useWhatsAppCall = () => {
    const initiateMutation = useInitiateCall();
    const acceptMutation = useAcceptCall();
    const terminateMutation = useTerminateCall();

    const startCall = useCallback(async (channelId: number, params: { conversationId: number; contactId: number; to: string; isVideo?: boolean }) => {
        console.log(`[useWhatsAppCall] Starting ${params.isVideo ? 'video' : 'voice'} call for channel ${channelId}`);
        
        // Initialize WhatsAppService with channel credentials
        const whatsapp = await WhatsAppService.initWithChannel(channelId);
        
        if (params.isVideo) {
            return whatsapp.startVideoCall({
                channelId,
                conversationId: params.conversationId,
                contactId: params.contactId,
                to: params.to
            });
        } else {
            return whatsapp.startVoiceCall({
                channelId,
                conversationId: params.conversationId,
                contactId: params.contactId,
                to: params.to
            });
        }
    }, []);

    const acceptCall = useCallback(async (channelId: number, callId: string, sdpOffer: string, from: string) => {
        console.log(`[useWhatsAppCall] Accepting call ${callId} for channel ${channelId} from ${from}`);
        
        // Ensure we have the channel initialized
        const whatsapp = await WhatsAppService.initWithChannel(channelId);
        
        return whatsapp.handleCallSignaling({
            id: callId,
            event: 'connect',
            from: from,
            session: {
                sdp: sdpOffer,
                sdp_type: 'offer'
            }
        }, channelId);
    }, []);

    const endCall = useCallback(async (callId: string, channelId?: number) => {
        console.log(`[useWhatsAppCall] Ending call ${callId}`);
        
        // If channelId provided, ensure we use that channel's instance
        let whatsapp;
        if (channelId) {
            whatsapp = await WhatsAppService.initWithChannel(channelId);
        } else {
            whatsapp = WhatsAppService.getInstance();
        }
        
        return whatsapp.endCall(callId, channelId);
    }, []);

    return {
        startCall,
        acceptCall,
        endCall,
        isInitiating: initiateMutation.isPending,
        isAccepting: acceptMutation.isPending,
        isTerminating: terminateMutation.isPending
    };
};
