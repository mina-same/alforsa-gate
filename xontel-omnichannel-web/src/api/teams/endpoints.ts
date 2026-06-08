import apiClient from '../client';
import {
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberResponse,
    GetTeamsParams,
    TeamsListResponse,
} from './types';

/**
 * Teams API Endpoints - /api/v1/teams
 */

export const teamsAPI = {
    /**
     * List all teams
     * GET /api/v1/teams/
     */
    listTeams: async (params?: GetTeamsParams): Promise<TeamsListResponse> => {
        const response = await apiClient.get<TeamsListResponse>('/v1/teams/', { params });
        return response.data;
    },

    /**
     * Create a new team
     * POST /api/v1/teams/
     */
    createTeam: async (data: TeamCreate): Promise<TeamResponse> => {
        const response = await apiClient.post<TeamResponse>('/v1/teams/', data);
        return response.data;
    },

    /**
     * Get a specific team
     * GET /api/v1/teams/{team_id}
     */
    getTeam: async (teamId: number): Promise<TeamResponse> => {
        const response = await apiClient.get<TeamResponse>(`/v1/teams/${teamId}/`);
        return response.data;
    },

    /**
     * Update a team
     * PUT /api/v1/teams/{team_id}
     */
    updateTeam: async (teamId: number, data: TeamUpdate): Promise<TeamResponse> => {
        const response = await apiClient.put<TeamResponse>(`/v1/teams/${teamId}/`, data);
        return response.data;
    },

    /**
     * Delete a team
     * DELETE /api/v1/teams/{team_id}
     */
    deleteTeam: async (teamId: number): Promise<void> => {
        await apiClient.delete(`/v1/teams/${teamId}/`);
    },

    /**
     * List team members
     * GET /api/v1/teams/{team_id}/members
     */
    getTeamMembers: async (teamId: number): Promise<TeamMemberResponse[]> => {
        const response = await apiClient.get<TeamMemberResponse[]>(`/v1/teams/${teamId}/members/`);
        return response.data;
    },

    /**
     * Add member to team
     * POST /api/v1/teams/{team_id}/members
     */
    addTeamMember: async (teamId: number, data: { user_id: number; role?: string }): Promise<TeamMemberResponse> => {
        const response = await apiClient.post<TeamMemberResponse>(`/v1/teams/${teamId}/members/`, data);
        return response.data;
    },

    /**
     * Remove member from team
     * DELETE /api/v1/teams/{team_id}/members/{user_id}
     */
    removeTeamMember: async (teamId: number, userId: number): Promise<void> => {
        await apiClient.delete(`/v1/teams/${teamId}/members/${userId}/`);
    },
};
