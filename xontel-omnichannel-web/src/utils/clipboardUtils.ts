import { Message } from '@/types/chat';
import { normalizeMediaUrl } from '@/utils/urlHelper';

export type CopyResult = {
  success: boolean;
  message: string;
  fallbackAction?: 'download' | 'text';
};

/**
 * Checks if the Clipboard API is available and has write permission
 */
export async function checkClipboardSupport(): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'clipboard-write' as any });
    return permission.state === 'granted' || permission.state === 'prompt';
  } catch {
    // Firefox doesn't support clipboard-write permission query
    return true;
  }
}

function inferMimeTypeFromUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('.png')) return 'image/png';
  if (u.includes('.jpg') || u.includes('.jpeg')) return 'image/jpeg';
  if (u.includes('.gif')) return 'image/gif';
  if (u.includes('.webp')) return 'image/webp';
  if (u.includes('.svg')) return 'image/svg+xml';
  if (u.includes('.mp4')) return 'video/mp4';
  if (u.includes('.webm')) return 'video/webm';
  if (u.includes('.mov')) return 'video/quicktime';
  if (u.includes('.m4v')) return 'video/x-m4v';
  if (u.includes('.ogg') || u.includes('.ogv')) return 'video/ogg';
  return 'application/octet-stream';
}

function normalizeMimeType(type: string): string {
  // ClipboardItem is strict: key must match blob.type. Strip any parameters.
  return String(type || '').split(';')[0].trim();
}

async function convertImageBlobToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  ctx.drawImage(bitmap, 0, 0);

  const pngBlob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!pngBlob) {
    throw new Error('Failed to convert image to PNG');
  }
  return pngBlob;
}

/**
 * Downloads a file from URL and returns it as a blob
 */
