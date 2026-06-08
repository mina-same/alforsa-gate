/** Convert ArrayBuffer to base64url string (no padding) */
export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Convert base64url string to ArrayBuffer */
export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Serialize a PublicKeyCredential from navigator.credentials.create()
 * into a plain object the server can parse.
 */
export function serializeRegistrationCredential(credential: PublicKeyCredential): object {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject),
      transports: response.getTransports ? response.getTransports() : [],
    },
  };
}

/**
 * Serialize a PublicKeyCredential from navigator.credentials.get()
 * into a plain object the server can parse.
 */
export function serializeAuthenticationCredential(credential: PublicKeyCredential): object {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
  };
}

/**
 * Convert server registration options for navigator.credentials.create().
 * challenge and user.id come as base64url strings; the browser needs ArrayBuffers.
 */
export function prepareRegistrationOptions(serverOptions: any): PublicKeyCredentialCreationOptions {
  return {
    ...serverOptions,
    challenge: base64urlToBuffer(serverOptions.challenge),
    user: {
      ...serverOptions.user,
      id: base64urlToBuffer(serverOptions.user.id),
    },
    excludeCredentials: (serverOptions.excludeCredentials || []).map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    })),
  };
}

/**
 * Convert server authentication options for navigator.credentials.get().
 * challenge and allowCredentials ids come as base64url strings.
 */
export function prepareAuthenticationOptions(serverOptions: any): PublicKeyCredentialRequestOptions {
  return {
    ...serverOptions,
    challenge: base64urlToBuffer(serverOptions.challenge),
    allowCredentials: (serverOptions.allowCredentials || []).map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    })),
  };
}

/** Returns true if the current browser supports WebAuthn passkeys */
export function isPasskeySupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined'
  );
}
