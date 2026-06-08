import { useMemo } from 'react';
import { useUsersByIds } from '@/api/users/hooks';

/**
 * Get the other user in a direct message conversation
 * Filters out the current user from user_ids array and returns the other user
 */
export const useDirectMessageOtherUser = (
  conversation: any,
  currentUserId?: number
) => {
  // Filter to get the other user ID
  const otherUserId = useMemo(() => {
    if (
      !conversation?.user_ids ||
      !Array.isArray(conversation.user_ids) ||
      conversation.user_ids.length === 0 ||
      !currentUserId
    ) {
      return undefined;
    }

    const filteredIds = conversation.user_ids.filter(
      (id: number) => Number(id) !== Number(currentUserId)
    );

    return filteredIds.length > 0 ? filteredIds[0] : undefined;
  }, [conversation?.user_ids, currentUserId]);

  // Fetch the other user data
  const { data: users = [] } = useUsersByIds(
    otherUserId ? [otherUserId] : []
  );

  const otherUser = users.length > 0 ? users[0] : undefined;

  return {
    otherUserId,
    otherUser,
    name: otherUser?.full_name || undefined,
    avatar: otherUser?.avatar_url || undefined,
  };
};
