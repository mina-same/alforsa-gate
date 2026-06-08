import apiClient from '../client';
import { MediaUploadResponse } from './types';

/**
 * Media API Endpoints - /api/v1/media
 */

// Base URL for constructing full media URLs
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const MEDIA_BASE_URL = isLocalhost
  ? (import.meta.env.VITE_API_URL_MEDIA)
  : window.location.origin;

export const mediaAPI = {
  /**
   * Upload media file
   * POST /api/v1/media/upload
   */
  uploadMedia: async (file: File, onProgress?: (percent: number) => void): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<MediaUploadResponse>('/v1/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      
      // Construct full URL if the response contains a relative path
      const data = response.data;
      if (data.url && !data.url.startsWith('http')) {
        data.url = `${MEDIA_BASE_URL}${data.url}`;
      }
      
      return data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 413) {
        throw new Error('File is too large. Please choose a smaller file.');
      }
      throw error;
    }
  },
};
