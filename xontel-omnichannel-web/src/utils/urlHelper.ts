/**
 * Utility function to normalize URLs that may not have protocol prefix
 * Uses environment variable for media URL prefix
 */
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Fix common malformed absolute URLs (missing colon), e.g. "https//example.com".
  const fixedProtocol = trimmed
    .replace(/^https\//i, 'https://')
    .replace(/^http\//i, 'http://');
  
  // If URL already has protocol or is a blob URL, return as-is
  if (/^https?:\/\//i.test(fixedProtocol) || /^blob:/i.test(fixedProtocol)) {
    if (import.meta.env?.DEV) {
      try {
        const u = new URL(fixedProtocol);
        if (u.origin === window.location.origin && u.pathname.startsWith('/media/')) {
          return u.pathname + u.search + u.hash;
        }
      } catch {
        // ignore
      }
    }

    return fixedProtocol;
  }

  if (fixedProtocol.startsWith('/')) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const mediaOrigin = isLocalhost
      ? (import.meta.env.VITE_API_URL_MEDIA)
      : window.location.origin;
    return `${mediaOrigin}${fixedProtocol}`;
  }

  // If it looks like a hostname without protocol (e.g. example.com/path), force https://
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?=\/|$)/i.test(fixedProtocol)) {
    return `https://${fixedProtocol}`;
  }
  
  // Prepend protocol prefix derived from current page
  const prefix = `${window.location.protocol}//`;
  return `${prefix}${fixedProtocol}`;
}






type ThumbnailSize = '128x128' | '320x180' | '640x360' | '1280x720'

export function getThumbnailUrl(url: string | null | undefined, size: ThumbnailSize): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (/^(blob:|data:)/i.test(trimmed)) return null

  // For absolute URLs use URL parsing so dots in the hostname are not mistaken for the extension.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      const lastSlash = u.pathname.lastIndexOf('/')
      const filename = u.pathname.slice(lastSlash + 1)
      const dotIndex = filename.lastIndexOf('.')
      if (dotIndex === -1) return null
      u.pathname = u.pathname.slice(0, lastSlash + 1 + dotIndex) + `_${size}.jpg`
      return u.toString()
    } catch {
      return null
    }
  }

  // For relative paths (e.g. /media/file.jpg) the string contains no hostname dots,
  // so lastIndexOf('.') reliably finds the extension.
  const qIdx = trimmed.indexOf('?')
  const pathPart = qIdx === -1 ? trimmed : trimmed.slice(0, qIdx)
  const dotIndex = pathPart.lastIndexOf('.')
  if (dotIndex === -1) return null
  const query = qIdx === -1 ? '' : trimmed.slice(qIdx)
  return `${pathPart.slice(0, dotIndex)}_${size}.jpg${query}`
}


export function extractLatLngFromGoogleMaps(url: string) {
  let latitude: number | null = null;
  let longitude: number | null = null;
  let name: string | null = null;
  let address: string | null = null;

  // 1️⃣ Extract latitude & longitude: try !3dLAT!4dLNG first (most precise)
  const dataMatches = [...url.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)];
  if (dataMatches.length > 0) {
    // Take the **last match** as the main place
    const lastMatch = dataMatches[dataMatches.length - 1];
    latitude = parseFloat(lastMatch[1]);
    longitude = parseFloat(lastMatch[2]);
  } else {
    // fallback: @lat,lng in URL
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      latitude = parseFloat(atMatch[1]);
      longitude = parseFloat(atMatch[2]);
    }
  }

  // 2️⃣ Extract place name & address from /place/... segment
  const placeMatches = [...url.matchAll(/\/place\/([^/]+)\/?/g)];
  if (placeMatches.length > 0) {
    // Take the **last /place/** segment as the main place
    const decoded = decodeURIComponent(placeMatches[placeMatches.length - 1][1].replace(/\+/g, ' '));
    const parts = decoded.split(',');
    if (parts.length > 1) {
      name = parts[0].trim();
      address = parts.slice(1).join(',').trim();
    } else {
      name = decoded;
      address = null;
    }
  }

  return {
    latitude,
    longitude,
    name,
    address,
  };
}