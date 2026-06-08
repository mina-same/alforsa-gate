import { useState, useEffect, useCallback } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied'

interface UseNotificationPermissionReturn {
    permission: NotificationPermission
    requestPermission: () => Promise<NotificationPermission>
    isSupported: boolean
    sendNotification: (title: string, options?: NotificationOptions) => void
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        // Check if notifications are supported
        if ('Notification' in window) {
            setIsSupported(true)
            setPermission(Notification.permission as NotificationPermission)
        }
    }, [])

    const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            console.warn('Notifications are not supported in this browser')
            return 'denied'
        }

        try {
            const result = await Notification.requestPermission()
            setPermission(result as NotificationPermission)

            // Store permission in localStorage
            localStorage.setItem('notification-permission-requested', 'true')

            return result as NotificationPermission
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return 'denied'
        }
    }, [isSupported])

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!isSupported) {
            console.warn('Notifications are not supported')
            return
        }

        if (permission !== 'granted') {
            console.warn('Notification permission not granted')
            return
        }

        try {
            // If service worker is available, use it for better reliability
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(title, {
                        icon: '/icons/icon-telsip.svg',
                        badge: '/icons/icon-telsip.svg',
                        ...options,
                    })
                })
            } else {
                // Fallback to regular notification
                new Notification(title, {
                    icon: '/icons/icon-telsip.svg',
                    badge: '/icons/icon-telsip.svg',
                    ...options,
                })
            }
        } catch (error) {
            console.error('Error sending notification:', error)
        }
    }, [isSupported, permission])

    return {
        permission,
        requestPermission,
        isSupported,
        sendNotification,
    }
}
