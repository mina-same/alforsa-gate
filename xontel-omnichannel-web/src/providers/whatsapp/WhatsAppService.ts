import axios from 'axios';
import { BackgroundMusicService, SoundscapeType } from '@/services/call/backgroundMusicService';
import { CallRecorder } from '@/services/call/CallRecorder';
import apiClient from '@/api/client';
import { whatsappCallsAPI } from '@/api/whatsapp-calls/endpoints';
import { channelsAPI } from '@/api/channels/endpoints';
import { ChannelResponse } from '@/api/channels/types';
import { mediaAPI } from '@/api/media/endpoints';
import { messagesAPI } from '@/api/messages/endpoints';

/**
 * WhatsApp Business Calling API Service
 * 
 * Updated to use internal backend proxy via whatsappCallsAPI
 */

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
}

export interface CallInitiatePayload {
  channelId: number;
  conversationId: number;
  contactId: number;
  to: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private appId: string;
  private appSecret: string;
  private channelId: number | null = null;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';
  private messages: Map<string, WhatsAppMessage> = new Map();
  private activePeerConnection: RTCPeerConnection | null = null;
  private activeCallId: string | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onSignalingCallback: ((data: any) => void) | null = null;
  private backgroundMusicService: BackgroundMusicService;
  private callRecorder: CallRecorder | null = null;
  private iceCandidateQueue: any[] = [];
  private currentConversationId: number | null = null;
  private currentContactId: number | null = null;
  private currentCallMessageId: number | null = null;
  private currentCallRecordingUrl: string | null = null;
  private autoRecording: boolean = true;
  private callConnected: boolean = false;
  private recordingStartTime: number = 0;
  private isOutboundCall: boolean = false;

  private currentSoundscape: SoundscapeType = 'none';



