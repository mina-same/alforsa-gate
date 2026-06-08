import { usePermissionCall } from "@/api/whatsapp-calls/hooks";
import { useWhatsAppCall } from "@/hooks/useWhatsAppCall";
import { Conversation, Message } from "@/types/chat";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Props for the useMessageThreadCalls hook
 */
interface UseMessageThreadCallsProps {
    conv: Conversation | any;
    currentInbox: any;
    handleSend: (params: any) => Promise<void>;
    saveDraft: (id: string, text: string) => void;
    setReplyingTo: (msg: Message | null) => void;
    drafts: Record<string, string>;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isInternalConversation: boolean;
    isAssignedToMe: boolean;
    currentUserContactId: number;
    currentUserId: number | undefined;
}

/**
 * Custom hook to handle WhatsApp and regular calls within the MessageThread
 * Refactored from MessageThread.tsx for better readability and maintainability.
 */
export const useMessageThreadCalls = ({
    conv,
    currentInbox,
    handleSend,
    saveDraft,
    setReplyingTo,
    drafts,
    setMessages,
    isInternalConversation,
    isAssignedToMe,
    currentUserContactId,
    currentUserId,
}: UseMessageThreadCallsProps) => {

    const { startCall: startWhatsApp } = useWhatsAppCall();
    const permissionCall =usePermissionCall();
    const { t } = useTranslation();


    /**
     * Helper to validate and format the phone number for WhatsApp API
     */
    const validateAndFormatPhone = () => {
        if (!conv) return null;

        // Extract phone number from all available fields before falling back to conv.id
        let phoneRaw = conv.phone || conv.phone_number || conv.contact?.phone || (conv as any).contact_phone || "";

        // Validate: Real phone numbers are typically 10-15 digits, Meta IDs are 15+ alphanumeric
        const isMetaId = (str: string) => str.length > 15 && /[a-zA-Z]/.test(str);

        // If phoneRaw looks like a Meta ID or internal UUID, try fallback to conv.name if it looks like a phone number
        if (isMetaId(phoneRaw) && conv.name && /^\+?[\d\s-]{8,}$/.test(conv.name)) {
            phoneRaw = conv.name;
        }

        const hasDigits = /\d/.test(phoneRaw);

        if (!phoneRaw || isMetaId(phoneRaw) || !hasDigits) {
            alert("⚠️ Contact phone number not found. Internal IDs cannot be used for calls.\n\nPlease ensure the contact has a valid phone number linked.");
            return null;
        }

        // Format phone for API: Remove all non-digits, keep only numeric
        // Meta API requires: "12185552828" (no + sign, just digits)
        const phoneNumericOnly = phoneRaw.replace(/\D/g, '');
        const displayPhone = phoneRaw.startsWith('+') ? phoneRaw : `+${phoneRaw}`;

        return { phoneNumericOnly, displayPhone };
    };

    /**
     * Sends a call permission request message to the contact
     */
    const requestCallPermission = async (displayPhone: string) => {
        const sendPermissionRequest = window.confirm(t('chat.whatsapp.call_permission_request_confirm_message'));

        if (sendPermissionRequest && conv?.numeric_id) {
            try {
                // Send via existing message API
                const permissionMessage = await permissionCall.mutateAsync({
                    channelId: conv.channel_id,
                    data: {
                        to: displayPhone,
                        template_name: "voice_call_request",
                    },
                });

                console.log('permissionMessage', permissionMessage);

                await handleSend({
                    saveDraft,
                    setReplyingTo,
                    replyingTo: null,
                    drafts,
                    setMessages,
                    isInternalConversation,
                    isAssignedToMe,
                    currentUserContactId: currentUserContactId || 0,
                    currentUserId,
                    conv: conv as any,
                    message: { text: permissionMessage },
                });

                console.log(`%c[Permission Request] Message sent to ${conv.name}`, 'color: #25D366; font-weight: bold;');
                alert(t('chat.whatsapp.call_permission_request_sent_success', { name: conv.name }));
            } catch (sendError: any) {
                console.error('[Call Handler] Failed to send permission request:', sendError);
                
                const errorData = sendError?.response?.data;
                const errorDetail = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData || "");

                if (sendError?.response?.status === 502 || errorDetail.includes("WhatsApp Graph API error")) {
                    alert(t('chat.whatsapp.call_permission_request_already_sent'));
                } else {
                    alert('Failed to send permission request. Please try again later.');
                }
            }
        }
    };

    /**
     * Initiates a voice call
     */
    const handleCall = async () => {
        if (!conv) return;

        const formatted = validateAndFormatPhone();
        if (!formatted) return;

        const { phoneNumericOnly, displayPhone } = formatted;

        // Check if it's a WhatsApp conversation
        if (currentInbox?.channel_type === 'whatsapp') {
            try {
                console.log(`%c[Call Handler] Initiating voice call to: ${displayPhone}`, 'color: #25D366; font-weight: bold;');

                const result = await startWhatsApp(conv.channel_id, {
                    conversationId: conv.numeric_id || Number(conv.id),
                    contactId: conv.contact_id,
                    to: phoneNumericOnly,
                    isVideo: false
                });

                if (result.success && result.callId) {
                    console.log(`%c[Call Handler] Call initiated successfully. ID: ${result.callId}`, 'color: #25D366;');
                    window.dispatchEvent(new CustomEvent('whatsapp-incoming-call', {
                        detail: { from: displayPhone, callId: result.callId, name: conv.name, outbound: true, contact_id: conv.contact_id || conv.numeric_id, channel_id: conv.channel_id }
                    }));
                } else {
                    const errorMsg = result.error || 'Unknown error';
                    console.error(`%c[Call Handler] Call failed: ${errorMsg}`, 'color: #FF0000;');

                    // Check if error is due to missing call permissions (401)
                    if (errorMsg.includes('401') || errorMsg.includes('No approved call permission')) {
                       await permissionCall.mutateAsync({
                            channelId: conv.channel_id,
                            data: {
                                to: displayPhone,
                                template_name: "voice_call_request",
                            },
                            });
                    } else {
                         await permissionCall.mutateAsync({
                            channelId: conv.channel_id,
                            data: {
                                to: displayPhone,
                                template_name: "voice_call_request",
                            },
                            });
                    }
                }
            } catch (e: any) {
                console.error('[Call Handler] Exception:', e);
                
                const errorData = e?.response?.data;
                const errorDetail = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData || "");

                // Handle specifically the "template already sent within 24h" error (often 502 or specific message)
                if (e?.response?.status === 502 || errorDetail.includes("WhatsApp Graph API error")) {
                    alert(t('chat.whatsapp.call_permission_request_already_sent'));
                } else {
                    const errorMsg = e?.message || 'Unknown error';
                    
                    // Fallback attempt to send permission template if it wasn't a 502 error
                    try {
                        await permissionCall.mutateAsync({
                            channelId: conv.channel_id,
                            data: {
                                to: displayPhone,
                                template_name: "voice_call_request",
                            },
                        });
                    } catch (retryError) {
                        console.error('[Call Handler] Permission fallback failed:', retryError);
                    }
                    
                    alert(`Error: ${errorMsg}\n\nWhatsApp Business API is not properly configured. Contact your administrator.`);
                }
            }
        } else {
            // Fallback for non-WhatsApp channels
            window.open(`tel:${displayPhone}`);
        }
    };

    /**
     * Initiates a video call
     */
    const handleVideoCall = async () => {
        if (!conv) return;

        const formatted = validateAndFormatPhone();
        if (!formatted) return;

        const { phoneNumericOnly, displayPhone } = formatted;

        if (currentInbox?.channel_type === 'whatsapp') {
            try {
                console.log(`%c[Call Handler] Initiating video call to: ${displayPhone}`, 'color: #25D366; font-weight: bold;');

                const result = await startWhatsApp(conv.channel_id, {
                    conversationId: conv.numeric_id || Number(conv.id),
                    contactId: conv.contact_id,
                    to: phoneNumericOnly,
                    isVideo: true
                });

                if (result.success && result.callId) {
                    console.log(`%c[Call Handler] Video call initiated successfully. ID: ${result.callId}`, 'color: #25D366;');
                    window.dispatchEvent(new CustomEvent('whatsapp-incoming-call', {
                        detail: { from: displayPhone, callId: result.callId, name: conv.name, outbound: true, contact_id: conv.contact_id || conv.numeric_id, channel_id: conv.channel_id }
                    }));
                } else {
                    const errorMsg = result.error || 'Unknown error';
                    console.error(`%c[Call Handler] Video call failed: ${errorMsg}`, 'color: #FF0000;');

                    // Check if error is due to missing call permissions (401)
                    if (errorMsg.includes('401') || errorMsg.includes('No approved call permission')) {
                        await requestCallPermission(displayPhone);
                    } else {
                        alert(`Failed to start video call: ${errorMsg}\n\nPlease ensure:\n- WhatsApp Business API credentials are configured\n- The contact has granted call permissions\n- Video calling is enabled on your WhatsApp Business Account`);
                    }
                }
            } catch (e: any) {
                console.error('[Call Handler] Exception:', e);
                const errorMsg = e?.message || 'Unknown error';
                alert(`Error: ${errorMsg}\n\nWhatsApp Business API is not properly configured. Contact your administrator.`);
            }
        } else {
            // For non-WhatsApp, show a local video call UI
            console.log(`%c[Call Handler] Non-WhatsApp video call simulation`, 'color: #34b7f1;');
            window.dispatchEvent(new CustomEvent('whatsapp-incoming-call', {
                detail: { from: displayPhone, callId: `local_${Date.now()}`, name: conv.name, outbound: true, contact_id: conv.contact_id || conv.numeric_id }
            }));
        }
    };

    return { handleCall, handleVideoCall };
};
