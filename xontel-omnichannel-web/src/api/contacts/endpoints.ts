import apiClient from '../client';
import {
  ContactCreate,
  ContactUpdate,
  ContactResponse,
  GetContactsParams,
  PaginatedContactsResponse,
} from './types';

/**
 * Contacts API Endpoints - /api/v1/contacts
 */

export const contactsAPI = {
  /**
   * Create contact
   * POST /api/v1/contacts/
   */
  createContact: async (data: ContactCreate): Promise<ContactResponse> => {
    const response = await apiClient.post<ContactResponse>('/v1/contacts/', data);
    return response.data;
  },

  /**
   * List contacts
   * GET /api/v1/contacts/
   */
  listContacts: async (params?: GetContactsParams): Promise<PaginatedContactsResponse> => {
    const response = await apiClient.get<PaginatedContactsResponse>('/v1/contacts/', { params });
    return response.data;
  },

  /**
   * Get contact stats
   * GET /api/v1/contacts/stats
   */
  getContactStats: async (): Promise<any> => {
    const response = await apiClient.get('/v1/contacts/stats');
    return response.data;
  },

  /**
   * Get contact by ID
   * GET /api/v1/contacts/{contact_id}
   */
  getContact: async (contactId: number): Promise<ContactResponse> => {
    const response = await apiClient.get<ContactResponse>(`/v1/contacts/${contactId}`);
    return response.data;
  },

  /**
   * Update contact
   * PUT /api/v1/contacts/{contact_id}
   */
  updateContact: async (contactId: number, data: ContactUpdate): Promise<ContactResponse> => {
    const response = await apiClient.put<ContactResponse>(`/v1/contacts/${contactId}`, data);
    return response.data;
  },

  /**
   * Delete contact
   * DELETE /api/v1/contacts/{contact_id}
   */
  deleteContact: async (contactId: number): Promise<void> => {
    await apiClient.delete(`/v1/contacts/${contactId}`);
  },

  /**
   * Block contact
   * POST /api/v1/contacts/{contact_id}/block
   */
  blockContact: async (contactId: number): Promise<ContactResponse> => {
    const response = await apiClient.post<ContactResponse>(`/v1/contacts/${contactId}/block`);
    return response.data;
  },

  /**
   * Unblock contact
   * POST /api/v1/contacts/{contact_id}/unblock
   */
  unblockContact: async (contactId: number): Promise<ContactResponse> => {
    const response = await apiClient.post<ContactResponse>(`/v1/contacts/${contactId}/unblock`);
    return response.data;
  },

  /**
   * Add tag to contact
   * POST /api/v1/contacts/{contact_id}/tags/{tag}
   */
  addTagToContact: async (contactId: number, tagId: number): Promise<ContactResponse> => {
    const response = await apiClient.post<ContactResponse>(`/v1/contacts/${contactId}/tags/${tagId}`);
    return response.data;
  },

  /**
   * Remove tag from contact
   * DELETE /api/v1/contacts/{contact_id}/tags/{tag}
   */
  removeTagFromContact: async (contactId: number, tagId: number): Promise<ContactResponse> => {
    const response = await apiClient.delete<ContactResponse>(`/v1/contacts/${contactId}/tags/${tagId}`);
    return response.data;
  },

  /**
   * Update contact custom fields
   * PUT /api/v1/contacts/{contact_id}/custom-fields
   */
  updateCustomFields: async (contactId: number, customFields: Record<string, any>): Promise<ContactResponse> => {
    const response = await apiClient.put<ContactResponse>(
      `/v1/contacts/${contactId}/custom-fields`,
      { custom_fields: customFields }
    );
    return response.data;
  },
};
