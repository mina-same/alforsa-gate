import { useMutation, useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { teamsAPI } from './endpoints';
import {
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberResponse,
    GetTeamsParams,
    TeamsListResponse,
} from './types';

/**
 * Teams API Hooks using React Query
 */

/**
 * List teams hook
 */
export const useTeams = (params?: GetTeamsParams): UseQueryResult<TeamsListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['teams', params],
        queryFn: () => teamsAPI.listTeams(params),
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Get single team hook
 */
export const useTeam = (teamId: number): UseQueryResult<TeamResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['teams', teamId],
        queryFn: () => teamsAPI.getTeam(teamId),
        enabled: hasToken && !!teamId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Create team hook
 */
export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TeamCreate) => teamsAPI.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });
};

/**
 * Update team hook
 */
export const useUpdateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TeamUpdate }) =>
            teamsAPI.updateTeam(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['teams', id] });
        },
    });
};

/**
 * Delete team hook
 */
export const useDeleteTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => teamsAPI.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });
};

/**
 * Team members hook
 */
export const useTeamMembers = (teamId: number): UseQueryResult<TeamMemberResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['teams', teamId, 'members'],
        queryFn: () => teamsAPI.getTeamMembers(teamId),
        enabled: hasToken && !!teamId,
        staleTime: 5 * 60 * 1000,
    });
};
