import { useMutation } from "@tanstack/react-query";
import { whatsappCallsAPI } from "./endpoints";
import { CallInitiatePayload, CallAcceptPayload, CallTerminatePayload, callPermissionRequestPayload } from "./types";

/**
 * WhatsApp Calls API Hooks using React Query
 */

export const useInitiateCall = () => {
    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: CallInitiatePayload }) =>
            whatsappCallsAPI.initiate(channelId, data),
    });
};

export const useAcceptCall = () => {
    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: CallAcceptPayload }) =>
            whatsappCallsAPI.accept(channelId, data),
    });
};

export const useTerminateCall = () => {
    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: CallTerminatePayload }) =>
            whatsappCallsAPI.terminate(channelId, data),
    });
};

export const usePermissionCall = () => {
    return useMutation({
        mutationFn: ({ channelId, data }: { channelId: number; data: callPermissionRequestPayload}) =>
            whatsappCallsAPI.permission(channelId, data),
    });
};