async function fetchFileAsBlob(url: string): Promise<Blob> {
  const normalizedUrl = normalizeMediaUrl(url);

  const options: RequestInit = {
    // Many media endpoints are authenticated via cookies; include them.
    // However, if the server returns ACAO: *, 'include' will fail.
    credentials: 'include',
    cache: 'no-store',
  };

  try {
    let response: Response;
    try {
      response = await fetch(normalizedUrl, options);
    } catch (fetchError) {
      // If 'include' failed (likely a CORS issue with wildcard origin), try 'omit'
      console.warn('Fetch with credentials failed, retrying without credentials:', fetchError);
      response = await fetch(normalizedUrl, {
        ...options,
        credentials: 'omit',
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Some servers (or S3) may return blobs without a useful type.
    // ClipboardItem requires the key to match the blob's type exactly.
    const headerType = normalizeMimeType(response.headers.get('content-type') || '');
    const inferredType = headerType || inferMimeTypeFromUrl(normalizedUrl);
    const blobType = normalizeMimeType(blob.type);
    const finalType = blobType || inferredType;

    return finalType && finalType !== blobType ? new Blob([blob], { type: finalType }) : blob;
  } catch (error) {
    throw new Error(
      `Failed to download file (possible CORS/auth issue): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Copies an image to clipboard
 */
export async function copyImageToClipboard(imageUrl: string, blobOverride?: Blob): Promise<CopyResult> {
  try {
    const resolvedUrl = normalizeMediaUrl(imageUrl);
    // Always use an absolute URL for clipboard text — normalizeMediaUrl may return a
    // relative path (e.g. /media/foo.jpg) in dev, which won't work in a browser address bar.
    const absoluteUrl = /^https?:\/\//i.test(resolvedUrl)
      ? resolvedUrl
      : `${window.location.origin}${resolvedUrl.startsWith('/') ? resolvedUrl : '/' + resolvedUrl}`;

    // Clipboard binary writes require secure context (HTTPS). On localhost this is usually OK.
    if (!window.isSecureContext) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
        return { success: true, message: 'Image URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'Cannot access clipboard here (requires HTTPS / secure context)'
      };
    }

    // If ClipboardItem is missing, we can't copy the actual image bytes; copy URL as fallback.
    if (typeof ClipboardItem === 'undefined') {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
        return { success: true, message: 'Image URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'ClipboardItem is not supported in this browser'
      };
    }

    // If binary write isn't available, try URL fallback.
    if (!navigator.clipboard || !navigator.clipboard.write) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
        return { success: true, message: 'Image URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'Clipboard write is not supported in this browser/context'
      };
    }

    // Try to copy the actual image bytes.
    // Prefer a provided Blob (often already available in app state) to avoid
    // network/CORS issues and to keep clipboard write within the user gesture.
    const usableOverride = blobOverride && blobOverride.size > 0 ? blobOverride : undefined;
    const blobRaw = usableOverride ?? (await fetchFileAsBlob(resolvedUrl));
    const rawType = normalizeMimeType(blobRaw.type);
    const inferred = inferMimeTypeFromUrl(resolvedUrl);
    const finalType = rawType || inferred;
    const blob = finalType && finalType !== rawType ? new Blob([blobRaw], { type: finalType }) : blobRaw;

    // ClipboardItem requires the key MIME type to match blob.type exactly.
    const mimeType = normalizeMimeType(blob.type);
    if (!mimeType) {
      await navigator.clipboard.writeText(absoluteUrl);
      return { success: true, message: 'Image URL copied to clipboard' };
    }

    try {
      const blobForClipboard = mimeType !== normalizeMimeType(blob.type) ? new Blob([blob], { type: mimeType }) : blob;
      const urlBlob = new Blob([absoluteUrl], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({ [mimeType]: blobForClipboard, 'text/plain': urlBlob });
      await navigator.clipboard.write([clipboardItem]);
      return {
        success: true,
        message: 'Image copied to clipboard'
      };
    } catch (clipboardError) {
      try {
        const errText = String((clipboardError as any)?.message || clipboardError);
        const notSupported = errText.toLowerCase().includes('not supported');
        if (notSupported && mimeType !== 'image/png') {
          const png = await convertImageBlobToPng(blob);
          const urlBlob2 = new Blob([absoluteUrl], { type: 'text/plain' });
          const pngItem = new ClipboardItem({ 'image/png': png, 'text/plain': urlBlob2 });
          await navigator.clipboard.write([pngItem]);
          return { success: true, message: 'Image copied to clipboard' };
        }
      } catch {
        // ignore and fall back to URL
      }
      console.warn('Failed to copy image data to clipboard, falling back to URL:', clipboardError);
      try {
        await navigator.clipboard.writeText(absoluteUrl);
        return {
          success: true,
          message: 'Image URL copied to clipboard'
        };
      } catch (urlError) {
        return {
          success: false,
          message: 'Cannot copy image to clipboard (browser blocked clipboard write)'
        };
      }
    }
  } catch (error) {
    console.error('Error copying image:', error);
    try {
      const ru = normalizeMediaUrl(imageUrl);
      const au = /^https?:\/\//i.test(ru) ? ru : `${window.location.origin}${ru.startsWith('/') ? ru : '/' + ru}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(au);
        return { success: true, message: 'Image URL copied to clipboard' };
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      message: `Failed to copy image: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Copies a video to clipboard (copies URL instead of video file)
 */
export async function copyVideoToClipboard(videoUrl: string, blobOverride?: Blob): Promise<CopyResult> {
  try {
    const resolvedUrl = normalizeMediaUrl(videoUrl);

    if (!window.isSecureContext) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl);
        return { success: true, message: 'Video URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'Cannot access clipboard here (requires HTTPS / secure context)'
      };
    }

    if (typeof ClipboardItem === 'undefined') {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl);
        return { success: true, message: 'Video URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'ClipboardItem is not supported in this browser'
      };
    }

    if (!navigator.clipboard || !navigator.clipboard.write) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl);
        return { success: true, message: 'Video URL copied to clipboard' };
      }
      return {
        success: false,
        message: 'Clipboard write is not supported in this browser/context'
      };
    }

    const usableOverride = blobOverride && blobOverride.size > 0 ? blobOverride : undefined;
    const blobRaw = usableOverride ?? (await fetchFileAsBlob(resolvedUrl));
    const rawType = normalizeMimeType(blobRaw.type);
    const inferred = inferMimeTypeFromUrl(resolvedUrl);
    const finalType = rawType || inferred;
    const blob = finalType && finalType !== rawType ? new Blob([blobRaw], { type: finalType }) : blobRaw;

    const mimeType = normalizeMimeType(blob.type);
    if (!mimeType || mimeType === 'application/octet-stream') {
      await navigator.clipboard.writeText(resolvedUrl);
      return { success: true, message: 'Video URL copied to clipboard' };
    }

    try {
      const blobForClipboard = mimeType !== normalizeMimeType(blob.type) ? new Blob([blob], { type: mimeType }) : blob;
      const clipboardItem = new ClipboardItem({ [mimeType]: blobForClipboard });
      await navigator.clipboard.write([clipboardItem]);
      return {
        success: true,
        message: 'Video copied to clipboard'
      };
    } catch (clipboardError) {
      console.warn('Failed to copy video data to clipboard, falling back to URL:', clipboardError);
      try {
        await navigator.clipboard.writeText(resolvedUrl);
        return {
          success: true,
          message: 'Video URL copied to clipboard'
        };
      } catch {
        return {
          success: false,
          message: 'Cannot copy video to clipboard (browser blocked clipboard write)'
        };
      }
    }
  } catch (error) {
    try {
      const resolvedUrl = normalizeMediaUrl(videoUrl);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl);
        return { success: true, message: 'Video URL copied to clipboard' };
      }
    } catch {
    }
    return {
      success: false,
      message: `Failed to copy video: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Copies a file to clipboard (copies URL instead of file)
 */
export async function copyFileToClipboard(fileUrl: string, fileName?: string): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(normalizeMediaUrl(fileUrl));
    return {
      success: true,
      message: `${fileName || 'File'} URL copied to clipboard`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to copy file URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Downloads a file as fallback when clipboard copying fails
 */
export function downloadFile(url: string, fileName?: string): void {
  const link = document.createElement('a');
  link.href = url;
  if (fileName) {
    link.download = fileName;
  }
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Determines the media type from a message and copies appropriate content
 */
export async function copyMessageContent(message: Message): Promise<CopyResult> {
  // Debug logging to understand message structure
  console.log('copyMessageContent called with:', {
    text: message.text,
    messageType: message.message_type,
    hasMedia: !!message.media,
    mediaUrl: message.media?.url,
    mediaType: message.media?.type
  });

  // Handle media messages first (highest priority)
  if (message.media?.url) {
    const mediaTypeRaw = String(message.media.type || '').toLowerCase();
    const url = message.media.url;
    const fileName = message.media.name;

    // Backend may send a MIME type (e.g. "image/jpeg") instead of a simple "image"
    const mediaKind = mediaTypeRaw.includes('/') ? mediaTypeRaw.split('/')[0] : mediaTypeRaw;

    console.log('Processing media message:', { mediaTypeRaw, mediaKind, url, fileName });

    switch (mediaKind) {
      case 'image':
        return await copyImageToClipboard(url, message.media.blob);

      case 'video':
        return await copyVideoToClipboard(url, message.media.blob);

      case 'file':
      case 'document':
        return await copyFileToClipboard(url, fileName);

      case 'audio':
        // Copy audio URL to clipboard
        return await copyFileToClipboard(url, fileName);

      default:
        return {
          success: false,
          message: 'Unsupported media type for copying'
        };
    }
  }

  // Handle messages with image/video/audio message types but no media object
  if (message.message_type) {
    const messageType = message.message_type.toLowerCase();

    console.log('Processing message type:', messageType);

    // Try to extract URL from text for legacy messages
    const urlMatch = message.text?.match(/(https?:\/\/[^\s]+)/);

    if (messageType.includes('image') && urlMatch) {
      console.log('Found image URL in text:', urlMatch[0]);
      return await copyImageToClipboard(urlMatch[0]);
    }

    if (messageType.includes('video') && urlMatch) {
      console.log('Found video URL in text:', urlMatch[0]);
      return await copyVideoToClipboard(urlMatch[0]);
    }

    if ((messageType.includes('document') || messageType.includes('file')) && urlMatch) {
      console.log('Found file URL in text:', urlMatch[0]);
      return await copyFileToClipboard(urlMatch[0]);
    }

    if (messageType.includes('audio') && urlMatch) {
      console.log('Found audio URL in text:', urlMatch[0]);
      return await copyFileToClipboard(urlMatch[0]);
    }
  }

  // Handle text messages (including links) - only if not media
  if (message.text &&
    !message.message_type?.includes('image') &&
    !message.message_type?.includes('video') &&
    !message.message_type?.includes('document') &&
    !message.message_type?.includes('audio') &&
    message.text !== '[Image]' &&
    message.text !== '[Video]' &&
    message.text !== '[Audio]' &&
    message.text !== '[sticker]') {
    console.log('Processing as text message:', message.text);
    try {
      await navigator.clipboard.writeText(message.text);
      return {
        success: true,
        message: 'Text copied to clipboard'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to copy text: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // If we reach here, try to copy whatever text is available as last resort
  if (message.text) {
    console.log('Fallback: copying text as last resort:', message.text);
    try {
      await navigator.clipboard.writeText(message.text);
      return {
        success: true,
        message: 'Text copied to clipboard'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to copy content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  return {
    success: false,
    message: 'No content available to copy'
  };
}
