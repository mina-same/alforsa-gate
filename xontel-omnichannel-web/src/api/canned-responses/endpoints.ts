import apiClient from '../client';
import {
    CannedResponseCreate,
    CannedResponseUpdate,
    CannedResponseResponse,
    GetCannedResponsesParams,
    SearchCannedResponsesParams,
    CannedResponsesListResponse,
} from './types';

/**
 * Canned Responses API Endpoints - /api/v1/canned-responses
 */

export const cannedResponsesAPI = {
    /**
     * Create a new canned response
     * POST /api/v1/canned-responses/
     */
    createCannedResponse: async (data: CannedResponseCreate): Promise<CannedResponseResponse> => {
        const response = await apiClient.post<CannedResponseResponse>('/v1/canned-responses/', data);
        return response.data;
    },

    /**
     * List all canned responses
     * GET /api/v1/canned-responses/
     */
    listCannedResponses: async (params?: GetCannedResponsesParams): Promise<CannedResponsesListResponse> => {
        // Note the trailing slash as observed in other working endpoints
        const response = await apiClient.get<CannedResponsesListResponse>('/v1/canned-responses/', { params });
        return response.data;
    },

    /**
     * Search canned responses
     * GET /api/v1/canned-responses/search
     */
    searchCannedResponses: async (params: SearchCannedResponsesParams): Promise<CannedResponsesListResponse> => {
        const response = await apiClient.get<CannedResponsesListResponse>('/v1/canned-responses/search', { params });
        return response.data;
    },

    /**
     * Get a specific canned response
     * GET /api/v1/canned-responses/{response_id}
     */
    getCannedResponse: async (responseId: number): Promise<CannedResponseResponse> => {
        const response = await apiClient.get<CannedResponseResponse>(`/v1/canned-responses/${responseId}/`);
        return response.data;
    },

    /**
     * Update a canned response
     * PUT /api/v1/canned-responses/{response_id}
     */
    updateCannedResponse: async (responseId: number, data: CannedResponseUpdate): Promise<CannedResponseResponse> => {
        const response = await apiClient.put<CannedResponseResponse>(`/v1/canned-responses/${responseId}/`, data);
        return response.data;
    },

    /**
     * Delete a canned response
     * DELETE /api/v1/canned-responses/{response_id}
     */
    deleteCannedResponse: async (responseId: number): Promise<void> => {
        await apiClient.delete(`/v1/canned-responses/${responseId}/`);
    },
};
