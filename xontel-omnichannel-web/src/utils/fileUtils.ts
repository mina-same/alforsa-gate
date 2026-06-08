/**
 * Utility functions for file handling and filename generation
 */

/**
 * Get file extension from MIME type
 */
export const getFileExtension = (mime: string, fallbackName: string = 'file'): string => {
  // Audio formats
  if (mime.startsWith('audio/mp4')) return 'm4a';
  if (mime.startsWith('audio/ogg')) return 'ogg';
  if (mime.startsWith('audio/webm')) return 'webm';
  if (mime.startsWith('audio/mp3')) return 'mp3';
  if (mime.startsWith('audio/wav')) return 'wav';
  if (mime.startsWith('audio/flac')) return 'flac';

  // Image formats
  if (mime.startsWith('image/jpeg')) return 'jpg';
  if (mime.startsWith('image/png')) return 'png';
  if (mime.startsWith('image/gif')) return 'gif';
  if (mime.startsWith('image/webp')) return 'webp';
  if (mime.startsWith('image/svg')) return 'svg';
  if (mime.startsWith('image/bmp')) return 'bmp';
  if (mime.startsWith('image/tiff')) return 'tiff';

  // Video formats
  if (mime.startsWith('video/mp4')) return 'mp4';
  if (mime.startsWith('video/webm')) return 'webm';
  if (mime.startsWith('video/quicktime')) return 'mov';
  if (mime.startsWith('video/x-msvideo')) return 'avi';
  if (mime.startsWith('video/x-matroska')) return 'mkv';

  // Document formats
  if (mime.startsWith('application/pdf')) return 'pdf';
  if (mime.startsWith('application/msword')) return 'doc';
  if (mime.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
  if (mime.startsWith('application/vnd.ms-excel')) return 'xls';
  if (mime.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return 'xlsx';
  if (mime.startsWith('application/vnd.ms-powerpoint')) return 'ppt';
  if (mime.startsWith('application/vnd.openxmlformats-officedocument.presentationml.presentation')) return 'pptx';
  if (mime.startsWith('text/plain')) return 'txt';
  if (mime.startsWith('text/csv')) return 'csv';

  // Archive formats
  if (mime.startsWith('application/zip')) return 'zip';
  if (mime.startsWith('application/x-rar-compressed')) return 'rar';
  if (mime.startsWith('application/x-7z-compressed')) return '7z';

  // Fallback: try to extract from original filename or use generic
  return fallbackName.includes('.') ? fallbackName.split('.').pop() || 'bin' : 'bin';
};

/**
 * Generate unique filename with timestamp
 */
export const generateUniqueFilename = (originalName: string, mimeType: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = getFileExtension(mimeType, originalName);
  const baseName = originalName.includes('.')
    ? originalName.substring(0, originalName.lastIndexOf('.'))
    : originalName;

  // Sanitize base name: remove special characters, replace spaces with underscores
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50); // Limit length

  return `${sanitizedBaseName}-${timestamp}.${extension}`;
};
