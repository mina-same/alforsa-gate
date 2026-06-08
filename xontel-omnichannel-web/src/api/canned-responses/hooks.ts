import { useMutation, useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { cannedResponsesAPI } from './endpoints';
import {
    CannedResponseCreate,
    CannedResponseUpdate,
    CannedResponseResponse,
    GetCannedResponsesParams,
    SearchCannedResponsesParams,
    CannedResponsesListResponse,
} from './types';

/**
 * Canned Responses API Hooks using React Query
 */

/**
 * List canned responses hook
 */
export const useCannedResponses = (params?: GetCannedResponsesParams): UseQueryResult<CannedResponsesListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['canned-responses', params],
        queryFn: () => cannedResponsesAPI.listCannedResponses(params),
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Search canned responses hook
 */
export const useSearchCannedResponses = (params: SearchCannedResponsesParams, enabled: boolean = true): UseQueryResult<CannedResponsesListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['canned-responses', 'search', params.q, params.limit],
        queryFn: () => {
            if (!params.q) {
                return cannedResponsesAPI.listCannedResponses({ limit: params.limit });
            }
            return cannedResponsesAPI.searchCannedResponses(params);
        },
        enabled: hasToken && enabled,
        staleTime: 1 * 60 * 1000,
    });
};

/**
 * Create canned response hook
 */
export const useCreateCannedResponse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CannedResponseCreate) => cannedResponsesAPI.createCannedResponse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canned-responses'] });
        },
    });
};

/**
 * Update canned response hook
 */
export const useUpdateCannedResponse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CannedResponseUpdate }) =>
            cannedResponsesAPI.updateCannedResponse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canned-responses'] });
        },
    });
};

/**
 * Delete canned response hook
 */
export const useDeleteCannedResponse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cannedResponsesAPI.deleteCannedResponse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canned-responses'] });
        },
    });
};
