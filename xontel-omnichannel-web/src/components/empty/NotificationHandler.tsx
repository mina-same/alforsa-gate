import { useSystemNotifications } from '@/hooks/useSystemNotifications';

export function useNotificationHandler() {
  const {
    isSupported: isNotificationsSupported,
    permission: notificationPermission,
    isLoading: isRequestingNotificationPermission,
    requestPermission: requestNotificationPermission,
  } = useSystemNotifications();

  const handleAllowNotifications = async () => {
    if (!isNotificationsSupported) return;
    if (notificationPermission !== 'default') return;

    localStorage.setItem('notification-permission-requested', 'true');
    await requestNotificationPermission();
  };

  return {
    isNotificationsSupported,
    notificationPermission,
    isRequestingNotificationPermission,
    handleAllowNotifications,
  };
}
