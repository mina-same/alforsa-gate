import apiClient from '../client';
import {
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    GetUsersParams,
    SearchUsersParams,
    UserInboxesResponse,
} from './types';

/**
 * Users API Endpoints - /api/v1/users
 */

export const usersAPI = {
    /**
     * List all users
     * GET /api/v1/users/
     */
    listUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
        const response = await apiClient.get<UserListResponse>('/v1/users/', { params });
        return response.data;
    },

    /**
     * Create a new user
     * POST /api/v1/users/
     */
    createUser: async (data: UserCreate): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>('/v1/users/', data);
        return response.data;
    },

    /**
     * Get a specific user
     * GET /api/v1/users/{user_id}
     */
    getUser: async (userId: number): Promise<UserResponse> => {
        const response = await apiClient.get<UserResponse>(`/v1/users/${userId}`);
        return response.data;
    },

    /**
     * Update a user
     * PUT /api/v1/users/{user_id}
     */
    updateUser: async (userId: number, data: UserUpdate): Promise<UserResponse> => {
        const response = await apiClient.put<UserResponse>(`/v1/users/${userId}`, data);
        return response.data;
    },

    /**
     * Delete a user
     * DELETE /api/v1/users/{user_id}
     */
    deleteUser: async (userId: number): Promise<void> => {
        await apiClient.delete(`/v1/users/${userId}`);
    },

    /**
     * Activate user
     * POST /api/v1/users/{user_id}/activate
     */
    activateUser: async (userId: number): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(`/v1/users/${userId}/activate`);
        return response.data;
    },

    /**
     * Deactivate user
     * POST /api/v1/users/{user_id}/deactivate
     */
    deactivateUser: async (userId: number): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(`/v1/users/${userId}/deactivate`);
        return response.data;
    },

    /**
     * Get user inboxes
     * GET /api/v1/users/{user_id}/inboxes
     */
    getUserInboxes: async (userId: number): Promise<UserInboxesResponse> => {
        const response = await apiClient.get<UserInboxesResponse>(`/v1/users/${userId}/inboxes`);
        return response.data;
    },

    /**
     * Admin reset password
     * POST /api/v1/users/{user_id}/reset_password
     */
    adminResetPassword: async (userId: number, newPassword: string): Promise<void> => {
        await apiClient.post(`/v1/users/${userId}/reset_password`, { new_password: newPassword });
    },

    /**
     * Self reset password (logged-in user resets own password)
     * POST /api/v1/users/me/reset_password
     */
    selfResetPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        await apiClient.post('/v1/users/me/reset_password', { current_password: currentPassword, new_password: newPassword });
    },

    /**
     * Get user permissions
     * GET /api/v1/users/{user_id}/permissions
     */
    getPermissions: async (userId: number): Promise<{ role: string; permissions: string[] }> => {
        const response = await apiClient.get(`/v1/users/${userId}/permissions`);
        return response.data;
    },

    /**
     * Search users (Fallback - not in current spec provided but might be present)
     * GET /api/v1/users/search/
     */
    searchUsers: async (params: SearchUsersParams): Promise<UserResponse[]> => {
        const response = await apiClient.get<UserResponse[]>('/v1/users/search/', { params });
        return response.data;
    },
};