  private constructor(accessToken: string, phoneNumberId: string, businessAccountId?: string, appId?: string, appSecret?: string, channelId?: number) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.businessAccountId = businessAccountId || '';
    this.appId = appId || '';
    this.appSecret = appSecret || '';
    this.channelId = channelId || null;
    this.backgroundMusicService = BackgroundMusicService.getInstance();
  }

  /**
   * Fetch channel credentials from API
   */
  private static async fetchChannelCredentials(channelId: number): Promise<{
    accessToken: string;
    phoneNumberId: string;
    businessAccountId?: string;
    appId?: string;
    appSecret?: string;
  }> {
    try {
      const channel: ChannelResponse = await channelsAPI.getChannel(channelId);
      
      console.log(`[WhatsAppService] Fetched channel ${channelId} data`);
      
      // Extract credentials from channel.credentials object
      // Support both snake_case (API standard) and camelCase variations
      let accessToken: string | undefined;
      let phoneNumberId: string | undefined;
      let businessAccountId: string | undefined;
      let appId: string | undefined;
      let appSecret: string | undefined;

      if (channel.credentials) {
        // Non-prefixed field names (from your API response)
        accessToken = channel.credentials.access_token || 
                     channel.credentials.whatsapp_access_token || 
                     channel.credentials.accessToken;
        phoneNumberId = channel.credentials.phone_number_id || 
                       channel.credentials.whatsapp_phone_number_id || 
                       channel.credentials.phoneNumberId;
        businessAccountId = channel.credentials.business_account_id || 
                         channel.credentials.whatsapp_business_account_id || 
                         channel.credentials.businessAccountId;
        appId = channel.credentials.app_id || 
                 channel.credentials.whatsapp_app_id || 
                 channel.credentials.appId;
        appSecret = channel.credentials.app_secret || 
                   channel.credentials.whatsapp_app_secret || 
                   channel.credentials.appSecret;
      }

      // Fallback to other locations if not in credentials
      if (!accessToken) {
        accessToken = channel.whatsapp_access_token || 
                     channel.settings?.whatsapp_access_token || 
                     channel.settings?.accessToken ||
                     channel.accessToken;
      }
      
      if (!phoneNumberId) {
        phoneNumberId = channel.whatsapp_phone_number_id || 
                       channel.settings?.whatsapp_phone_number_id || 
                       channel.settings?.phoneNumberId ||
                       channel.phoneNumberId;
      }
                          
      if (!businessAccountId) {
        businessAccountId = channel.whatsapp_business_account_id || 
                           channel.settings?.whatsapp_business_account_id || 
                           channel.settings?.businessAccountId ||
                           channel.businessAccountId;
      }
                           
      if (!appId) {
        appId = channel.whatsapp_app_id || 
                 channel.settings?.whatsapp_app_id || 
                 channel.settings?.appId ||
                 channel.appId;
      }
                   
      if (!appSecret) {
        appSecret = channel.whatsapp_app_secret || 
                   channel.settings?.whatsapp_app_secret || 
                   channel.settings?.appSecret ||
                   channel.appSecret;
      }

      if (!accessToken || !phoneNumberId) {
        console.error(`[WhatsAppService] Missing credentials for channel ${channelId}`);
        throw new Error(`Channel ${channelId} missing required WhatsApp credentials`);
      }

      console.log(`[WhatsAppService] ✓ Credentials fetched for channel ${channelId}`, {
        accessToken: accessToken ? '***' + accessToken.slice(-4) : 'MISSING',
        phoneNumberId: phoneNumberId || 'MISSING',
        hasAppSecret: !!appSecret
      });

      return {
        accessToken,
        phoneNumberId,
        businessAccountId,
        appId,
        appSecret
      };
    } catch (error) {
      console.error(`[WhatsAppService] ✗ Failed to fetch credentials for channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Get or create WhatsAppService instance with channel credentials
   * Reuses existing instance if already initialized for the same channel
   */
  public static async initWithChannel(channelId: number): Promise<WhatsAppService> {
    console.log(`[WhatsAppService] initWithChannel called for channel ${channelId}`);
    
    // If instance exists and is for the same channel, reuse it
    if (WhatsAppService.instance && WhatsAppService.instance.channelId === channelId) {
      console.log(`[WhatsAppService] Reusing existing instance for channel ${channelId}`);
      return WhatsAppService.instance;
    }
    
    // If instance is for a different channel, reset it
    if (WhatsAppService.instance && WhatsAppService.instance.channelId !== channelId) {
      console.log(`[WhatsAppService] Switching from channel ${WhatsAppService.instance.channelId} to ${channelId}`);
      WhatsAppService.instance.cleanupCall(); // Cleanup any active call
      WhatsAppService.instance = null as any;
    }
    
    // Fetch credentials and create new instance
    console.log(`[WhatsAppService] Creating new instance for channel ${channelId}`);
    const credentials = await WhatsAppService.fetchChannelCredentials(channelId);
    
    WhatsAppService.instance = new WhatsAppService(
      credentials.accessToken,
      credentials.phoneNumberId,
      credentials.businessAccountId,
      credentials.appId,
      credentials.appSecret,
      channelId
    );
    
    console.log(`[WhatsAppService] ✓ Instance created for channel ${channelId}`);
    return WhatsAppService.instance;
  }

  /**
   * Get current channel ID
   */
  public getChannelId(): number | null {
    return this.channelId;
  }

  public static getInstance(
    accessToken?: string,
    phoneNumberId?: string,
    businessAccountId?: string,
    appId?: string,
    appSecret?: string
  ): WhatsAppService {
    if (!WhatsAppService.instance) {
      const token = accessToken || (import.meta as any).env.VITE_WHATSAPP_ACCESS_TOKEN;
      const phoneId = phoneNumberId || (import.meta as any).env.VITE_WHATSAPP_PHONE_NUMBER_ID;
      const businessId = businessAccountId || (import.meta as any).env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID;
      const appId_val = appId || (import.meta as any).env.VITE_WHATSAPP_APP_ID;
      const secret = appSecret || (import.meta as any).env.VITE_WHATSAPP_APP_SECRET;

      if (!token || !phoneId) {
        throw new Error('WhatsApp credentials (accessToken and phoneNumberId) required for initialization');
      }
      WhatsAppService.instance = new WhatsAppService(token, phoneId, businessId, appId_val, secret);
    }
    return WhatsAppService.instance;
  }

  /**
   * Start a voice call via internal backend proxy
   */
  public async startVoiceCall(params: CallInitiatePayload): Promise<{ success: boolean; callId?: string; error?: string }> {
    const { channelId, conversationId, contactId, to } = params;
    this.currentConversationId = conversationId;
    this.currentContactId = contactId;
    try {
      console.log(`%c[WebRTC] === STARTING VOICE CALL ===`, 'color: #25D366; font-weight: bold; font-size: 14px;');
      console.log(`[WebRTC] Channel ID: ${channelId}`);
      console.log(`[WebRTC] To: ${to}`);
      console.log(`[WebRTC] Using credentials for channel: ${this.channelId}`);
      console.log(`[WebRTC] Phone Number ID: ${this.phoneNumberId}`);
      console.log(`[WebRTC] Has Access Token: ${!!this.accessToken}`);

      const cleanPhone = to.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
        throw new Error(`Invalid phone number: ${cleanPhone}`);
      }

      console.log(`%c[WebRTC] Initiating voice call to: ${cleanPhone}`, 'color: #25D366; font-weight: bold;');

      // 1. Initialize PeerConnection
      console.log(`[WebRTC] Step 1: Creating PeerConnection...`);
      this.cleanupCall();
      this.isOutboundCall = true;
      this.activePeerConnection = this.createPeerConnection();
      this.setupPeerHandlers();

      // 2. Add Local Microphone
      console.log(`[WebRTC] Step 2: Getting microphone access...`);
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
        console.log(`[WebRTC] ✓ Microphone access granted`);
        
        // Check if we actually have audio tracks
        const audioTracks = this.localStream.getAudioTracks();
        console.log(`[WebRTC] Audio tracks found: ${audioTracks.length}`);
        if (audioTracks.length > 0) {
          console.log(`[WebRTC] Audio track label: ${audioTracks[0].label}`);
          console.log(`[WebRTC] Audio track enabled: ${audioTracks[0].enabled}`);
        }
      } catch (err) {
        console.error(`[WebRTC] ✗ Microphone access denied:`, err);
        throw new Error('Microphone permission denied or not available');
      }

      console.log(`[WebRTC] Step 3: Adding audio tracks to PeerConnection...`);
      this.localStream.getTracks().forEach(track => {
        if (this.activePeerConnection) {
          this.activePeerConnection.addTrack(track, this.localStream!);
          console.log(`[WebRTC] Added track: ${track.kind} - ${track.label}`);
        }
      });

      // 3. Create Offer and WAIT for ICE Gathering
      console.log(`[WebRTC] Step 4: Creating SDP offer...`);
      const offer = await this.activePeerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await this.activePeerConnection.setLocalDescription(offer);

      console.log(`[WebRTC] Step 5: Waiting for ICE gathering...`);
      // Wait for ICE gathering to complete (ensures candidates are in SDP)
      await this.waitForIceGathering();
      const finalOffer = this.activePeerConnection.localDescription;

      if (!finalOffer) throw new Error('Failed to generate local offer');

      console.log(`[WebRTC] Step 6: Sending call to Meta API...`);
      // 4. Send to Meta API Directly
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/calls`;
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        action: 'connect',
        session: {
          sdp_type: 'offer',
          sdp: finalOffer.sdp
        }
      };

      console.log(`[WebRTC] URL: ${url}`);
      console.log(`[WebRTC] Payload:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`%c[WebRTC] ✓ Call initiated successfully!`, 'color: #25D366; font-weight: bold;');
      console.log(`[WebRTC] Response:`, response.data);

      const callId = response.data.calls?.[0]?.id;
      this.activeCallId = callId;
      
      if (!callId) throw new Error('API returned no call ID');

      return { success: true, callId };
    } catch (error: unknown) {
      const errorMessage = this.formatError(error);
      console.error(`%c[Voice Call Failed] ✗ ${errorMessage}`, 'color: #FF0000; font-weight: bold;');
      this.cleanupCall();
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Start a video call via internal backend proxy
   */
  public async startVideoCall(params: CallInitiatePayload): Promise<{ success: boolean; callId?: string; error?: string }> {
    const { channelId, conversationId, contactId, to } = params;
    this.currentConversationId = conversationId;
    this.currentContactId = contactId;
    try {
      console.log(`%c[WebRTC] === STARTING VIDEO CALL ===`, 'color: #25D366; font-weight: bold; font-size: 14px;');
      console.log(`[WebRTC] Channel ID: ${channelId}`);
      console.log(`[WebRTC] To: ${to}`);
      console.log(`[WebRTC] Using credentials for channel: ${this.channelId}`);
      console.log(`[WebRTC] Phone Number ID: ${this.phoneNumberId}`);

      const cleanPhone = to.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
        throw new Error(`Invalid phone number: ${cleanPhone}`);
      }

      console.log(`%c[WebRTC] Initiating video call to: ${cleanPhone}`, 'color: #25D366; font-weight: bold;');

      // Initialize PC
      console.log(`[WebRTC] Step 1: Creating PeerConnection...`);
      this.cleanupCall();
      this.isOutboundCall = true;
      this.activePeerConnection = this.createPeerConnection();
      this.setupPeerHandlers();

      // Add Audio & Video Tracks
      console.log(`[WebRTC] Step 2: Getting camera and microphone access...`);
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }, 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        console.log(`[WebRTC] ✓ Camera and microphone access granted`);
        
        const audioTracks = this.localStream.getAudioTracks();
        const videoTracks = this.localStream.getVideoTracks();
        console.log(`[WebRTC] Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);
      } catch (err) {
        console.error(`[WebRTC] ✗ Camera/microphone access denied:`, err);
        throw new Error('Camera/microphone permission denied');
      }

      console.log(`[WebRTC] Step 3: Adding tracks to PeerConnection...`);
      this.localStream.getTracks().forEach(track => {
        if (this.activePeerConnection) {
          this.activePeerConnection.addTrack(track, this.localStream!);
          console.log(`[WebRTC] Added track: ${track.kind} - ${track.label}`);
        }
      });

      console.log(`[WebRTC] Step 4: Creating SDP offer...`);
      const offer = await this.activePeerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.activePeerConnection.setLocalDescription(offer);

      console.log(`[WebRTC] Step 5: Waiting for ICE gathering...`);
      await this.waitForIceGathering();
      const finalOffer = this.activePeerConnection.localDescription;

      console.log(`[WebRTC] Step 6: Sending video call to Meta API...`);
      // Send to Meta API Directly
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/calls`;
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        action: 'connect',
        session: {
          sdp_type: 'offer',
          sdp: finalOffer?.sdp || offer.sdp || ''
        }
      };

      console.log(`[WebRTC] URL: ${url}`);
      console.log(`[WebRTC] Payload:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log(`%c[WebRTC] ✓ Video call initiated successfully!`, 'color: #25D366; font-weight: bold;');
      console.log(`[WebRTC] Response:`, response.data);

      const callId = response.data.calls?.[0]?.id;
      this.activeCallId = callId;
      
      return { success: true, callId };
    } catch (error: unknown) {
      const errorMessage = this.formatError(error);
      console.error(`%c[Video Call Failed] ✗ ${errorMessage}`, 'color: #FF0000; font-weight: bold;');
      this.cleanupCall();
      return { success: false, error: errorMessage };
    }
  }

  private setupPeerHandlers() {
    if (!this.activePeerConnection) return;

    this.activePeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`%c[WebRTC] ICE Candidate: ${event.candidate.candidate.substring(0, 30)}...`, 'color: #888; font-size: 10px;');

        // Send candidate to remote peer via signaling callback
        if (this.onSignalingCallback && this.activeCallId) {
          this.onSignalingCallback({
            call_id: this.activeCallId,
            event: 'candidate',
            candidate: event.candidate.candidate,
            sdp_mid: event.candidate.sdpMid,
            sdp_m_line_index: event.candidate.sdpMLineIndex
          });
        }
      }
    };

    this.activePeerConnection.onicecandidateerror = (event) => {
      console.warn('[WebRTC] ICE Candidate Error:', (event as any).errorCode, (event as any).url);
    };

    this.activePeerConnection.onconnectionstatechange = () => {
      const state = this.activePeerConnection?.connectionState;
      console.log(`%c[WebRTC] Connection State: ${state}`, 'color: #34b7f1; font-weight: bold;');

      if (state === 'connected') {
        console.log('%c[WebRTC] PeerConnection connected (media path open).', 'color: #25D366; font-weight: bold;');
        this.callConnected = true;

        // For inbound calls start recording immediately on connect.
        // For outbound calls recording starts only after the call_accepted socket event.
        if (this.autoRecording && !this.isOutboundCall) {
            this.startAutoRecording();
        }
      }

      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        if (state === 'disconnected') {
          // Wait a bit to see if it reconnects, if not cleanup
          setTimeout(() => {
            if (this.activePeerConnection?.connectionState === 'disconnected') {
              this.handleTermination('ice_disconnected');
            }
          }, 5000);
        } else {
          this.handleTermination('connection_' + state);
        }
      }
    };

    this.activePeerConnection.oniceconnectionstatechange = () => {
      const state = this.activePeerConnection?.iceConnectionState;
      console.log(`%c[WebRTC] ICE State: ${state}`, 'color: #34b7f1;');
      if (state === 'failed' || state === 'closed') {
        this.handleTermination('ice_' + state);
      }
    };

    this.activePeerConnection.ontrack = (event) => {
      console.log('%c[WebRTC] Remote Track received', 'color: #25D366; font-weight: bold;');

      // Ensure we have a stream (browsers behave differently here)
      const stream = event.streams[0] || new MediaStream([event.track]);
      this.remoteStream = stream;

      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }

      // Start recording if connection is already established (inbound only)
      if (this.autoRecording && !this.isOutboundCall && !this.callRecorder && this.activePeerConnection?.connectionState === 'connected') {
          this.startAutoRecording();
      }
    };
  }

  private handleTermination(reason: string) {
    if (!this.activePeerConnection && !this.localStream) return;
    console.log(`%c[WebRTC] Terminal action triggered by: ${reason}`, 'color: #FF0000; font-weight: bold;');
    this.cleanupCall();
    if (this.onCallEndedCallback) this.onCallEndedCallback();
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  public async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.data.messages[0].id;

      // Store message locally
      this.messages.set(messageId, {
        id: messageId,
        from: this.phoneNumberId,
        to: phoneNumber,
        text: message,
        timestamp: Date.now(),
        type: 'outgoing'
      });

      return { success: true, messageId };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending WhatsApp message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle incoming webhook messages
   */
  public handleWebhookMessage(data: any): WhatsAppMessage | null {
    try {
      const entry = data.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages?.[0];

      if (!messages) return null;

      const message: WhatsAppMessage = {
        id: messages.id,
        from: messages.from,
        to: value.metadata.phone_number_id,
        text: messages.text?.body || '',
        timestamp: parseInt(messages.timestamp) * 1000,
        type: 'incoming'
      };

      // Store message locally
      this.messages.set(message.id, message);

      return message;
    } catch (error) {
      console.error('Error processing webhook message:', error);
      return null;
    }
  }

  /**
   * Get message history
   */
  public getMessages(): WhatsAppMessage[] {
    return Array.from(this.messages.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get messages for a specific contact
   */
  public getMessagesWithContact(phoneNumber: string): WhatsAppMessage[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.from === phoneNumber || msg.to === phoneNumber)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Mark message as read
   */
  public async markAsRead(messageId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;

      await axios.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Verify webhook token
   */
  public verifyWebhookToken(token: string): boolean {
    return token === "EAAL4O19ZC3oMBQC5HTqxhTiEarwAQcKJhfsZAVDZAM4ZBkrU7eZBiinKkUhh2sYxhHWQDyQ48efFSH0FZC7Bvgni5eEPxlA8ZAvrjsfZAr1rTboyNOMIUKFUwFvoJWSZCEjiN4agw64bZBlVhj67URrHHiygvXqhOUBK7qB53hyGY16Nw7cIiuXbk6PtAlbrSVLPEwZAKFDyexXjhUkqgbYgQ8rMv2vQHniBl7UofHF2UuoJlCLuGwtYNyapAeksyQU0RxhfFZCL1PA7IdJQYk6zJjTUcU56";
  }

  public getPhoneNumberId(): string {
    return this.phoneNumberId;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Set callback for remote stream (to be used in UI)
   */
  public onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for signaling messages (to be sent via WebSocket)
   */
  public onSignaling(callback: (data: any) => void) {
    this.onSignalingCallback = callback;
  }

  /**
   * Set callback for call ended
   */
  public onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback;
  }

  /**
   * Set the specific message ID for the call log message (from socket)
   */
  public setCallMessageId(messageId: number, conversationId?: number): void {
    console.log(`%c[WhatsAppService] setCallMessageId: ${messageId} (Conv: ${conversationId || this.currentConversationId})`, 'color: #34b7f1; font-weight: bold;');
    this.currentCallMessageId = messageId;
    
    const targetConvId = conversationId || this.currentConversationId;

    // If we already have the recording URL, update it now
    if (this.currentCallRecordingUrl) {
      if (targetConvId) {
        console.log('[WhatsAppService] Recording URL exists, triggering update now.');
        this.updateCallMessageWithRecording(targetConvId, this.currentCallRecordingUrl, messageId);
        this.currentCallRecordingUrl = null;
      } else {
        console.error('[WhatsAppService] ✗ Cannot update message: Both currentConversationId and passed conversationId are missing');
      }
    } else {
      console.log('[WhatsAppService] Stored message ID, waiting for recording upload to complete...');
    }
  }

  /**
   * Utility to wait for ICE gathering to complete before sending SDP
   */
  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.activePeerConnection) return resolve();
      if (this.activePeerConnection.iceGatheringState === 'complete') return resolve();

      const checkState = () => {
        if (this.activePeerConnection?.iceGatheringState === 'complete') {
          this.activePeerConnection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      this.activePeerConnection.addEventListener('icegatheringstatechange', checkState);

      // Safety timeout (ICE gathering should take < 2s for host/srflx candidates)
      setTimeout(() => {
        this.activePeerConnection?.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 5000);
    });
  }

  /**
   * Handle Signaling from Webhook/Socket
   */
  public async handleCallSignaling(callData: any, channelId?: number) {
    const { id: callId, event, session, from, to } = callData;
    const activeChannelId = channelId ?? callData.channel_id;

    // Track metadata for incoming calls if available
    if (callData.contact_id) this.currentContactId = callData.contact_id;
    if (callData.conversation_id) this.currentConversationId = callData.conversation_id;

    console.log(`%c[WebRTC] === HANDLE CALL SIGNALING ===`, 'color: #25D366; font-weight: bold; font-size: 14px;');
    console.log(`[WebRTC] Event: ${event}`);
    console.log(`[WebRTC] Call ID: ${callId}`);
    console.log(`[WebRTC] From: ${from}`);
    console.log(`[WebRTC] Channel ID: ${activeChannelId}`);
    console.log(`[WebRTC] Current instance channel: ${this.channelId}`);
    console.log(`[WebRTC] Phone Number ID: ${this.phoneNumberId}`);

    try {
      if (event === 'candidate' || event === 'ice_candidate') {
        const candidateValue = callData.candidate || session?.candidate;
        if (candidateValue) {
          if (this.activePeerConnection && this.activePeerConnection.remoteDescription) {
            console.log('%c[WebRTC] Applying remote ICE Candidate', 'color: #888; font-size: 10px;');
            await this.activePeerConnection.addIceCandidate(new RTCIceCandidate({
              candidate: candidateValue,
              sdpMid: callData.sdp_mid || session?.sdp_mid,
              sdpMLineIndex: callData.sdp_m_line_index || session?.sdp_m_line_index
            }));
          } else {
            console.log('%c[WebRTC] Queuing ICE Candidate (PC or RemoteDesc not ready)', 'color: #f59e0b; font-size: 10px;');
            this.iceCandidateQueue.push({
              candidate: candidateValue,
              sdpMid: callData.sdp_mid || session?.sdp_mid,
              sdpMLineIndex: callData.sdp_m_line_index || session?.sdp_m_line_index
            });
          }
        }
        return;
      }

      if ((event === 'connect' || event === 'sdp_offer' || event === 'sdp_answer')) {
        console.log(`%c[WebRTC] Signaling: ${event} from ${from || 'remote'}`, 'color: #34b7f1; font-weight: bold;');

        // 1. Initialize PeerConnection if not exists
        if (!this.activePeerConnection) {
          console.log(`[WebRTC] Creating new PeerConnection for incoming call`);
          this.activePeerConnection = this.createPeerConnection();
          this.setupPeerHandlers();

          // Add Local Tracks
          console.log(`[WebRTC] Getting microphone access for incoming call...`);
          if (!this.localStream) {
            try {
              this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true
                },
                video: false
              });
              console.log(`[WebRTC] ✓ Microphone access granted for incoming call`);
              
              const audioTracks = this.localStream.getAudioTracks();
              console.log(`[WebRTC] Audio tracks found: ${audioTracks.length}`);
              if (audioTracks.length > 0) {
                console.log(`[WebRTC] Audio track enabled: ${audioTracks[0].enabled}`);
              }
            } catch (err) {
              console.error(`[WebRTC] ✗ Microphone access denied:`, err);
              throw new Error('Microphone permission denied');
            }
          }
          
          console.log(`[WebRTC] Adding local tracks to PeerConnection...`);
          this.localStream.getTracks().forEach(track => {
            if (this.activePeerConnection) {
              this.activePeerConnection.addTrack(track, this.localStream!);
              console.log(`[WebRTC] Added track: ${track.kind} - ${track.label}`);
            }
          });
        }

        if (session?.sdp_type === 'offer') {
          console.log(`[WebRTC] Processing SDP OFFER from remote party`);
          
          // Store Call ID for tracking
          this.activeCallId = callId;

          // Incoming Call: Apply remote offer
          console.log(`[WebRTC] Setting remote description (offer)...`);
          await this.activePeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: 'offer',
            sdp: session.sdp
          }));

          // Apply any queued candidates
          if (this.iceCandidateQueue.length > 0) {
            console.log(`%c[WebRTC] Applying ${this.iceCandidateQueue.length} queued candidates`, 'color: #25D366; font-weight: bold;');
            for (const cand of this.iceCandidateQueue) {
              try {
                await this.activePeerConnection.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('[WebRTC] Failed to apply queued candidate:', e);
              }
            }
            this.iceCandidateQueue = [];
          }

          // Create answer
          console.log(`[WebRTC] Creating SDP answer...`);
          const answer = await this.activePeerConnection.createAnswer();
          await this.activePeerConnection.setLocalDescription(answer);

          // IMPORTANT: Wait for ICE gathering to include our candidates in the answer
          // Meta's Calling API requires candidates in the initial SDP exchange
          console.log(`[WebRTC] Waiting for ICE gathering...`);
          await this.waitForIceGathering();
          const finalAnswer = this.activePeerConnection.localDescription;

          if (!finalAnswer) throw new Error('Failed to generate local answer');

          console.log(`[WebRTC] Sending answer back to caller via Meta API...`);
          // Send answer back to contact via Meta API Directly
          // Using 'from' which is the phone number of the caller
          await this.acceptCall(callId, finalAnswer.sdp, from);

          console.log(`%c[WebRTC] ✓ Incoming call accepted successfully`, 'color: #25D366; font-weight: bold;');
          return { type: 'incoming_call', from, callId };
        } else if (session?.sdp_type === 'answer') {
          console.log(`[WebRTC] Processing SDP ANSWER for outbound call`);
          
          // Store Call ID if not already (for outbound)
          if (!this.activeCallId) this.activeCallId = callId;

          // Outbound Call response: Apply remote answer
          console.log('%c[WebRTC] Applying remote Answer', 'color: #25D366;');
          
          if (this.activePeerConnection && this.activePeerConnection.signalingState === 'stable') {
            console.log('%c[WebRTC] PeerConnection is already stable, ignoring duplicate answer', 'color: #888;');
            return { type: 'call_connected', from, callId };
          }

          console.log(`[WebRTC] Setting remote description (answer)...`);
          await this.activePeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: session.sdp
          }));

          // Apply any queued candidates
          if (this.iceCandidateQueue.length > 0) {
            console.log(`%c[WebRTC] Applying ${this.iceCandidateQueue.length} queued candidates`, 'color: #25D366; font-weight: bold;');
            for (const cand of this.iceCandidateQueue) {
              try {
                await this.activePeerConnection.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('[WebRTC] Failed to apply queued candidate:', e);
              }
            }
            this.iceCandidateQueue = [];
          }
          
          console.log(`%c[WebRTC] ✓ Outbound call connected`, 'color: #25D366; font-weight: bold;');
          return { type: 'call_connected', from, callId };
        }
      }

      if (event === 'terminate') {
        // Only terminate if the ID matches or if we don't have an ID (legacy)
        if (!this.activeCallId || this.activeCallId === callId) {
          console.log(`[WebRTC] Terminating call due to signal`);
          this.handleTermination('signaling_terminate');
        } else {
          console.log(`%c[WebRTC] Ignoring terminate event for different call ID: ${callId}`, 'color: #888;');
        }
      }
    } catch (error) {
      console.error('[WebRTC] Error handling signaling:', error);
      this.cleanupCall();
      throw error;
    }
  }

  private async acceptCall(callId: string, sdp: string, contactPhone: string) {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/calls`;
    const payload = {
      messaging_product: 'whatsapp',
      to: contactPhone,
      action: 'accept',
      call_id: callId,
      session: {
        sdp: sdp,
        sdp_type: 'answer'
      }
    };

    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('%c[WebRTC] Answer (Accept) sent to Meta Directly', 'color: #25D366; font-weight: bold;');
  }

  public async endCall(callId: string, channelId?: number) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/calls`;
      await axios.post(url, {
        messaging_product: 'whatsapp',
        action: 'terminate',
        call_id: callId
      }, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('%c[WebRTC] Terminate signal sent to Meta (Direct)', 'color: #FF0000;');
      this.cleanupCall();
    } catch (error) {
      console.error('Error ending call:', error);
      this.cleanupCall();
    }
  }

  /**
   * Toggle microphone (mute/unmute)
   */
  public toggleMic(muted: boolean) {
    // 1. Update tracks in Local Stream
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }

    // 2. Update tracks in Peer Connection senders (important for WebRTC transmission)
    if (this.activePeerConnection) {
      this.activePeerConnection.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = !muted;
        }
      });
    }

    console.log(`%c[WebRTC] Microphone ${muted ? 'MUTED' : 'UNMUTED'}`, 'color: #34b7f1; font-weight: bold;');
  }

  /**
   * Toggle video (camera on/off)
   */
  public toggleVideo(videoOff: boolean) {
    // 1. Update tracks in Local Stream
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoOff;
      });
    }

    // 2. Update tracks in Peer Connection senders
    if (this.activePeerConnection) {
      this.activePeerConnection.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          sender.track.enabled = !videoOff;
        }
      });
    }

    console.log(`%c[WebRTC] Video ${videoOff ? 'OFF' : 'ON'}`, 'color: #34b7f1; font-weight: bold;');
  }

  /**
   * Play background soundscape (closes mic and adds music)
   */
  public async playSoundscape(soundscapeId: SoundscapeType): Promise<void> {
    try {
      // If requesting 'none', stop soundscape and unmute mic
      if (soundscapeId === 'none') {
        await this.stopSoundscape();
        return;
      }

      // Mute microphone when playing soundscape
      this.toggleMic(true);

      console.log(`%c[WhatsApp] Starting soundscape: ${soundscapeId}`, 'color: #25D366; font-weight: bold;');

      // Play the soundscape (passes local stream for mixing)
      await this.backgroundMusicService.playSoundscape(soundscapeId, this.localStream || undefined);

      // Wait a bit for audio to start playing and mixing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get the mixed stream (soundscape + mic) and replace WebRTC audio track
      const mixedStream = this.backgroundMusicService.getMixedStream();
      console.log(`%c[WhatsApp] Mixed stream available: ${!!mixedStream}, tracks: ${mixedStream?.getTracks().length || 0}`, 'color: #25D366; font-size: 10px;');

      if (mixedStream && this.activePeerConnection) {
        const mixedAudioTracks = mixedStream.getAudioTracks();
        console.log(`%c[WhatsApp] Audio tracks in mixed stream: ${mixedAudioTracks.length}`, 'color: #25D366; font-size: 10px;');

        if (mixedAudioTracks.length > 0) {
          const mixedAudioTrack = mixedAudioTracks[0];

          // Find and replace the audio sender
          const senders = await this.activePeerConnection.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio');

          console.log(`%c[WhatsApp] Audio sender found: ${!!audioSender}`, 'color: #25D366; font-size: 10px;');

          if (audioSender) {
            await audioSender.replaceTrack(mixedAudioTrack);
            console.log('%c[WhatsApp] ✓ Soundscape track sent to remote peer', 'color: #25D366; font-weight: bold;');
          } else {
            console.warn('[WhatsApp] No audio sender found in peer connection');
          }
        } else {
          console.warn('[WhatsApp] Mixed stream has no audio tracks');
        }
      } else {
        console.warn(`[WhatsApp] Cannot send soundscape - Mixed stream: ${!!mixedStream}, Peer connection: ${!!this.activePeerConnection}`);
      }

      this.currentSoundscape = soundscapeId;
    } catch (error) {
      console.error('[WhatsApp] Failed to play soundscape:', error);
    }
  }

  /**
   * Stop current soundscape and unmute mic
   */
  public async stopSoundscape(): Promise<void> {
    await this.backgroundMusicService.stopSoundscape();

    // Restore original microphone track to WebRTC
    if (this.localStream && this.activePeerConnection) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        try {
          const senders = await this.activePeerConnection.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio');
          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
            console.log('%c[WhatsApp] Original mic track restored', 'color: #34b7f1; font-weight: bold;');
          }
        } catch (error) {
          console.error('[WhatsApp] Failed to restore mic track:', error);
        }
      }
    }

    // Unmute microphone
    this.toggleMic(false);
    this.currentSoundscape = 'none';
  }

  /**
   * Toggle soundscape (turn on/off)
   */
  public async toggleSoundscape(soundscapeId: SoundscapeType): Promise<void> {
    if (this.currentSoundscape === soundscapeId && this.backgroundMusicService.isPlaying()) {
      this.stopSoundscape();
    } else {
      await this.playSoundscape(soundscapeId);
    }
  }

  /**
   * Get current soundscape
   */
  public getCurrentSoundscape(): SoundscapeType {
    return this.currentSoundscape;
  }

  /**
   * Set soundscape volume
   */
  public setSoundscapeVolume(volume: number): void {
    this.backgroundMusicService.setVolume(volume);
  }

  /**
   * Start manual recording of the call
   */
  public async startManualRecording(): Promise<void> {
    try {
      if (!this.localStream || !this.remoteStream) {
        throw new Error('No active call streams available for recording');
      }

      if (this.callRecorder) {
        console.warn('[WhatsApp] Recording already in progress, stopping previous recording...');
        this.callRecorder.stopRecording();
      }

      this.callRecorder = new CallRecorder();
      this.callRecorder.startRecording(this.localStream, this.remoteStream);
      console.log('%c[WhatsApp] Manual recording started', 'color: #ff5722; font-weight: bold;');
    } catch (error) {
      console.error('[WhatsApp] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop manual recording of the call
   */
  public async stopManualRecording(): Promise<void> {
    try {
      if (!this.callRecorder) {
        throw new Error('No active recording');
      }

      await this.callRecorder.stopRecording();
      console.log('%c[WhatsApp] Manual recording stopped and file saved', 'color: #4caf50; font-weight: bold;');
      this.callRecorder = null;
    } catch (error) {
      console.error('[WhatsApp] Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Called when the remote party accepts an outbound call (via socket call_accepted event).
   * Starts recording at that point so declined/missed calls are never recorded.
   */
  public notifyCallAccepted(): void {
    if (!this.isOutboundCall) return; // inbound handled by WebRTC connected state
    console.log('%c[WhatsApp] notifyCallAccepted — starting recording for outbound call', 'color: #25D366; font-weight: bold;');
    if (this.autoRecording) {
      this.startAutoRecording();
    }
  }

  /**
   * Start automatic recording of the call (no download)
   */
  private async startAutoRecording(): Promise<void> {
    try {
      if (!this.localStream || !this.remoteStream) {
        console.warn('[WhatsApp] No active call streams available for auto-recording');
        return;
      }

      if (this.callRecorder) {
        console.warn('[WhatsApp] Recording already in progress');
        return;
      }

      this.callRecorder = new CallRecorder();
      this.callRecorder.startRecording(this.localStream, this.remoteStream, false); // false = no auto download
      this.recordingStartTime = Date.now();
      console.log('%c[WhatsApp] Automatic recording started', 'color: #ff5722; font-weight: bold;');
    } catch (error) {
      console.error('[WhatsApp] Failed to start auto-recording:', error);
    }
  }

  /**
   * Handle completion of call and upload recording
   */
  private async handleAutoRecordingUpload(): Promise<void> {
    const recorder = this.callRecorder;
    if (!recorder) {
        console.warn('[WhatsApp] No active recorder found during cleanup');
        return;
    }
    this.callRecorder = null; // Clear immediately to prevent double triggers

    try {
      console.log('%c[WhatsApp] === TERMINATING RECORDING ===', 'color: #34b7f1; font-weight: bold;');
      const recordingBlob = await recorder.stopRecording();

      if (!recordingBlob || recordingBlob.size < 100) {
        console.warn('[WhatsApp] Recording blob is empty or too small (size: ' + (recordingBlob?.size || 0) + '), skipping upload');
        return;
      }

      const recordingDuration = Date.now() - this.recordingStartTime;
      if (recordingDuration < 3000) {
        console.warn(`[WhatsApp] Recording too short (${recordingDuration}ms) — call was likely declined or missed. Skipping upload.`);
        return;
      }

      console.log(`[WhatsApp] Recording stopped. Size: ${(recordingBlob.size / 1024).toFixed(2)}KB. Starting upload...`);

      // Convert Blob to File
      const file = new File([recordingBlob], `call-recording-${Date.now()}.webm`, { type: 'audio/webm' });

      // Upload to media API
      const uploadResponse = await mediaAPI.uploadMedia(file);
      console.log('%c[WhatsApp] ✓ Recording uploaded successfully:', 'color: #25D366; font-weight: bold;', uploadResponse.url);
      
      this.currentCallRecordingUrl = uploadResponse.url;

      const capturedConvId = this.currentConversationId;
      const capturedRecordingUrl = uploadResponse.url;

      // Handle the update synchronization
      if (this.currentCallMessageId) {
        console.log(`[WhatsApp] Current call message ID is ${this.currentCallMessageId}, updating now.`);
        await this.updateCallMessageWithRecording(capturedConvId!, capturedRecordingUrl, this.currentCallMessageId);
      } else {
        console.log('[WhatsApp] No call message ID yet, scheduling fallback search in 10s...');
        // Fallback search after 10 seconds if no socket message arrives
        setTimeout(async () => {
          console.log('[WhatsApp] Fallback search triggered for recording:', capturedRecordingUrl);
          await this.updateCallMessageWithRecording(capturedConvId!, capturedRecordingUrl);
        }, 10000);
      }
    } catch (error) {
      console.error('[WhatsApp] ✗ Failed to handle recording upload:', error);
    } finally {
        console.log('[WhatsApp] handleAutoRecordingUpload cleanup.');
        // Clear message ID after attempt, but keep active conversation context if needed?
        // Actually, we've captured what we need.
        this.currentCallMessageId = null;
        // Don't clear this.currentConversationId if it might be used by something else?
        // But the task is finished for this call.
    }
  }

  /**
   * Update the call message with the recording URL
   */
  private async updateCallMessageWithRecording(conversationId: number, recordingUrl: string, messageId?: number): Promise<void> {
    console.log(`[WhatsApp] updateCallMessageWithRecording started (Conv: ${conversationId}, MsgID: ${messageId}, URL: ${recordingUrl.substring(0, 50)}...)`);
    try {
      let targetMessageId = messageId || this.currentCallMessageId;

      if (!targetMessageId) {
        if (!conversationId) {
            console.error('[WhatsApp] ✗ Cannot search for call message: conversationId is null');
            return;
        }
        console.log(`[WhatsApp] Searching for latest call message in conversation ${conversationId}...`);
        
        const messages = await messagesAPI.listConversationMessages(conversationId, {
          limit: 10,
          message_type: 'calls'
        });

        console.log(`[WhatsApp] Found ${messages?.items?.length || 0} recent call messages`);

        if (messages?.items && messages.items.length > 0) {
          const latestMessage = [...messages.items].sort((a, b) => b.id - a.id)[0];
          targetMessageId = latestMessage.id;
          console.log(`[WhatsApp] Found latest call message via search: ${targetMessageId}`);
        }
      }

      console.log(`[WhatsApp] targetMessageId resolved: ${targetMessageId}`);

      if (targetMessageId) {
        // Fetch the existing message to preserve its current additional_attributes
        let existingAttributes: Record<string, any> = {};
        try {
          const existingMessage = await messagesAPI.getMessage(targetMessageId as number);
          if (existingMessage.additional_attributes) {
            existingAttributes = typeof existingMessage.additional_attributes === 'string'
              ? JSON.parse(existingMessage.additional_attributes)
              : existingMessage.additional_attributes;
          }
        } catch (fetchErr) {
          console.warn('[WhatsApp] Could not fetch existing message attributes, will only set recording_url:', fetchErr);
        }

        const agentData = (() => {
          try {
            const stored = localStorage.getItem("currentUser");
            return stored ? JSON.parse(stored) : null;
          } catch { return null; }
        })();

        const mergedAttributes = {
          ...existingAttributes,
          recording_url: recordingUrl,
          ...(agentData ? { agent: agentData } : {}),
        };
        const updatePayload = {
          additional_attributes: JSON.stringify(mergedAttributes)
        };
        console.log(`[WhatsApp] Executing updateMessage for ID: ${targetMessageId}`, updatePayload);

        try {
          const result = await messagesAPI.updateMessage(targetMessageId as number, updatePayload);
          console.log('%c[WhatsApp] ✓ API SUCCESS:', 'color: #25D366; font-weight: bold;', result);
        } catch (apiErr) {
          console.error('[WhatsApp] ✗ API call failed:', apiErr);
          throw apiErr; // rethrow to be caught by outer catch
        }
      } else {
        console.error('[WhatsApp] ✗ No message ID resolved. Cannot update message attributes.');
      }
    } catch (error) {
      console.error('[WhatsApp] ✗ Error in updateCallMessageWithRecording:', error);
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      if ((error as any).response?.data) {
        const data = (error as any).response.data;
        return `API Error: ${data.error?.message || JSON.stringify(data)}`;
      }
      return error.message;
    }
    return String(error);
  }

  private createPeerConnection(): RTCPeerConnection {
    return new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });
  }

  private cleanupCall() {
    console.log('[WhatsApp] Cleaning up call resources...');

    // 1. Stop recording and start upload FIRST, while streams are still active
    // Only upload if the call actually connected — skip for declined/missed calls
    if (this.callRecorder && this.callConnected) {
      this.handleAutoRecordingUpload();
    } else if (this.callRecorder) {
      console.log('[WhatsApp] Call never connected (declined/missed) — discarding recorder without upload.');
      this.callRecorder = null;
    }
    this.callConnected = false;

    // 2. Then close PC and stop tracks
    if (this.activePeerConnection) {
      this.activePeerConnection.close();
      this.activePeerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
          console.log(`[WhatsApp] Stopping local track: ${track.kind}`);
          track.stop();
      });
      this.localStream = null;
    }
    this.remoteStream = null;
    this.activeCallId = null;
    this.iceCandidateQueue = [];
    this.currentCallRecordingUrl = null;
    this.isOutboundCall = false;
  }
}

/**
 * Generate a call permission request message text
 * As per Meta documentation: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/user-call-permissions#how-to-send-a-free-form-call-permission-request-message
 */
export function generateCallPermissionRequestMessage(): string {
  return `Hi, we'd like to be able to call you to better assist with your needs. Could you please enable calling permissions for our business on WhatsApp? You can do this by:

1. Opening our business profile in WhatsApp
2. Tapping the menu icon (three dots)
3. Selecting "Calling permissions" or granting call access

Thank you!`;
}

export const initWhatsAppService = (accessToken: string, phoneNumberId: string, businessAccountId: string) => {
  return WhatsAppService.getInstance(accessToken, phoneNumberId, businessAccountId);
};
