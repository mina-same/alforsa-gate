import { useMutation, useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { tagsAPI } from './endpoints';
import type { MessageCreate, MessageResponse, MessageUpdate } from '../messages/types';
import type { ContactTags, ContactTagsListResponse, CreateContactTag } from './types';

export const useContactTags = (skip: number, limit: number): UseQueryResult<ContactTagsListResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: ['contactTags', skip, limit],
    queryFn: () => tagsAPI.getContactTags(skip, limit),
    enabled: hasToken,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useContactTagById = (tagId: number): UseQueryResult<ContactTags, Error> => {
  const hasToken = !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: ['contactTag', tagId],
    queryFn: () => tagsAPI.getContactTagById(tagId),
    enabled: hasToken && tagId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateContactTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactTag) => tagsAPI.createContactTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactTags'] });
    },
  });
};



