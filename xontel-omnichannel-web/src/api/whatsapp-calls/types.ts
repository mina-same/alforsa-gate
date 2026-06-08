/**
 * WhatsApp Calls API Types
 */

export interface CallInitiatePayload {
    conversation_id: number;
    contact_id: number;
    to: string;
    sdp_offer: string;
}

export interface CallAcceptPayload {
    call_id: string;
    sdp_answer: string;
}

export interface CallTerminatePayload {
    call_id: string;
    reason?: string;
}

export interface callPermissionRequestPayload {
    to: string;
    template_name: string;
}

export interface CallResponse {
    call_id: string;
    sdp_answer?: string;
    sdp_type?: string;
    status?: string;
}
