import apiClient from '../client';
import {
  ContactTags,
  ContactTagsListResponse,
  CreateContactTag,
} from './types';

/**
 * Tags API Endpoints - /api/v1/contact-tags
 */

export const tagsAPI = {
  /**
   * Get contact tags
   * GET /api/v1/contact-tags
   */
  getContactTags: async (skip: number, limit: number): Promise<ContactTagsListResponse> => {
    const response = await apiClient.get<ContactTagsListResponse>(`/v1/contact-tags/`, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get contact tag by ID
   * GET /api/v1/contact-tags/{tag_id}
   */
  getContactTagById: async (tagId: number): Promise<ContactTags> => {
    const response = await apiClient.get<ContactTags>(`/v1/contact-tags/${tagId}`);
    return response.data;
  },

  /**
   * Create contact tag
   * POST /api/v1/contact-tags/
   */
  createContactTag: async (data: CreateContactTag): Promise<ContactTags> => {
    const response = await apiClient.post<ContactTags>(`/v1/contact-tags/`, data);
    return response.data;
  },
};
