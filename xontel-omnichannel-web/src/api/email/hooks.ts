import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailAPI } from './endpoints';
import { GetEmailMessagesParams, EmailSendRequest, EmailChannel, EmailChannelListResponse } from './types';

export const EMAIL_KEYS = {
  all: ['email'] as const,
  messages: (params: GetEmailMessagesParams) => [...EMAIL_KEYS.all, 'messages', params] as const,
  message: (id: number) => [...EMAIL_KEYS.all, 'message', id] as const,
  unread: () => [...EMAIL_KEYS.all, 'unread'] as const,
  channels: () => [...EMAIL_KEYS.all, 'channels'] as const,
};

export const useEmailMessages = (params: GetEmailMessagesParams = {}) => {
  return useQuery({
    queryKey: EMAIL_KEYS.messages(params),
    queryFn: () => emailAPI.listEmailMessages(params),
  });
};

export const useEmailMessage = (id: number) => {
  return useQuery({
    queryKey: EMAIL_KEYS.message(id),
    queryFn: () => emailAPI.getEmailMessage(id),
    enabled: !!id,
  });
};

export const useUnreadEmails = () => {
  return useQuery({
    queryKey: EMAIL_KEYS.unread(),
    queryFn: () => emailAPI.getUnreadEmailMessages(),
  });
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emailAPI.sendEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.all });
    },
  });
};

export const useMarkEmailAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emailAPI.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.message(id) });
    },
  });
};

export const useReplyToEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ message_id, data }: { message_id: number; data: EmailSendRequest }) =>
      emailAPI.replyToEmail(message_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.all });
    },
  });
};

export const useForwardEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ message_id, data }: { message_id: number; data: EmailSendRequest }) =>
      emailAPI.forwardEmail(message_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.all });
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emailAPI.deleteEmailMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_KEYS.all });
    },
  });
};

export const useEmailChannels = () => {
  return useQuery({
    queryKey: EMAIL_KEYS.channels(),
    queryFn: () => emailAPI.getEmailChannels({ skip: 0, limit: 100 }),
    select: (data: EmailChannelListResponse) => {
      // Filter for email channels only and return the items array
      return data.items.filter((channel: EmailChannel) => channel.channel_type === 'email');
    },
  });
};

/**
 * Track email open
 */
export const useTrackEmailOpen = () => {
  return useMutation({
    mutationFn: emailAPI.trackEmailOpen,
  });
};

/**
 * Track email click
 */
export const useTrackEmailClick = () => {
  return useMutation({
    mutationFn: emailAPI.trackEmailClick,
  });
};
