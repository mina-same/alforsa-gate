# WhatsApp Direct WebRTC Architecture

This document describes the "No Media Server" architecture used for WhatsApp calling in the Xontel Omnichannel Web application.

## Overview
Unlike traditional SIP calling which requires a PBX/Media Server (like Asterisk/FreePBX) to bridge audio, this application uses **Direct WebRTC** between the browser and Meta's WhatsApp infrastructure.

## Key Components
1. **Meta Graph API (Signaling):** Used to send/receive JSON control messages (SDP Handshakes).
2. **Standard WebRTC API:** Built into modern browsers (Chrome/Edge/Safari) to handle Audio/Video processing, Echo cancellation, and Encryption.
3. **STUN/TURN (ICE):** Used to traverse NAT/Firewalls.
    - *STUN:* Tells the browser its public IP address.
    - *TURN:* Relays media if the network is too restrictive for a direct connection.

## Call Flow (Direct WebRTC)

### Outbound Call (Agent -> Contact)
1. **Local Init:** The browser creates an `RTCPeerConnection` and acquires the local microphone.
2. **SDP Offer:** The browser generates a real WebRTC Offer (containing encryption fingerprints and codecs).
3. **Signaling:** The `WhatsAppService` sends this Offer to Meta via `POST /{phone-number-id}/calls` with `action: "connect"`.
4. **SDP Answer:** Meta returns an SDP Answer via a Webhook (received through our WebSocket).
5. **Media Path:** The browser applies the Answer. Encryption keys are exchanged directly via DTLS. Media flows to Meta's closest edge server.

### Incoming Call (Contact -> Agent)
1. **Event:** The server receives a webhook from Meta and sends it to the browser via WebSocket.
2. **Global Overlay:** Shows the "Incoming Call" notification.
3. **Acceptance:** When the agent clicks "Accept":
    - The browser creates an `RTCPeerConnection`.
    - It applies the remote SDP Offer from the contact.
    - It generates a local SDP Answer.
    - It sends the Answer to Meta via `POST /{phone-number-id}/calls` with `action: "accept"`.
4. **Media Path:** Once Meta receives the Answer, the media stream (audio) is established.

## Why this is better than a Media Server?
- **Lower Latency:** Audio goes direct, avoiding an extra hop through a PBX.
- **Secure:** End-to-end encryption is handled natively by the browser.
- **Cost Effective:** No need to pay for or maintain expensive VOIP servers.
- **High Quality:** Uses the OPUS codec natively for crystal-clear voice.
