import { useMutation, useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { labelsAPI } from './endpoints';
import type {
  Label,
  ConversationLabel,
  LabelsListResponse,
  ConversationLabelsListResponse,
  CreateLabel,
} from './types';

export const useLabels = (
  skip: number,
  limit: number,
): UseQueryResult<LabelsListResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');
  return useQuery({
    queryKey: ['labels', skip, limit],
    queryFn: () => labelsAPI.getLabels(skip, limit),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useConversationLabels = (
  conversationId: number,
  enabled = true,
): UseQueryResult<ConversationLabelsListResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');
  return useQuery({
    queryKey: ['conversationLabels', conversationId],
    queryFn: () => labelsAPI.getConversationLabels(conversationId, 0, 100),
    enabled: hasToken && conversationId > 0 && enabled,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useApplyLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      labelId,
    }: {
      conversationId: number;
      labelId: number;
    }) => labelsAPI.applyLabelToConversation(conversationId, labelId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversationLabels', conversationId] });
    },
  });
};

export const useRemoveLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      labelId,
    }: {
      conversationId: number;
      labelId: number;
    }) => labelsAPI.removeLabelFromConversation(conversationId, labelId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversationLabels', conversationId] });
    },
  });
};

export const useCreateLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabel) => labelsAPI.createLabel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
};
