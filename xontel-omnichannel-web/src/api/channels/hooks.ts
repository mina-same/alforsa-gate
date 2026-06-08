import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { channelsAPI } from './endpoints';
import { ChannelResponse } from './types';

/**
 * Hook to fetch a specific channel by its ID
 */
export const useChannel = (channelId: number): UseQueryResult<ChannelResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: ['channels', channelId],
    queryFn: () => channelsAPI.getChannel(channelId),
    enabled: hasToken && !!channelId,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes as channel info changes rarely
  });
};
