import apiClient from "../client";
import { CallInitiatePayload, CallAcceptPayload, CallTerminatePayload, CallResponse, callPermissionRequestPayload } from "./types";

/**
 * WhatsApp Calls API Endpoints
 */

export const whatsappCallsAPI = {
    /**
     * Initiate a WebRTC call via WhatsApp
     * POST /api/v1/webhooks/whatsapp/{channel_id}/calls/initiate
     */
    initiate: async (channelId: number, data: CallInitiatePayload): Promise<CallResponse> => {
        const response = await apiClient.post<CallResponse>(`/v1/webhooks/whatsapp/${channelId}/calls/initiate`, data);
        return response.data;
    },

    /**
     * Accept an incoming WebRTC call
     * POST /api/v1/webhooks/whatsapp/{channel_id}/calls/accept
     */
    accept: async (channelId: number, data: CallAcceptPayload): Promise<void> => {
        await apiClient.post(`/v1/webhooks/whatsapp/${channelId}/calls/accept`, data);
    },

    /**
     * Terminate an active WebRTC call
     * POST /api/v1/webhooks/whatsapp/{channel_id}/calls/terminate
     */
    terminate: async (channelId: number, data: CallTerminatePayload): Promise<void> => {
        await apiClient.post(`/v1/webhooks/whatsapp/${channelId}/calls/terminate`, data);
    },
    permission: async (channelId: number, data: callPermissionRequestPayload): Promise<void> => {
        await apiClient.post(`/v1/webhooks/whatsapp/${channelId}/calls/permission`, data);
    }
};
