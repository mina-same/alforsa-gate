import { useMutation, useQuery, useInfiniteQuery, useQueries, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { contactsAPI } from './endpoints';
import {
  ContactCreate,
  ContactUpdate,
  ContactResponse,
  GetContactsParams,
  PaginatedContactsResponse,
} from './types';

/**
 * Contacts API Hooks using React Query
 */

/**
 * Create contact
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactCreate) => contactsAPI.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

/**
 * List contacts
 */
export const useContacts = (params?: GetContactsParams): UseQueryResult<PaginatedContactsResponse, Error> => {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsAPI.listContacts(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * List contacts with infinite scroll
 */
export const useInfiniteContacts = (params?: Omit<GetContactsParams, 'skip'>) => {
  const limit = params?.limit ?? 20;
  return useInfiniteQuery({
    queryKey: ['contacts', 'infinite', params],
    queryFn: ({ pageParam }) =>
      contactsAPI.listContacts({ ...params, skip: pageParam as number, limit }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.contacts.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get contact stats
 */
export const useContactStats = () => {
  return useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsAPI.getContactStats(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get multiple contacts by IDs hook
 */
export const useContactsByIds = (contactIds: number[]): { data: ContactResponse[]; isLoading: boolean } => {
  const results = useQueries({
    queries: contactIds.map((id) => ({
      queryKey: ['contacts', id] as const,
      queryFn: () => contactsAPI.getContact(id),
      enabled: id > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // isLoading is only true when there are IDs we have NO data for yet (first fetch for that ID).
  // IDs that are already cached return immediately — don't count as loading.
  const isLoading = results.some((r) => r.isLoading && !r.data);
  const data = results.reduce<ContactResponse[]>((acc, r) => {
    if (r.data) acc.push(r.data);
    return acc;
  }, []);

  return { data, isLoading };
};

/**
 * Get contact by ID
 */
export const useContact = (contactId: number): UseQueryResult<ContactResponse, Error> => {
  return useQuery({
    queryKey: ['contacts', contactId],
    queryFn: () => contactsAPI.getContact(contactId),
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Update contact
 */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: number; data: ContactUpdate }) =>
      contactsAPI.updateContact(contactId, data),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

/**
 * Delete contact
 */
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: number) => contactsAPI.deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

/**
 * Block contact
 */
export const useBlockContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: number) => contactsAPI.blockContact(contactId),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === 'conversations',
      });
    },
  });
};

/**
 * Unblock contact
 */
export const useUnblockContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: number) => contactsAPI.unblockContact(contactId),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === 'conversations',
      });
    },
  });
};

/**
 * Add tag to contact
 */
export const useAddTagToContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: number; tagId: number }) =>
      contactsAPI.addTagToContact(contactId, tagId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
};

/**
 * Remove tag from contact
 */
export const useRemoveTagFromContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: number; tagId: number }) =>
      contactsAPI.removeTagFromContact(contactId, tagId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
};

/**
 * Get all blocked contacts
 */
export const useBlockedContacts = () => {
  return useQuery({
    queryKey: ['contacts', 'blocked'],
    queryFn: () => contactsAPI.listContacts({ is_blocked: true, limit: 200 }),
    staleTime: 30 * 1000,
  });
};

/**
 * Update contact custom fields
 */
export const useUpdateCustomFields = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, customFields }: { contactId: number; customFields: Record<string, any> }) =>
      contactsAPI.updateCustomFields(contactId, customFields),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
};
