import { useMutation } from '@tanstack/react-query';
import { mediaAPI } from './endpoints';
import { MediaUploadResponse } from './types';

/**
 * Media API Hooks using React Query
 */

/**
 * Upload media file hook
 */
export const useUploadMedia = () => {
  return useMutation<MediaUploadResponse, Error, { file: File; onProgress?: (percent: number) => void }>({
    mutationFn: ({ file, onProgress }) => mediaAPI.uploadMedia(file, onProgress),
  });
};
