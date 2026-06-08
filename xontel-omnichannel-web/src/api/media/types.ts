/**
 * Media API Types
 */

export interface MediaUploadResponse {
  url: string;
  file_name: string;
  file_size: number;
  content_type: string;
  [key: string]: any;
}
